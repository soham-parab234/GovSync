'use client';
import {useState} from 'react';
import {ArrowRight,Eye,EyeOff,Globe2,Landmark,LockKeyhole,Smartphone,UserRound,Download} from 'lucide-react';
import {useLanguage} from './i18n';
import {api} from './workspace';
import {siteConfig} from './site-config';
import {citizens} from '@/lib/demo';

export function LanguageMenu(){const {language,setLanguage,t}=useLanguage();return <label className="login-language"><Globe2 size={19}/><span className="sr-only">{t('Language')}</span><select aria-label="Language / भाषा" value={language} onChange={e=>setLanguage(e.target.value as 'en'|'hi'|'mr')}><option value="en">English</option><option value="hi">हिन्दी</option><option value="mr">मराठी</option></select></label>;}
export default function Login({onLogin,initialRole='citizen',initialError=''}:{initialRole?:'citizen'|'admin';onLogin:()=>Promise<void>;initialError?:string}){
 const {t}=useLanguage();
 const [role,setRole]=useState<'citizen'|'admin'>(initialRole),[form,setForm]=useState<'login'|'register'|'recover'>('login');
 const [mobile,setMobile]=useState(''),[password,setPassword]=useState(''),[name,setName]=useState(''),[recoveryCode,setRecoveryCode]=useState('');
 const [show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(initialError),[issuedCode,setIssuedCode]=useState(''),[saved,setSaved]=useState(false);
 function switchForm(next:'login'|'register'|'recover'){setForm(next);setPassword('');setError('');setShow(false);}
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');try{const data=await api('auth/'+form,{role,mobile,password,name,recoveryCode});setPassword('');if(data.recoveryCode)setIssuedCode(data.recoveryCode);else await onLogin();}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 async function demoLogin(citizenId:string){setBusy(true);setError('');try{await api('auth/demo',{citizenId});await onLogin();}catch(e:any){setError(e.message);}finally{setBusy(false);}}
 function saveCode(){const blob=new Blob([`GovSync account recovery\nMobile: +91 ${mobile}\nRecovery code: ${issuedCode}\nKeep this private. This code can reset your account password. A reset replaces it.\n`],{type:'text/plain'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='GovSync-recovery-code.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setSaved(true);}
 return <main className="login-page" id="main-content">
  <div className="login-top"><a href="#login-form" className="skip-link">{t('Skip to sign in')}</a><LanguageMenu/></div>
  <div className="login-layout">
   <section className="login-story" aria-label={t('About GovSync')}>
    <div className="login-brand"><img src={siteConfig.logo} alt=""/><div><strong>{siteConfig.name}</strong><span>{t('Integrated government services')}</span></div></div>
    <h1>{t('One platform.')}<br/>{t('Multiple departments.')}<br/>{t('One unified experience.')}</h1>
    <p>{t('Apply for services, share verified information and follow your application from start to finish.')}</p>
    <div className="login-illustration" role="img" aria-label={t('A citizen using a laptop to access government services.')}/>
   </section>
   <section className="login-panel" id="login-form" aria-labelledby="login-title">
    {issuedCode?<div className="recovery-confirm"><span className="login-kicker">{t('Keep your account safe')}</span><h2 id="login-title">{t('Save your recovery code')}</h2><p>{t('Use this private code to reset your password. It is shown only once and is replaced after every reset.')}</p><code>{issuedCode}</code><button className="btn" onClick={saveCode}><Download size={18}/>{t('Download recovery code')}</button><label className="recovery-check"><input type="checkbox" checked={saved} onChange={e=>setSaved(e.target.checked)}/>{t('I have saved my recovery code')}</label><button className="btn primary login-submit" disabled={!saved||busy} onClick={async()=>{setBusy(true);try{await onLogin();}finally{setBusy(false);}}}>{t('Continue to services')}<ArrowRight size={18}/></button></div>:<>
    <span className="login-kicker">{t('Your services. Your account.')}</span>
    <h2 id="login-title">{t(form==='register'?'Create your account':form==='recover'?'Reset your password':'Welcome to GovSync')}</h2>
    <p className="login-intro">{t(form==='register'?'Register to save and track your applications.':form==='recover'?'Enter the recovery code you saved when creating your account.':'Sign in to access services and manage your applications.')}</p>
    {form==='login'&&<div className="login-roles" role="group" aria-label={t('Account type')}><button type="button" aria-pressed={role==='citizen'} onClick={()=>{setRole('citizen');setError('');}}><UserRound size={20}/>{t('Citizen Login')}</button><button type="button" aria-pressed={role==='admin'} onClick={()=>{setRole('admin');setError('');}}><Landmark size={20}/>{t('Administration Login')}</button></div>}
    {role==='admin'&&form==='login'&&<p className="admin-hint">{t('Use the administrator account issued by your project owner.')}</p>}
    <form onSubmit={submit} className="login-fields">
     {form==='register'&&<div className="field"><label htmlFor="account-name">{t('Full name')}</label><div className="login-input"><UserRound size={19}/><input id="account-name" autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></div></div>}
     <div className="field"><label htmlFor="mobile">{t('Mobile number')}</label><div className="login-input"><Smartphone size={19}/><span className="dial-code">+91</span><input id="mobile" type="tel" inputMode="tel" autoComplete="username" required pattern="[6-9६-९][0-9०-९]{9}" maxLength={10} placeholder={t('10-digit mobile number')} value={mobile} onChange={e=>setMobile(e.target.value)}/></div></div>
     {form==='recover'&&<div className="field"><label htmlFor="recovery">{t('Recovery code')}</label><div className="login-input"><LockKeyhole size={19}/><input id="recovery" autoComplete="off" required maxLength={64} value={recoveryCode} onChange={e=>setRecoveryCode(e.target.value)}/></div></div>}
     <div className="field"><label htmlFor="password">{t(form==='recover'?'New password':'Password')}</label><div className="login-input"><LockKeyhole size={19}/><input id="password" autoComplete={form==='login'?'current-password':'new-password'} type={show?'text':'password'} required minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} aria-describedby={form!=='login'?'password-help':undefined}/><button type="button" aria-label={t(show?'Hide password':'Show password')} aria-pressed={show} onClick={()=>setShow(!show)}>{show?<EyeOff size={19}/>:<Eye size={19}/>}</button></div>{form!=='login'&&<small id="password-help">{t('Use at least 12 characters. A long passphrase works well.')}</small>}</div>
     {form==='login'&&role==='citizen'&&<button className="text-link forgot-link" type="button" onClick={()=>switchForm('recover')}>{t('Forgot password?')}</button>}
     {error&&<div className="note error" role="alert">{t(error)}</div>}
     <button className="btn primary login-submit" type="submit" disabled={busy}>{t(busy?'Please wait…':form==='register'?'Create account':form==='recover'?'Reset password':'Sign in')}<ArrowRight size={19}/></button>
    </form>
    {form==='login'&&role==='citizen'&&<section className="demo-citizens" aria-labelledby="demo-title"><div className="demo-divider"><span id="demo-title">{t('Or continue as a sample citizen')}</span></div><div className="demo-grid">{citizens.map((c,i)=><button type="button" key={c.id} className={'demo-citizen tone-'+i} disabled={busy} onClick={()=>void demoLogin(c.id)} aria-label={t('Continue as')+' '+t(c.name)}><span className="demo-avatar" aria-hidden="true">{c.initials}</span><span className="demo-copy"><strong>{t(c.name)}</strong><small>{t(c.description)}</small></span><ArrowRight size={16} aria-hidden="true"/></button>)}</div><p className="demo-note">{t('Explore with fictional records. No password needed.')}</p></section>}
    <div className="login-bottom">{form==='login'&&role==='citizen'?<><span>{t('New to GovSync?')}</span><button className="text-link" onClick={()=>switchForm('register')}>{t('Create an account')}</button></>:form!=='login'?<button className="text-link" onClick={()=>switchForm('login')}>{t('Back to sign in')}</button>:<span>{t('Need access? Contact your project owner.')}</span>}</div>
    {form==='register'&&<p className="registration-note">{t('Your mobile number is a sign-in identifier. This prototype does not verify it by SMS.')}</p>}
    </>}
   </section>
  </div>
  <footer className="login-footer"><span>{siteConfig.name} · {t('Connected governance')}</span><span>{t('Sample department records. No live government integration.')}</span></footer>
 </main>;
}
