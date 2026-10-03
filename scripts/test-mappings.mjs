import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
const require=createRequire(import.meta.url),ts=require('typescript');
const sql=new DatabaseSync(':memory:');
sql.exec("CREATE TABLE applications(id TEXT,name TEXT,citizen_id TEXT,service TEXT,status TEXT); CREATE TABLE checks(application_id TEXT,department TEXT,raw TEXT,normalized TEXT,checked_at TEXT);");
for(const [id,name,status] of [['A','Asha','submitted'],['B','Rohan','approved'],['D','Private draft','draft']]){
 sql.prepare('INSERT INTO applications VALUES (?,?,?,?,?)').run(id,name,'DEMO-'+id,'residence',status);
 sql.prepare('INSERT INTO checks VALUES (?,?,?,?,?)').run(id,'identity',JSON.stringify({full_name:name,birth_date:'12/04/2006'}),JSON.stringify({name,dateOfBirth:'2006-04-12'}),'2026-09-24T00:00:00Z');
}
const db={prepare(query){let values=[];return {bind(...v){values=v;return this;},async first(){return sql.prepare(query).get(...values)||null;},async all(){return {results:sql.prepare(query).all(...values)};}};}};
const cache={};
function load(filename){const file=path.resolve(filename);if(cache[file])return cache[file].exports;const mod={exports:{}};cache[file]=mod;
 const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 new Function('require','exports','module',js)(name=>{
  if(name==='cloudflare:workers')return {env:{DB:db}};
  if(name==='@/lib/auth')return {account:async request=>{const role=request.headers.get('test-role');if(!role)throw new (load('lib/server.ts').ApiError)(401,'Please sign in to continue.');return {id:'tester',role};},authRoute:()=>{}};
  if(name.startsWith('@/'))return load(name.slice(2)+'.ts');
  if(name.startsWith('.'))return load(path.resolve(path.dirname(file),name+'.ts'));
  return require(name);
 },mod.exports,mod);return mod.exports;
}
const {GET}=load('app/api/[[...path]]/route.ts');
async function get(id,role,status){const r=await GET(new Request('http://localhost/api/admin/mappings/'+id,{headers:role?{'test-role':role}:{}}));assert.equal(r.status,status);return r.json();}
await get('A',null,401);await get('A','citizen',403);await get('D','admin',404);await get('missing','admin',404);
const a=await get('A','admin',200),b=await get('B','admin',200);
assert.equal(a.checks[0].raw.full_name,'Asha');assert.equal(a.checks[0].normalized.dateOfBirth,'2006-04-12');assert.equal(b.checks[0].raw.full_name,'Rohan');assert.equal(a.application.id,'A');assert.equal(b.application.id,'B');assert.ok(!('owner' in a.application));
sql.exec("UPDATE applications SET status='rejected' WHERE id='A'");await get('A','admin',200);
console.log('PASS: admin access, citizen/anonymous rejection, draft isolation, saved raw/normalized records, application switching and decided applications.');
sql.close();
