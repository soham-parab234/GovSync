export const departments = ['identity', 'education', 'income', 'residence'] as const;
export const allDepartments = [...departments, 'documents'] as const;
export type Department = typeof allDepartments[number];
export type Service = 'scholarship' | 'residence';
export const serviceDepartments: Record<Service, readonly Department[]> = { scholarship: departments, residence: ['identity', 'residence', 'documents'] };
export const citizens = [
 {id:'DEMO-1001',name:'Asha Sharma',description:'Eligible applicant',initials:'AS'},
 {id:'DEMO-1002',name:'Rohan Patil',description:'Income above the limit',initials:'RP'},
 {id:'DEMO-1003',name:'Meera Joshi',description:'Conflicting birth dates',initials:'MJ'},
];
export const mappings: Record<Department,Record<string,string>> = {
 identity:{full_name:'name',birth_date:'dateOfBirth',citizen_ref:'citizenId'},
 education:{student_name:'name',dob:'dateOfBirth',percentage:'marks',institution:'college',program:'course'},
 income:{annual_income_inr:'annualIncome',financial_year:'financialYear'},
 residence:{current_address:'address',state_name:'state',district_name:'district',postal_code:'pin',resident_since:'residenceSince',domicile_verified:'domicileVerified'},
 documents:{document_ref:'documentId',document_type:'documentType',verified:'documentVerified',citizen_ref:'citizenId'},
};
export function sampleRecord(department:Department,citizenId:string) {
 const citizen=citizens.find(c=>c.id===citizenId); if(!citizen)throw new Error('Unknown demo citizen');
 const records={
 identity:{citizen_ref:citizenId,full_name:citizen.name,birth_date:citizenId==='DEMO-1003'?'2006-02-18':'2006-04-12',verified:true},
 education:{student_name:citizen.name,dob:citizenId==='DEMO-1003'?'19/02/2006':'12/04/2006',percentage:citizenId==='DEMO-1002'?76:88.5,institution:'Demo Institute of Technology',program:'B.Tech · Computer Science',enrollment_status:'active'},
 income:{annual_income_inr:citizenId==='DEMO-1002'?420000:145000,financial_year:'2026-27',certificate_ref:'SAMPLE-INC-'+citizenId.slice(-4)},
 residence:{current_address:'Flat 12, Andheri East',state_name:'Maharashtra',district_name:'Mumbai Suburban',postal_code:'400069',resident_since:2018,domicile_verified:true},
 documents:{document_ref:'SAMPLE-ADDR-'+citizenId.slice(-4),document_type:'Verified address proof',verified:true,citizen_ref:citizenId},
 };return records[department];
}
export function normalize(department:Department,raw:Record<string,unknown>){
 const result:Record<string,unknown>={};
 for(const [source,target] of Object.entries(mappings[department])){let value=raw[source];if(target==='dateOfBirth'&&typeof value==='string'&&value.includes('/'))value=value.split('/').reverse().join('-');result[target]=value;}return result;
}
export function assess(records:Record<string,Record<string,any>>){
 const {identity,education,income,residence}=records;
 const rules=[
 {label:'Identity matches academic record',passed:identity.dateOfBirth===education.dateOfBirth&&identity.name===education.name,detail:'Name and date of birth must agree across sources.'},
 {label:'Academic score at least 75%',passed:education.marks>=75,detail:`${education.marks}% verified by Education`},
 {label:'Annual family income at most ₹2,50,000',passed:income.annualIncome<=250000,detail:`₹${Number(income.annualIncome).toLocaleString('en-IN')} verified by Income`},
 {label:'Verified Maharashtra domicile',passed:residence.state==='Maharashtra'&&residence.domicileVerified===true,detail:`${residence.state} · ${residence.district}`},
 ];const status=!rules[0].passed?'needs_review':rules.every(r=>r.passed)?'eligible':'ineligible';
 return {status,rules,profile:{...identity,...education,...income,...residence,name:identity.name,dateOfBirth:identity.dateOfBirth}};
}
