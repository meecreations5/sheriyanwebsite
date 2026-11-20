import {randomBytes,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt);
const options={N:32768,r:8,p:1,maxmem:64*1024*1024};
export const normalizeUsername=x=>String(x||'').trim().toLowerCase();
export const validUsername=x=>/^[a-z][a-z0-9._-]{2,31}$/.test(normalizeUsername(x));
export const validPassword=x=>typeof x==='string'&&x.length>=12&&x.length<=128;
export async function passwordHash(password){
 if(!validPassword(password))throw Error('Use a password between 12 and 128 characters.');
 const salt=randomBytes(24);
 const derived=await derive(password,salt,64,options);
 return `scrypt$32768$8$1$${salt.toString('base64url')}$${derived.toString('base64url')}`;
}
export async function passwordVerify(password,stored){
 if(typeof password!=='string'||!stored||typeof stored!=='string')return false;
 const m=/^scrypt\$(32768)\$(8)\$(1)\$([\w-]+)\$([\w-]+)$/.exec(stored);
 if(!m)return false;
 try{
  const salt=Buffer.from(m[4],'base64url'),digest=Buffer.from(m[5],'base64url');
  if(salt.length!==24||digest.length!==64)return false;
  const actual=await derive(password,salt,64,options);
  return timingSafeEqual(actual,digest);
 }catch{return false;}
}
