import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
const source=fs.readFileSync(new URL('../app/i18n.tsx',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
const mod={exports:{}};new Function('require','exports','module',compiled)(name=>name==="./auth-translations"?(()=>{const m={exports:{}};new Function("exports",ts.transpileModule(fs.readFileSync("app/auth-translations.ts","utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m.exports);return m.exports;})():require(name),mod.exports,mod);
const {translate,localeFor,translations}=mod.exports;
assert.equal(translate('en','Services'),'Services');
assert.equal(translate('hi','Services'),'सेवाएँ');
assert.equal(translate('mr','Services'),'सेवा');
for(const lang of ['hi','mr']){
 const s=translate(lang,'{count} of {total} sources selected',{count:3,total:3});
 assert.ok(s.includes('३'));assert.ok(!s.includes('{count}'));
 assert.equal(new Intl.NumberFormat(localeFor(lang),{useGrouping:false}).format(2018),'२०१८');
 assert.equal(new Intl.NumberFormat(localeFor(lang)).format(145000),'१,४५,०००');
 assert.match(new Intl.DateTimeFormat(localeFor(lang),{year:'numeric'}).format(new Date('2006-04-12T12:00:00Z')),/२००६/);
 assert.equal(translate(lang,'RES-2026-ABC12345'),'RES-2026-ABC12345');
 assert.ok(translate(lang,'{count} services available',{count:2}).includes('२'));
 assert.ok(translate(lang,'4 connected sources').includes('४'));
}
for(const p of (process.argv.includes('--mappings-only')?['app/admin-mappings.tsx']:['app/admin-mappings.tsx','app/login.tsx','lib/auth.ts','app/workspace.tsx','app/portal.tsx','app/apply.tsx','app/views.tsx','app/api/[[...path]]/route.ts','lib/server.ts'])){
 const file=ts.createSourceFile(p,fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const validateKey=node=>{
  if(ts.isStringLiteral(node))assert.ok(translations[node.text],p+': untranslated '+node.text);
  if(ts.isConditionalExpression(node)){validateKey(node.whenTrue);validateKey(node.whenFalse);}
  if(ts.isParenthesizedExpression(node))validateKey(node.expression);
 };
 const validate=node=>{
  if(ts.isCallExpression(node)&&node.expression.getText(file)==='t'&&node.arguments[0])validateKey(node.arguments[0]);
  if(p==='app/portal.tsx'&&ts.isPropertyAssignment(node)&&['label','desc','category','meta'].includes(node.name.getText(file)))validateKey(node.initializer);
  if(p==='app/portal.tsx'&&ts.isArrayLiteralExpression(node)&&node.elements.length===3&&ts.isStringLiteral(node.elements[0])&&ts.isStringLiteral(node.elements[1])&&ts.isIdentifier(node.elements[2]))validateKey(node.elements[1]);
  if(ts.isNewExpression(node)&&node.expression.getText(file)==='ApiError'&&node.arguments?.[1]&&ts.isStringLiteral(node.arguments[1]))assert.ok(translations[node.arguments[1].text],p+': untranslated error '+node.arguments[1].text);
  ts.forEachChild(node,validate);
 };validate(file);
}
const config=ts.createSourceFile('app/site-config.ts',fs.readFileSync(new URL('../app/site-config.ts',import.meta.url),'utf8'),ts.ScriptTarget.Latest,true);
function validateConfig(node){
 if(ts.isPropertyAssignment(node)&&['tagline','alt'].includes(node.name.getText(config))&&ts.isStringLiteral(node.initializer))assert.ok(translations[node.initializer.text],'app/site-config.ts: untranslated '+node.initializer.text);
 ts.forEachChild(node,validateConfig);
}
validateConfig(config);
for(const [key,values] of Object.entries(translations)){assert.equal(values.length,2,key);assert.ok(values.every(v=>v.trim().length>0),key);}
console.log('PASS: '+Object.keys(translations).length+' Hindi/Marathi translation pairs, visible literal/error coverage, Devanagari values, and stable tracking IDs.');
