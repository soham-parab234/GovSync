import assert from 'node:assert/strict';
import {sampleRecord,normalize,assess} from '../lib/demo.ts';
import {assessResidence} from '../lib/residence.ts';
const records=Object.fromEntries(['identity','education','income','residence','documents'].map(d=>[d,normalize(d,sampleRecord(d,'DEMO-1001'))]));
assert.equal(assess(records).status,'eligible');
assert.equal(assessResidence(records).status,'eligible');
assert.equal(assessResidence(records,{address:'Flat No. 12, Andheri'}).status,'needs_review');
assert.equal(assessResidence(records,{residenceSince:2099}).status,'needs_review');
assert.equal(assessResidence(records,{documentId:'forged'}).status,'needs_review');
assert.equal(assessResidence(records,{purpose:'Invalid'}).status,'needs_review');
for(const [citizen,status] of [['DEMO-1002','ineligible'],['DEMO-1003','needs_review']]){
 const r=Object.fromEntries(['identity','education','income','residence'].map(d=>[d,normalize(d,sampleRecord(d,citizen))]));
 assert.equal(assess(r).status,status);
}
console.log('PASS: scholarship regression and residence mismatch, date, document and purpose validation.');
