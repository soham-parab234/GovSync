import {readFileSync} from 'node:fs';
export async function testAccounts(base){
 if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('Local tests only.');
 const password='Local-test-password-'+Date.now(),mobile='97'+String(Math.floor(Math.random()*1e8)).padStart(8,'0');
 async function auth(action,data){const r=await fetch(base+'/api/auth/'+action,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify(data)});if(!r.ok)throw new Error('Test account setup failed: '+await r.text());return r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');}
 const cookie=await auth('register',{mobile,password,name:'Workflow Test',role:'citizen'});
 const admin=JSON.parse(readFileSync('.private/admin-account.json','utf8'));
 const secret=process.env.TEST_ADMIN_PASSWORD||readFileSync('.private/ADMIN-LOGIN.txt','utf8').match(/^Password: (.+)$/m)[1];
 const adminCookie=await auth('login',{mobile:admin.mobile,password:secret,role:'admin'});
 return {cookie,adminCookie};
}
