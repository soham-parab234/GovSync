'use client';
import {useEffect,useState} from 'react';
import {mappings,type Department} from '@/lib/demo';
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from '@/components/ui/table';
import {Tabs,TabsContent,TabsList,TabsTrigger} from '@/components/ui/tabs';
import {api,Badge} from './workspace';
import {deptInfo} from './apply';
import {useLanguage} from './i18n';

export default function AdminMappings({applications}:{applications:any[]}){
 const {t,date}=useLanguage();
 const [selected,setSelected]=useState(''),[department,setDepartment]=useState('identity'),[data,setData]=useState<any>(null),[error,setError]=useState(''),[loading,setLoading]=useState(false),[revision,setRevision]=useState(0);
 const active=applications.some(a=>a.id===selected)?selected:applications[0]?.id||'';
 useEffect(()=>{
  let cancelled=false;setData(null);setError('');
  if(!active){setLoading(false);return;}
  setLoading(true);
  api('admin/mappings/'+encodeURIComponent(active)).then(value=>{if(!cancelled){setData(value);setDepartment(value.checks[0]?.department||'identity');}}).catch(e=>{if(!cancelled)setError(e.message);}).finally(()=>{if(!cancelled)setLoading(false);});
  return()=>{cancelled=true;};
 },[active,revision]);
 const record=data?.application.id===active?data:null;
 const display=(v:any)=>v===undefined||v===null?'—':typeof v==='object'?JSON.stringify(v):String(v);
 return <section className="panel">
  <div className="panel-head"><h2>{t('Source-to-profile mappings')}</h2><button className="btn small" disabled={!active||loading} onClick={()=>setRevision(v=>v+1)}>{t('Refresh')}</button></div>
  <div className="panel-body">
   <label className="form-label" htmlFor="mapping-application">{t('Select a submitted application')}</label>
   <select id="mapping-application" className="choice" style={{width:'100%',maxWidth:'100%'}} value={active} disabled={!applications.length} onChange={e=>{setData(null);setSelected(e.target.value);}}>
    {!applications.length&&<option value="">{t('No submitted applications yet')}</option>}
    {applications.map(a=><option key={a.id} value={a.id}>{t(a.name)} · {a.id} · {t(a.service==='residence'?'Residence / Domicile Certificate':'Scholarship Application')}</option>)}
   </select>
   <p className="subtext section-gap">{t('Saved verification records from submitted applications. No new department request is made.')}</p>
   {!applications.length&&<p className="empty">{t('Submit a verified citizen application first, then return here. Draft applications are private to the citizen.')}</p>}
   {loading&&<p role="status" className="section-gap">{t('Loading saved records…')}</p>}
   {error&&<p role="alert" className="note error section-gap">{t(error)}</p>}
   {record&&<>
    <div className="panel-head section-gap"><div><h3>{t(record.application.name)}</h3><p className="tracking-id">{record.application.id} · {record.application.citizen_id}</p></div><Badge status={record.application.status}/></div>
    {!record.checks.length?<p className="empty">{t('No saved verification records for this application.')}</p>:
    <Tabs value={department} onValueChange={setDepartment}>
     <TabsList className="tab-list" style={{height:'auto',flexWrap:'wrap'}}>{record.checks.map((check:any)=><TabsTrigger className="tab-trigger" key={check.department} value={check.department}>{t(deptInfo[check.department as Department].title)}</TabsTrigger>)}</TabsList>
     {record.checks.map((check:any)=><TabsContent key={check.department} value={check.department}>
      <p className="subtext section-gap">{t('Verified at')}: {date(check.checked_at,true)}</p>
      <h3 className="section-gap">{t('Field-by-field comparison')}</h3>
      <Table className="data-table"><TableHeader><TableRow>{['Department field','Original value','GovSync field','Standardized value'].map(label=><TableHead key={label}>{t(label)}</TableHead>)}</TableRow></TableHeader><TableBody>
       {Object.entries(mappings[check.department as Department]).map(([source,target])=><TableRow key={source}><TableCell><code>{source}</code></TableCell><TableCell style={{overflowWrap:'anywhere'}}>{display(check.raw[source])}</TableCell><TableCell><code>{target}</code></TableCell><TableCell style={{overflowWrap:'anywhere'}}>{display(check.normalized[target])}</TableCell></TableRow>)}
      </TableBody></Table>
      <div className="mapping-grid section-gap"><div style={{minWidth:0}}><h3>{t('Actual sample response')}</h3><pre className="code">{JSON.stringify(check.raw,null,2)}</pre></div><div style={{minWidth:0}}><h3>{t('Normalized record')}</h3><pre className="code">{JSON.stringify(check.normalized,null,2)}</pre></div></div>
     </TabsContent>)}
    </Tabs>}
    <p className="subtext section-gap">{t('Raw API values, IDs and user-entered text keep their original form.')}</p>
   </>}
  </div>
 </section>;
}
