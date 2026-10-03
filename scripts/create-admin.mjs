import {createInterface} from 'node:readline/promises';
import {emitKeypressEvents} from 'node:readline';
import {mkdirSync,writeFileSync,readFileSync,existsSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {passwordHash} from '../lib/password.ts';

// Run from the project root. Credentials stay in ignored local files.
const demo=process.argv.includes('--generate-demo');
let name,mobile,password;
if(demo){name='Demo Administrator';mobile=process.argv.includes('--mobile')?process.argv[process.argv.indexOf('--mobile')+1]:'9990000001';password='GovSync-'+randomBytes(16).toString('base64url');}
else{
 const rl=createInterface({input:process.stdin,output:process.stdout});
 name=(await rl.question('Administrator name: ')).trim();
 mobile=(await rl.question('10-digit Indian mobile number: ')).trim();rl.close();
 if(!process.stdin.isTTY)throw new Error('Use an interactive terminal for private password entry.');
 process.stdout.write('Password (at least 12 characters; hidden): ');
 emitKeypressEvents(process.stdin);process.stdin.setRawMode(true);process.stdin.resume();
 password=await new Promise((resolve,reject)=>{let value='';const handler=(str,key)=>{if(key?.ctrl&&key.name==='c'){cleanup();reject(new Error('Cancelled'));}else if(key?.name==='return'){cleanup();resolve(value);}else if(key?.name==='backspace'){value=value.slice(0,-1);}else if(str&&!key?.ctrl&&!key?.meta)value+=str;};function cleanup(){process.stdin.off('keypress',handler);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n');}process.stdin.on('keypress',handler);});
}
if(!/^[6-9][0-9]{9}$/.test(mobile)||name.length<2||name.length>80||password.length<12||password.length>128)throw new Error('Check the name, mobile number and password length.');
mkdirSync('.private',{recursive:true});
const previous=existsSync('.private/admin-account.json')?JSON.parse(readFileSync('.private/admin-account.json','utf8')):null;
const account={id:previous?.mobile===mobile?previous.id:randomUUID(),name,mobile,password_hash:passwordHash(password)};
writeFileSync('.private/admin-account.json',JSON.stringify(account),{mode:0o600});
let vars=existsSync('.dev.vars')?readFileSync('.dev.vars','utf8'):'';
vars=vars.split(/\r?\n/).filter(l=>!l.startsWith('GOVSYNC_ADMIN_ACCOUNT=')).join('\n').trim();
writeFileSync('.dev.vars',vars+'\nGOVSYNC_ADMIN_ACCOUNT='+String.fromCharCode(39)+JSON.stringify(account).replaceAll(String.fromCharCode(39),'\\u0027')+String.fromCharCode(39)+'\n',{mode:0o600});
if(demo)writeFileSync('.private/ADMIN-LOGIN.txt',`GovSync prototype — private administrator login\n\nChoose Administration Login.\nMobile: ${mobile}\nPassword: ${password}\n\nThis randomly generated demo credential is separate from citizen registration.\nDo not put this file in a public repository or share it with citizen testers.\nCreate your own administrator using: node scripts/create-admin.mjs\nRestart the local server after changing .dev.vars.\nFor Sites, replace the GOVSYNC_ADMIN_ACCOUNT secret with .private/admin-account.json and deploy again.\n`,{mode:0o600});
if(!demo)writeFileSync('.private/ADMIN-LOGIN.txt','GovSync administrator account\n\nMobile: '+mobile+'\nUse the password you entered during setup. It is not stored in this file.\nPrevious generated credentials are no longer valid. Restart the server after setup.\n',{mode:0o600});
console.log('Administrator configured in .dev.vars. Private deployment value: .private/admin-account.json.'+(demo?' Private login instructions: .private/ADMIN-LOGIN.txt.':''));
