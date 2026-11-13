"use client";
import {useEffect,useState} from 'react';
import {serviceDepartments,type Service} from '@/lib/demo';
import {trackedStatuses} from '@/lib/residence';
import {LanguageProvider,useLanguage} from './i18n';
import {PortalHeader,PortalHome,PortalResources,PortalFooter} from './portal';
import Apply from './apply';
import Login from './login';
import Views from './views';
import type {ApplicationRecord,CheckRecord,AuditRecord,CertificateData,WorkspaceData,WorkspaceContext,DepartmentCheckState,AssessmentResult} from '@/lib/types';

export const navigation=[
 {id:'apply',label:'Services',group:'citizen'},{id:'applications',label:'My applications',group:'citizen'},
 {id:'consent',label:'Permissions',group:'citizen'},{id:'audit',label:'Activity',group:'citizen'},{id:'resources',label:'Help',group:'citizen'},
 {id:'dashboard',label:'Overview',group:'admin'},{id:'apis',label:'API monitor',group:'admin'},
 {id:'mapping',label:'Data mappings',group:'admin'},{id:'guide',label:'Developer guide',group:'admin'}
];
export const labels:Record<string,string>={draft:'Verification pending',eligible:'Ready for submission',ineligible:'Not eligible',needs_review:'Needs review',submitted:'Department Review',approved:'Approved',clarification:'Clarification requested',rejected:'Rejected',success:'Success',failed:'Failed',blocked:'Blocked',review:'Needs review'};
export function Badge({status,children}:{status?:string;children?:React.ReactNode}){
 const {t}=useLanguage();
 const tone=['eligible','success','approved'].includes(status||'')?'green':['ineligible','failed','blocked','rejected'].includes(status||'')?'red':['needs_review','review','clarification','submitted'].includes(status||'')?'orange':'neutral';
 return <span className={'badge '+tone}>{children||t(labels[status||'']||status||'')}</span>;
}

export interface ApiErrorResponse {
 error?: string;
 [key: string]: unknown;
}

export async function api<T = unknown>(path:string,data?:unknown):Promise<T>{
 const r=await fetch('/api/'+path,{method:data===undefined?'GET':'POST',headers:data===undefined?undefined:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});
 let j:ApiErrorResponse;try{j=(await r.json()) as ApiErrorResponse;}catch{throw new Error('Please retry. Your saved application is retained.');}
 if(!r.ok)throw Object.assign(new Error(j.error||'Please retry. Your saved application is retained.'),{status:r.status});return j as T;
}
export function download(name:string,data:unknown){
 const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function Workspace({portal='citizen'}:{portal?:string}){return <LanguageProvider><WorkspaceContent initialRole={portal==='admin'?'admin':'citizen'}/></LanguageProvider>;}
function WorkspaceContent({initialRole}:{initialRole:'citizen'|'admin'}){
 const {t}=useLanguage();
 const [query,setQuery]=useState('');
 const [view,setView]=useState('apply'),[workspace,setWorkspace]=useState<WorkspaceData>({applications:[],audit:[],citizens:[],user:{id:'',name:'',mobile:'',role:'citizen'}});
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[auth,setAuth]=useState(false),[busy,setBusy]=useState(false);
 const [mode,setMode]=useState<'citizen'|'admin'>('citizen'),[service,setService]=useState<Service|null>(null),[citizen,setCitizen]=useState('DEMO-1001');
 const [scopes,setScopes]=useState<string[]>([]),[accepted,setAccepted]=useState(false),[app,setApp]=useState<ApplicationRecord|null>(null);
 const [records,setRecords]=useState<Record<string,DepartmentCheckState>>({}),[checks,setChecks]=useState<Record<string,string>>({}),[stage,setStage]=useState(0);
 const [outage,setOutage]=useState(false),[mismatch,setMismatch]=useState(false),[reuse,setReuse]=useState('');
 const [details,setDetails]=useState<Record<string,unknown>>({}),[email,setEmail]=useState('asha@example.test'),[statement,setStatement]=useState('');
 const [confirmed,setConfirmed]=useState(false),[certificate,setCertificate]=useState<CertificateData|null>(null);
 async function refresh(){try{const data=await api<WorkspaceData>('workspace');setWorkspace(data);setMode(data.user.role);if(data.user.citizenId)setCitizen(data.user.citizenId);if(data.user.role==='admin')setView(v=>['dashboard','apis','mapping','guide','audit'].includes(v)?v:'dashboard');setAuth(false);}catch(e:unknown){const err=e as {status?:number;message?:string};if(err.status===401)setAuth(true);else setError(err.message||'Please retry. Your saved application is retained.');}finally{setLoading(false);}}
 useEffect(()=>{void (async()=>{await refresh();})();},[]);
 const activeUser=workspace.user;
 useEffect(()=>{if(auth||!activeUser?.id)return;const timer=setInterval(()=>void refresh(),15000);return()=>clearInterval(timer);},[auth,activeUser]);
 useEffect(()=>{if(!app||!trackedStatuses.includes(app.status))return;const timer=setInterval(()=>{void refresh();void api<{application:ApplicationRecord}>('applications/'+app.id).then(d=>setApp(d.application)).catch(()=>{});},10000);return()=>clearInterval(timer);},[app]);
 function move(v:string){if(mode==='admin'&&!['dashboard','apis','mapping','guide','audit'].includes(v))return;if(mode==='citizen'&&!['mapping','apis'].includes(v)&&navigation.find(n=>n.id===v)?.group==='admin')return;setView(v);setError('');}
 function reset(next:Service|null=null){if(mode==='admin')return;setService(next);setApp(null);setRecords({});setChecks({});setStage(0);setScopes([]);setAccepted(false);setConfirmed(false);setError('');setOutage(false);setMismatch(false);setReuse('');setDetails({});setCertificate(null);setView('apply');setMode('citizen');}
 async function task(fn:()=>Promise<void>){setBusy(true);setError('');try{await fn();}catch(e:unknown){const err=e as {status?:number;message?:string};if(err.status===401)setAuth(true);setError(err.message||'Operation failed');}finally{setBusy(false);}}
 async function openApp(a:ApplicationRecord){await task(async()=>{
  const d=await api<{application:ApplicationRecord;checks:CheckRecord[]}>('applications/'+a.id),current=d.application;
  setApp(current);setService((current.service as Service)||'scholarship');setCitizen(current.citizen_id);
  setRecords(Object.fromEntries(d.checks.map(x=>[x.department,{raw:JSON.parse(x.raw) as Record<string,unknown>,normalized:JSON.parse(x.normalized) as Record<string,unknown>}])));
  setChecks(Object.fromEntries(d.checks.map(x=>[x.department,'success'])));
  setDetails(JSON.parse(current.details||'{}') as Record<string,unknown>);setStage(trackedStatuses.includes(current.status)?4:current.result?2:1);
  setEmail(current.email||'asha@example.test');setStatement(current.statement||'');setConfirmed(false);setCertificate(null);move('apply');
 });}
 async function runChecks(a:ApplicationRecord,simulate:boolean,sourceId=''){
  setStage(1);let failed=false;
  for(const dept of serviceDepartments[a.service as Service]){
   setChecks(s=>({...s,[dept]:'loading'}));await new Promise(r=>setTimeout(r,450));
   try{
    const d=dept==='residence'&&sourceId?await api<DepartmentCheckState>('applications/'+a.id+'/reuse-residence',{sourceId}):await api<DepartmentCheckState>('departments/'+dept+'/'+a.citizen_id+'?applicationId='+a.id+(simulate&&dept===(a.service==='residence'?'residence':'income')?'&simulate=unavailable':''));
    setRecords(s=>({...s,[dept]:d}));setChecks(s=>({...s,[dept]:'success'}));
   }catch(e:unknown){failed=true;setChecks(s=>({...s,[dept]:'failed'}));const err=e as Error;setError(err.message);}
  }
  if(!failed){const d=await api<{application:ApplicationRecord;result:AssessmentResult}>('applications/'+a.id+'/evaluate',{});setApp(d.application);setDetails(d.result.details||{});setStage(2);}
  await refresh();
 }
 const begin=()=>task(async()=>{const d=await api<{application:ApplicationRecord}>('applications',{service,citizenId:citizen,scopes,accepted,simulateMismatch:mismatch});setApp(d.application);await runChecks(d.application,outage,reuse);});
 const retry=()=>task(async()=>{if(!app)return;setOutage(false);await runChecks(app,false,reuse);});
 const validate=(input=details)=>task(async()=>{if(!app)return;const d=await api<{application:ApplicationRecord;result:AssessmentResult}>('applications/'+app.id+'/evaluate',{details:input});setApp(d.application);setDetails(d.result.details||{});setConfirmed(false);await refresh();});
 const submit=()=>task(async()=>{if(!app)return;const d=await api<{application:ApplicationRecord}>('applications/'+app.id+'/submit',{email,statement,confirmed});setApp(d.application);setStage(4);await refresh();});
 const revoke=(a:ApplicationRecord)=>task(async()=>{await api('applications/'+a.id+'/revoke',{});if(app?.id===a.id)setApp({...app,consent:0});await refresh();});
 const decide=(a:ApplicationRecord,decision:string,note:string)=>task(async()=>{const d=await api<{application:ApplicationRecord}>('applications/'+a.id+'/decision',{decision,note});if(app?.id===a.id)setApp(d.application);await refresh();});
 const clarify=(note:string)=>task(async()=>{if(!app)return;const d=await api<{application:ApplicationRecord}>('applications/'+app.id+'/clarify',{note});setApp(d.application);await refresh();});
 const showCertificate=()=>task(async()=>{if(!app)return;setCertificate((await api<{certificate:CertificateData}>('applications/'+app.id+'/certificate')).certificate);});
 const ctx:WorkspaceContext={view,workspace,loading,busy,auth,service,citizen,setCitizen,scopes,setScopes,accepted,setAccepted,app,setApp,records,setRecords,checks,stage,setStage,outage,setOutage,mismatch,setMismatch,reuse,setReuse,details,setDetails,email,setEmail,statement,setStatement,confirmed,setConfirmed,certificate,setCertificate,refresh,move,reset,openApp,begin,retry,submit,revoke,decide,clarify,validate,showCertificate,task,setError};
 const heading=navigation.find(n=>n.id===view)!;
 async function login(){setApp(null);setService(null);setRecords({});setChecks({});setStage(0);setCertificate(null);setQuery('');setView('apply');setError('');await refresh();}
 async function logout(){await task(async()=>{await api('auth/logout',{});setWorkspace({applications:[],audit:[],citizens:[],user:{id:'',name:'',mobile:'',role:'citizen'}});setApp(null);setService(null);setAuth(true);setView('apply');setMode('citizen');});}
 if(loading)return <div className='session-loading' role='status'>{t('Loading your workspace')}</div>;
 if(auth)return <Login initialRole={initialRole} onLogin={login} initialError={error}/>;
 if(!workspace.user?.id)return <div className='session-loading'><p role='alert'>{t(error||'Please retry. Your saved application is retained.')}</p><button className='btn' onClick={()=>void refresh()}>{t('Refresh')}</button></div>;
 const notices=workspace.audit.filter((a:AuditRecord)=>a.action==='Department decision').slice(0,3);
 return <div className="app-frame">
  <PortalHeader user={workspace.user} logout={logout} busy={busy} view={view} mode={mode} move={move} home={()=>{if(mode==='admin'){move('dashboard');return;}setQuery('');reset();}}/>
  <main className="workspace" id="main-content" tabIndex={-1}>
   <div className="breadcrumb"><button onClick={()=>{setQuery('');reset();}}>{t('Home')}</button><span aria-hidden="true">/</span><span>{t(mode==='admin'?'Administration':'Citizen portal')}</span>{(view!=='apply'||service)&&<><span aria-hidden="true">/</span><strong>{t(view==='apply'?(service==='residence'?'Residence / Domicile Certificate':'Scholarship Application'):heading.label)}</strong></>}</div>

   {!(view==='apply'&&!service)&&<div className="heading page-heading"><div><p className="eyebrow">{t(mode==='citizen'?'Citizen portal':'Administration')}</p><h1>{t(view==='apply'?(service==='residence'?'Residence / Domicile Certificate':'Scholarship Application'):view==='dashboard'?'Administration dashboard':heading.label)}</h1></div>{mode==='citizen'&&<button className="btn" disabled={busy} onClick={()=>{setQuery('');reset();}}>{t('Start a new application')}</button>}</div>}
   {auth&&!(view==='apply'&&!service)&&<div className="note warn auth-notice"><span>{t('Sign in to save your applications.')} <a href="/signin-with-chatgpt?return_to=/" target="_top">{t('Sign in to workspace')}</a></span></div>}
   {error&&<div className="note error" role="alert">{t(error)} <button className="btn small" onClick={()=>{setError('');void refresh();}}>{t('Refresh')}</button></div>}
   {mode==='citizen'&&notices.length>0&&<details className="notifications"><summary>{t('Notifications')}</summary>{notices.map((a:AuditRecord)=><button className="notification" key={a.id} onClick={()=>{const row=workspace.applications.find(x=>x.id===a.application_id);if(row)void openApp(row);}}>{a.application_id} · {t(labels[a.outcome]||a.outcome)}</button>)}</details>}
   {loading?<div className="loading-page" aria-busy="true"><div className="loading-line wide"/><span className="sr-only">{t('Loading your workspace')}</span></div>:<div className="content-canvas">{view==='apply'?(!service?<PortalHome ctx={ctx} query={query} clearSearch={()=>setQuery('')}/>:<Apply ctx={ctx}/>):view==='resources'?<PortalResources ctx={ctx}/>:<Views ctx={ctx}/>}</div>}
  </main><PortalFooter mode={mode} move={move} home={()=>{setQuery('');reset();}}/>
 </div>;
}
