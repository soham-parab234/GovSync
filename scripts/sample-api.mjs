import {createServer} from 'node:http';
// Educational localhost API. Fictional records only; not a production auth example.
const records = {
 'DEMO-1001': {student_name:'Asha Sharma',dob:'12/04/2006',percentage:88.5,institution:'Demo Institute of Technology'},
 'DEMO-1002': {student_name:'Rohan Patil',dob:'12/04/2006',percentage:76,institution:'Demo Institute of Technology'},
};
const server=createServer((request,response)=>{
 const url=new URL(request.url,'http://127.0.0.1:4000');
 response.setHeader('Content-Type','application/json');
 response.setHeader('Cache-Control','no-store');
 const send=(status,data)=>{response.writeHead(status);response.end(JSON.stringify(data,null,2));};
 if(request.method!=='GET')return send(405,{error:'Use GET'});
 const match=url.pathname.match(/^\/api\/education\/(DEMO-\d+)$/);
 if(!match)return send(404,{error:'Use /api/education/DEMO-1001'});
 if(url.searchParams.get('simulate')==='unavailable')return send(503,{error:'Simulated education service outage',retryable:true});
 const record=records[match[1]];
 if(!record)return send(404,{error:'Sample citizen not found'});
 send(200,{sample:true,source:'education',data:record});
});
server.listen(4000,'127.0.0.1',()=>console.log('Sample API: http://127.0.0.1:4000/api/education/DEMO-1001'));
