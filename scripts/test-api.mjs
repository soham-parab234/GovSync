import {testAccounts} from './test-accounts.mjs';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL||'http://127.0.0.1:5173';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('Run this test against a local preview only.');
const {cookie,adminCookie}=await testAccounts(base);
let passed=0;
async function call(path,data,status=200,headers={Cookie:cookie}){
 const res=await fetch(base+'/api/'+path,{method:data===undefined?'GET':'POST',headers:{Origin:base,...headers,...(path.endsWith('/decision')?{Cookie:adminCookie}:{}),...(data===undefined?{}:{'Content-Type':'application/json'})},body:data===undefined?undefined:JSON.stringify(data)});
 const j=await res.json();assert.equal(res.status,status,`${path}: ${JSON.stringify(j)}`);passed++;return j;
}
const scopes=['identity','education','income','residence'];
await call('workspace',undefined,401,{});
await call('applications',null,400);
await call('applications',[],400);
await call('applications',{citizenId:'DEMO-1001',scopes:[],accepted:true},400);
await call('applications',{citizenId:'UNKNOWN',scopes,accepted:true},400);
async function create(id){return (await call('applications',{citizenId:id,scopes,accepted:true},201)).application;}
async function verify(a){for(const d of scopes)await call(`departments/${d}/${a.citizen_id}?applicationId=${a.id}`);return call(`applications/${a.id}/evaluate`,{});}
const a=await create('DEMO-1001');
await call(`applications/${a.id}/evaluate`,{},409);
await call(`departments/identity/DEMO-1002?applicationId=${a.id}`,undefined,403);
await call(`applications/${a.id}`,undefined,401,{'oai-authenticated-user-id':'test-other-user'});
await call(`departments/income/${a.citizen_id}?applicationId=${a.id}&simulate=unavailable`,undefined,503);
const verified=await verify(a);assert.equal(verified.result.status,'eligible');assert.equal(verified.result.profile.dateOfBirth,'2006-04-12');assert.equal(verified.result.profile.annualIncome,145000);
await call(`applications/${a.id}/submit`,{email:'wrong',statement:'too short',confirmed:true},400);
const body={email:'asha@example.test',statement:'Sample application statement for my undergraduate studies.',confirmed:true};
const submission=await call(`applications/${a.id}/submit`,body);assert.equal(submission.application.status,'submitted');
const repeated=await call(`applications/${a.id}/submit`,body);assert.equal(repeated.application.submitted_at,submission.application.submitted_at);
const persisted=await call(`applications/${a.id}`);assert.equal(persisted.application.email,body.email);
await call(`departments/identity/${a.citizen_id}?applicationId=${a.id}`,undefined,409);
const b=await create('DEMO-1002');assert.equal((await verify(b)).result.status,'ineligible');await call(`applications/${b.id}/submit`,body,409);
const c=await create('DEMO-1003');assert.equal((await verify(c)).result.status,'needs_review');await call(`applications/${c.id}/submit`,body,409);
const d=await create('DEMO-1001');await call(`applications/${d.id}/revoke`,{});await call(`departments/identity/${d.citizen_id}?applicationId=${d.id}`,undefined,403);await call(`applications/${d.id}/evaluate`,{},403);
const workspace=await call('workspace');assert.ok(workspace.audit.some(e=>e.action==='Consent revoked'));assert.ok(workspace.audit.some(e=>e.outcome==='failed'));assert.equal(workspace.audit.filter(e=>e.action==='Application submitted'&&e.application_id===a.id).length,1);
console.log(`PASS: ${passed} HTTP assertions, eligibility, mismatch, consent, outage recovery, forged-header rejection and persistent submission. Local demo test records retained.`);

