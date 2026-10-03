import {env} from 'cloudflare:workers';
import {database,ApiError,body,reply} from './server';
import {newToken,passwordHash,passwordMatches,tokenHash} from './password';
import {citizens} from './demo';

export type Account={id:string;name:string;mobile:string;role:'citizen'|'admin';citizenId?:string};
const COOKIE='govsync_session';
const sessionAge=8*60*60;
// Sample-citizen accounts use the id 'demo:<citizenId>'. The client uses citizenId to pre-select and lock the applicant.
const safeUser=(row:any):Account=>({id:row.id,name:row.name,mobile:row.role==='admin'?row.mobile.replace(/^admin:/,''):row.mobile,role:row.role,...(String(row.id).startsWith('demo:')?{citizenId:String(row.id).slice(5)}:{})});
// Sample-citizen sign-in is on by default for demonstrations. Set GOVSYNC_DEMO_LOGIN=off to disable it.
const demoLoginOn=()=>!['off','false','0'].includes(String((env as unknown as Record<string,string>).GOVSYNC_DEMO_LOGIN||'').toLowerCase());
export function sameOrigin(request:Request){
 if(request.method==='GET'||request.method==='HEAD')return;
 const origin=request.headers.get('origin');
 if(origin!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new ApiError(403,'This request must come from your workspace.');
}
function cookieToken(request:Request){return request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)||'';}
function cookie(request:Request,token:string,age=sessionAge){return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${age}${new URL(request.url).protocol==='https:'?'; Secure':''}`;}
export async function account(request:Request):Promise<Account>{
 sameOrigin(request);
 const token=cookieToken(request);
 if(!/^[a-f0-9]{64}$/.test(token))throw new ApiError(401,'Please sign in to continue.');
 const row=await database().prepare('SELECT u.id,u.name,u.mobile,u.role,u.password_hash FROM auth_sessions s JOIN auth_users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?').bind(tokenHash(token),Date.now()).first<any>();
 if(!row)throw new ApiError(401,'Please sign in to continue.');
 if(row.role==='admin'){const provisioned=configuredAdmin();if(!provisioned||provisioned.id!==row.id||provisioned.mobile!==safeUser(row).mobile||provisioned.password_hash!==row.password_hash)throw new ApiError(401,'Please sign in to continue.');}
 return safeUser(row);
}
function configuredAdmin(){
 const raw=(env as unknown as Record<string,string>).GOVSYNC_ADMIN_ACCOUNT;
 if(!raw)return null;
 try{const a=JSON.parse(raw);if(a.id&&/^[6-9][0-9]{9}$/.test(a.mobile)&&a.name&&a.password_hash)return a;}catch{}
 throw new Error('Invalid administrator configuration');
}
async function throttle(request:Request,mobile:string){
 const db=database(),window=Math.floor(Date.now()/900000),ip=request.headers.get('cf-connecting-ip')||'local';
 for(const [value,limit] of [[`mobile:${mobile}`,10],[`ip:${ip}`,60]] as const){
  const key=tokenHash(value+':'+window);
  const r=await db.prepare('INSERT INTO auth_limits (key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key,(window+1)*900000).first<{count:number}>();
  if(r&&r.count>limit)throw new ApiError(429,'Too many attempts. Please try again in 15 minutes.');
 }
 await db.prepare('DELETE FROM auth_limits WHERE expires_at < ?').bind(Date.now()-900000).run();
}
async function signedIn(request:Request,user:Account,extra:Record<string,unknown>={}){
 const token=newToken(),db=database();
 await db.batch([
  db.prepare('DELETE FROM auth_sessions WHERE expires_at < ? OR token_hash=?').bind(Date.now(),tokenHash(cookieToken(request))),
  db.prepare('INSERT INTO auth_sessions (token_hash,user_id,expires_at) VALUES (?,?,?)').bind(tokenHash(token),user.id,Date.now()+sessionAge*1000)
 ]);
 return Response.json({user,...extra},{headers:{'Cache-Control':'no-store','Set-Cookie':cookie(request,token)}});
}
export async function authRoute(request:Request,action:string){
 sameOrigin(request);
 if(request.method==='GET'&&action==='session')return reply({user:await account(request)});
 if(request.method!=='POST')throw new ApiError(405,'Method not allowed.');
 const db=database();
 if(action==='logout'){
  await db.prepare('DELETE FROM auth_sessions WHERE token_hash=?').bind(tokenHash(cookieToken(request))).run();
  return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':cookie(request,'',0)}});
 }
 if(action==='demo'){
  if(!demoLoginOn())throw new ApiError(403,'Sample citizen sign-in is turned off.');
  const data=await body(request),citizen=citizens.find(c=>c.id===data.citizenId);
  if(!citizen)throw new ApiError(400,'Choose one of the sample citizens.');
  // The account has a random password nobody knows and a mobile value the sign-in form rejects, so it can only be reached through this button.
  const id='demo:'+citizen.id,mobile='demo-'+citizen.id.toLowerCase();
  const existing=await db.prepare('SELECT * FROM auth_users WHERE id=?').bind(id).first<any>();
  if(!existing)await db.prepare('INSERT INTO auth_users (id,name,mobile,role,password_hash,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT DO NOTHING').bind(id,citizen.name,mobile,'citizen',passwordHash(newToken()),Date.now()).run();
  return signedIn(request,safeUser(existing||{id,name:citizen.name,mobile,role:'citizen'}));
 }
 const data=await body(request),mobile=String(data.mobile||'').replace(/[०-९]/g,c=>String(c.charCodeAt(0)-0x966)).replace(/\s/g,'');
 if(!/^[6-9][0-9]{9}$/.test(mobile))throw new ApiError(400,'Enter a valid 10-digit Indian mobile number.');
 if(typeof data.password!=='string'||data.password.length<12||data.password.length>128)throw new ApiError(400,'Use a password between 12 and 128 characters.');
 await throttle(request,mobile);
 const admin=configuredAdmin();
 if(action==='register'){
  const name=typeof data.name==='string'?data.name.trim():'';
  if(name.length<2||name.length>80)throw new ApiError(400,'Enter your name (2–80 characters).');
  if(data.role&&data.role!=='citizen')throw new ApiError(403,'Administrator accounts are issued by the project owner.');
  if(mobile===admin?.mobile)throw new ApiError(409,'This mobile number cannot be registered. Try signing in.');
  const user:Account={id:crypto.randomUUID(),name,mobile,role:'citizen'},recoveryCode=newToken();
  const saved=await db.prepare('INSERT INTO auth_users (id,name,mobile,role,password_hash,recovery_hash,created_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT(mobile) DO NOTHING').bind(user.id,name,mobile,'citizen',passwordHash(data.password),tokenHash(recoveryCode),Date.now()).run();
  if(!saved.meta.changes)throw new ApiError(409,'This mobile number cannot be registered. Try signing in.');
  return signedIn(request,user,{recoveryCode});
 }
 if(action==='login'){
  if(!['citizen','admin'].includes(data.role))throw new ApiError(400,'Choose an account type.');
  if(data.role==='admin'){
   if(!admin||mobile!==admin.mobile||!passwordMatches(data.password,admin.password_hash))throw new ApiError(401,'Mobile number, password or account type is incorrect.');
   await db.prepare('DELETE FROM auth_sessions WHERE user_id=? AND EXISTS (SELECT 1 FROM auth_users WHERE id=? AND password_hash<>?)').bind(admin.id,admin.id,admin.password_hash).run();
   // Owner-provisioned credentials are never returned to the client or checked into source.
   await db.prepare('INSERT INTO auth_users (id,name,mobile,role,password_hash,created_at) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,mobile=excluded.mobile,password_hash=excluded.password_hash').bind(admin.id,admin.name,'admin:'+admin.mobile,'admin',admin.password_hash,Date.now()).run();
  }
  const row=await db.prepare('SELECT * FROM auth_users WHERE mobile=? AND role=?').bind(data.role==='admin'?'admin:'+mobile:mobile,data.role).first<any>();
  const valid=passwordMatches(data.password,row?.password_hash||passwordHash('unavailable-account-password','00000000000000000000000000000000'));
  if(!valid||row?.role!==data.role)throw new ApiError(401,'Mobile number, password or account type is incorrect.');
  return signedIn(request,safeUser(row));
 }
 if(action==='recover'){
  const row=await db.prepare('SELECT * FROM auth_users WHERE mobile=? AND role=?').bind(mobile,'citizen').first<any>();
  if(typeof data.recoveryCode!=='string'||!row?.recovery_hash||row.recovery_hash!==tokenHash(data.recoveryCode.trim()))throw new ApiError(400,'The mobile number or recovery code is incorrect.');
  const code=newToken(),changed=await db.prepare('UPDATE auth_users SET password_hash=?,recovery_hash=? WHERE id=? AND recovery_hash=? RETURNING id').bind(passwordHash(data.password),tokenHash(code),row.id,row.recovery_hash).first();
  if(!changed)throw new ApiError(400,'The mobile number or recovery code is incorrect.');
  await db.prepare('DELETE FROM auth_sessions WHERE user_id=?').bind(row.id).run();
  return signedIn(request,safeUser(row),{recoveryCode:code});
 }
 throw new ApiError(404,'API endpoint not found.');
}
