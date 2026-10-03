import {scryptSync,timingSafeEqual,randomBytes,createHash} from 'node:crypto';

// Memory-bounded scrypt: 16 MiB, five passes. Shared by the Worker and setup CLI.
export function passwordHash(password:string,salt=randomBytes(16).toString('hex')){
 const key=scryptSync(password,salt,32,{N:16384,r:8,p:5,maxmem:32*1024*1024});
 return `scrypt-v1$${salt}$${key.toString('hex')}`;
}
export function passwordMatches(password:string,stored:string){
 const [version,salt,key]=stored.split('$');
 if(version!=='scrypt-v1'||!salt||!key||!/^[a-f0-9]{64}$/.test(key))return false;
 const actual=passwordHash(password,salt).split('$')[2];
 return timingSafeEqual(Buffer.from(actual,'hex'),Buffer.from(key,'hex'));
}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export const newToken=()=>randomBytes(32).toString('hex');
