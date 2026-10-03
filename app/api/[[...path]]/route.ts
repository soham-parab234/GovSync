import {account,authRoute} from '@/lib/auth';
import {allDepartments,citizens,sampleRecord,normalize,assess,serviceDepartments,type Department,type Service} from '@/lib/demo';
import {assessResidence,trackedStatuses} from '@/lib/residence';
import {database,application,consent,event,body,reply,guarded,ApiError} from '@/lib/server';
export const dynamic='force-dynamic';
const serviceOf=(app:any):Service=>app.service==='residence'?'residence':'scholarship';
async function recordsFor(app:any) {
 const rows=await database().prepare('SELECT department,normalized FROM checks WHERE application_id = ?').bind(app.id).all<any>();
 if(!serviceDepartments[serviceOf(app)].every(d=>rows.results.some(r=>r.department===d)))throw new ApiError(409,'Complete all required department checks first.');
 return Object.fromEntries(rows.results.map(r=>[r.department,JSON.parse(r.normalized)]));
}
export async function GET(request:Request){return guarded(async()=>{
 const url=new URL(request.url),path=url.pathname.replace(/^\/api\/?/,'').split('/'),db=database();
 if(path[0]==='auth')return authRoute(request,path[1]);
 const actor=await account(request),user=actor.id;
 if(path[0]==='admin'&&path[1]==='mappings'&&path[2]){
  if(actor.role!=='admin')throw new ApiError(403,'Only administrators can view submitted application mappings.');
  const app=await db.prepare("SELECT id,name,citizen_id,service,status FROM applications WHERE id=? AND status IN ('submitted','clarification','approved','rejected')").bind(path[2]).first<any>();
  if(!app)throw new ApiError(404,'Submitted application not found.');
  const checks=await db.prepare('SELECT department,raw,normalized,checked_at FROM checks WHERE application_id=? ORDER BY department').bind(app.id).all<any>();
  return reply({application:app,checks:checks.results.map(row=>({...row,raw:JSON.parse(row.raw),normalized:JSON.parse(row.normalized)}))});
 }
 if(path[0]==='workspace'){
  const [apps,logs]=await Promise.all(actor.role==='admin'?[db.prepare("SELECT * FROM applications WHERE status IN ('submitted','clarification','approved','rejected') ORDER BY submitted_at DESC LIMIT 100").all(),db.prepare("SELECT a.* FROM audit a JOIN applications p ON p.id=a.application_id WHERE p.status IN ('submitted','clarification','approved','rejected') ORDER BY a.created_at DESC LIMIT 200").all()]:[db.prepare('SELECT * FROM applications WHERE owner = ? ORDER BY created_at DESC LIMIT 100').bind(user).all(),db.prepare('SELECT * FROM audit WHERE owner = ? ORDER BY created_at DESC LIMIT 200').bind(user).all()]);
  return reply({user:actor,applications:apps.results,audit:logs.results,citizens});
 }
 if(actor.role!=='citizen')throw new ApiError(403,'This action is available to citizen accounts only.');
 if(path[0]==='applications'&&path[1]){
  const app=await application(path[1],user);
  if(path[2]==='certificate'){
   if(serviceOf(app)!=='residence'||app.status!=='approved')throw new ApiError(409,'Certificate is available only after department approval.');
   return reply({certificate:{reference:app.id,issuedAt:app.decided_at,profile:JSON.parse(app.result).profile,notice:'DEMONSTRATION ONLY — not a government certificate'}});
  }
  const rows=await db.prepare('SELECT * FROM checks WHERE application_id = ?').bind(app.id).all();
  return reply({application:app,checks:rows.results});
 }
 if(path[0]==='departments'&&allDepartments.includes(path[1] as Department)&&path[2]){
  const started=Date.now(),dept=path[1] as Department,app=await application(url.searchParams.get('applicationId')||'',user);
  if(app.citizen_id!==path[2])throw new ApiError(403,'Citizen does not match this application.');
  try{consent(app,dept);}catch(e){await event(user,app.id,'Consent check','blocked','Data access denied: consent missing, expired or revoked.',dept).run();throw e;}
  if(trackedStatuses.includes(app.status))throw new ApiError(409,'Submitted applications cannot be verified again.');
  if(url.searchParams.get('simulate')==='unavailable'){await event(user,app.id,'Department request','failed','Simulated department outage.',dept,Date.now()-started).run();return reply({error:'Department is temporarily unavailable. Retry verification.',retryable:true},503);}
  const raw=sampleRecord(dept,path[2]),normalized=normalize(dept,raw);
  await db.batch([
   db.prepare('INSERT INTO checks (id,application_id,department,raw,normalized,checked_at) VALUES (?,?,?,?,?,?) ON CONFLICT(application_id,department) DO UPDATE SET raw=excluded.raw, normalized=excluded.normalized, checked_at=excluded.checked_at').bind(crypto.randomUUID(),app.id,dept,JSON.stringify(raw),JSON.stringify(normalized),new Date().toISOString()),
   db.prepare("UPDATE applications SET status = 'draft', result = NULL WHERE id = ?").bind(app.id),
   event(user,app.id,'Department request','success',serviceOf(app)==='residence'?'Residence verification':'Scholarship verification',dept,Date.now()-started)
  ]);
  return reply({department:dept,citizenId:path[2],sample:true,raw,normalized});
 }
 throw new ApiError(404,'API endpoint not found.');
});}
export async function POST(request:Request){return guarded(async()=>{
 const path=new URL(request.url).pathname.replace(/^\/api\/?/,'').split('/'),db=database();
 if(path[0]==='auth')return authRoute(request,path[1]);
 const actor=await account(request),user=actor.id,data=await body(request);
 if(path[0]==='applications'&&path[1]&&path[2]==='decision'){
  if(actor.role!=='admin')throw new ApiError(403,'Only administrators can review applications.');
  const app=await db.prepare('SELECT * FROM applications WHERE id=?').bind(path[1]).first<any>();
  if(!app)throw new ApiError(404,'Application not found.');
  if(app.status!=='submitted')throw new ApiError(409,'Only applications awaiting department review can be decided.');
  if(!['approved','clarification','rejected'].includes(data.decision))throw new ApiError(400,'Choose a valid decision.');
  const note=typeof data.note==='string'?data.note.trim():'';
  if(note.length>1000||(data.decision!=='approved'&&note.length<10))throw new ApiError(400,'Provide a reason between 10 and 1,000 characters.');
  const auditId=crypto.randomUUID(),at=new Date().toISOString();
  await db.batch([
   db.prepare("INSERT INTO audit (id,owner,application_id,action,outcome,details,created_at) SELECT ?,owner,id,'Department decision',?,?,? FROM applications WHERE id=? AND status='submitted'").bind(auditId,data.decision,JSON.stringify({officer:actor.name,officerId:actor.id,note:note||'Application approved.'}),at,app.id),
   db.prepare("UPDATE applications SET status=?,decision_note=?,decided_at=? WHERE id=? AND status='submitted'").bind(data.decision,note,at,app.id)
  ]);
  const logged=await db.prepare('SELECT id FROM audit WHERE id=?').bind(auditId).first();
  if(!logged)throw new ApiError(409,'Another officer has already reviewed this application. Refresh the queue.');
  return reply({application:await application(app.id,app.owner)});
 }
 if(actor.role!=='citizen')throw new ApiError(403,'This action is available to citizen accounts only.');
 if(path[0]==='applications'&&!path[1]){
  const citizen=citizens.find(c=>c.id===data.citizenId);if(!citizen)throw new ApiError(400,'Choose one of the sample citizens.');
  if(actor.citizenId&&actor.citizenId!==citizen.id)throw new ApiError(403,'This sample account can apply only as its own citizen.');
  if(data.service!==undefined&&!['scholarship','residence'].includes(data.service))throw new ApiError(400,'Unknown service.');
  const service:Service=data.service||'scholarship',required=serviceDepartments[service];
  if(!Array.isArray(data.scopes)||data.scopes.length!==required.length||!required.every(d=>data.scopes.includes(d))||data.accepted!==true)throw new ApiError(400,'Consent to all required sources is needed.');
  const id=(service==='residence'?'RES-':'SS-')+new Date().getFullYear()+'-'+crypto.randomUUID().slice(0,8).toUpperCase(),now=new Date().toISOString(),expires=new Date(Date.now()+86400000).toISOString();
  const details=service==='residence'&&data.simulateMismatch?{address:'Flat No. 12, Andheri'}:{};
  await db.batch([db.prepare('INSERT INTO applications (id,owner,citizen_id,name,status,consent,expires_at,scopes,created_at,service,details) VALUES (?,?,?,?,?,?,?,?,?,?,?)').bind(id,user,citizen.id,citizen.name,'draft',1,expires,JSON.stringify(required),now,service,JSON.stringify(details)),event(user,id,'Consent granted','success',service==='residence'?'Residence certificate application':'Scholarship application')]);
  return reply({application:await application(id,user)},201);
 }
 if(path[0]==='applications'&&path[1]){
  const app=await application(path[1],user),service=serviceOf(app);
  if(path[2]==='revoke'){await db.batch([db.prepare('UPDATE applications SET consent = 0 WHERE id = ? AND owner = ?').bind(app.id,user),event(user,app.id,'Consent revoked','success','Further data access and submission blocked.')]);return reply({revoked:true});}
  consent(app);
  if(path[2]==='clarify'){
   if(app.status!=='clarification')throw new ApiError(409,'This application does not need clarification.');
   const note=typeof data.note==='string'?data.note.trim():'';
   if(note.length<10||note.length>1000)throw new ApiError(400,'Provide a response between 10 and 1,000 characters.');
   await db.batch([db.prepare("UPDATE applications SET status = 'submitted', decision_note = NULL, decided_at = NULL WHERE id = ? AND owner = ? AND status = 'clarification'").bind(app.id,user),event(user,app.id,'Clarification provided','success',note)]);
   return reply({application:await application(app.id,user)});
  }
  if(path[2]==='evaluate'){
   if(trackedStatuses.includes(app.status))throw new ApiError(409,'Application is already submitted.');
   const records=await recordsFor(app);
   const input=data.details??JSON.parse(app.details||'{}');
   if(!input||typeof input!=='object'||Array.isArray(input))throw new ApiError(400,'Invalid application details.');
   const result=service==='residence'?assessResidence(records,input):assess(records);
   await db.batch([db.prepare('UPDATE applications SET status = ?, result = ?, details = ? WHERE id = ? AND owner = ?').bind(result.status,JSON.stringify(result),JSON.stringify(service==='residence'?(result as any).details:{}),app.id,user),event(user,app.id,'Validation checked',result.status==='eligible'?'success':'review',result.rules.filter(r=>!r.passed).map(r=>r.label).join('; ')||'All demonstration rules passed.')]);
   return reply({application:await application(app.id,user),result});
  }
  if(path[2]==='reuse-residence'){
   if(service!=='scholarship'||trackedStatuses.includes(app.status))throw new ApiError(409,'Start an unsubmitted scholarship application first.');
   consent(app,'residence');
   const source=await application(data.sourceId,user);
   if(source.service!=='residence'||source.status!=='approved'||source.citizen_id!==app.citizen_id)throw new ApiError(403,'Use an approved residence application for the same citizen.');
   consent(source,'residence');
   const row=await db.prepare("SELECT raw,normalized FROM checks WHERE application_id = ? AND department = 'residence'").bind(source.id).first<any>();
   if(!row)throw new ApiError(409,'Verified residence information is unavailable.');
   await db.batch([db.prepare("INSERT INTO checks (id,application_id,department,raw,normalized,checked_at) VALUES (?,?,'residence',?,?,?) ON CONFLICT(application_id,department) DO UPDATE SET raw=excluded.raw,normalized=excluded.normalized,checked_at=excluded.checked_at").bind(crypto.randomUUID(),app.id,row.raw,row.normalized,new Date().toISOString()),db.prepare("UPDATE applications SET status = 'draft', result = NULL WHERE id = ?").bind(app.id),event(user,app.id,'Verified residence reused','success',source.id,'residence')]);
   return reply({department:'residence',raw:JSON.parse(row.raw),normalized:JSON.parse(row.normalized)});
  }
  if(path[2]==='submit'){
   if(app.status==='submitted')return reply({application:app});
   if(app.status!=='eligible')throw new ApiError(409,'Only a verified application can be submitted.');
   if(data.confirmed!==true)throw new ApiError(400,'Confirm that you reviewed the application.');
   const result=service==='residence'?assessResidence(await recordsFor(app),JSON.parse(app.details||'{}')):assess(await recordsFor(app));
   if(result.status!=='eligible')throw new ApiError(409,'Resolve the validation checks before submission.');
   if(service==='scholarship'){
    if(typeof data.email!=='string'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)||data.email.length>200)throw new ApiError(400,'Enter a valid demo contact email.');
    if(typeof data.statement!=='string'||data.statement.trim().length<20||data.statement.length>1000)throw new ApiError(400,'Write a statement between 20 and 1,000 characters.');
   }
   const changed=await db.prepare("UPDATE applications SET status = 'submitted', email = ?, statement = ?, submitted_at = ?, result = ? WHERE id = ? AND owner = ? AND status = 'eligible' AND consent = 1 AND expires_at > ?").bind(service==='scholarship'?data.email:null,service==='scholarship'?data.statement.trim():null,new Date().toISOString(),JSON.stringify(result),app.id,user,new Date().toISOString()).run();
   if(changed.meta.changes)await event(user,app.id,'Application submitted','success',service==='residence'?'Routed to Residence Department for review.':'Received for scholarship review.').run();
   return reply({application:await application(app.id,user)});
  }
 }
 throw new ApiError(404,'API endpoint not found.');
});}
