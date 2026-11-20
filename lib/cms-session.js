import 'server-only';
import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
import {adminDb} from '@/lib/cms-admin-server';
const NAME='shaneryn_cms';
const HOURS=8;
const base64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
function secret(){
 const supplied=process.env.CMS_SESSION_SECRET;
 if(supplied){if(supplied.length<32)throw Error('CMS_SESSION_SECRET must be at least 32 characters');return supplied}
 // One required server credential can also sign sessions. Rotating it signs out sessions.
 const service=process.env.CMS_GOOGLE_CREDENTIALS_JSON||process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
 if(!service)throw Error('Set CMS_SESSION_SECRET (at least 32 characters) for this hosting environment');
 const key=JSON.parse(service).private_key;
 return createHash('sha256').update('shaneryn-session-v2:'+key).digest();
}
function signature(data){return createHmac('sha256',secret()).update(data).digest('base64url')}
export function createSession(user){
 const now=Math.floor(Date.now()/1000);
 const data=base64({id:user.id,v:user.sessionVersion||1,iat:now,exp:now+HOURS*3600});
 return data+'.'+signature(data);
}
export const cookieSettings={name:NAME,httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:HOURS*3600};
export const clearCookie={...cookieSettings,maxAge:0};
function cookieValue(request){return request.cookies?.get?.(NAME)?.value||String(request.headers?.get('cookie')||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(NAME+'='))?.slice(NAME.length+1)}
export async function sessionUser(request){
 const token=cookieValue(request);
 if(!token)return null;
 try{
  const [data,sig,...rest]=token.split('.');
  if(rest.length||!data||!sig)return null;
  const actual=Buffer.from(sig,'base64url'),expected=Buffer.from(signature(data),'base64url');
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null;
  const session=JSON.parse(Buffer.from(data,'base64url').toString());
  if(!session.id||!Number.isInteger(session.exp)||session.exp<=Date.now()/1000)return null;
  const snap=await adminDb().collection('cms_users').doc(session.id).get();
  if(!snap.exists)return null;
  const user={id:snap.id,...snap.data()};
  if(user.active!==true||!user.passwordHash||user.sessionVersion!==session.v)return null;
  if(!['super_admin','editor','products','enquiries','viewer'].includes(user.role))return null;
  return {id:user.id,username:user.username,role:user.role,active:user.active,sessionVersion:user.sessionVersion};
 }catch{return null}
}
export function requireRole(user,roles){if(!user||!roles.includes(user.role))throw Object.assign(Error('Not authorised for this action'),{status:403})}
