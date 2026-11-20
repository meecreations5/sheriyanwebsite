import 'server-only';
import {adminDb} from '@/lib/cms-admin-server';
import {passwordVerify,normalizeUsername,validUsername} from '@/lib/cms-password.mjs';
import {FieldValue} from '@google-cloud/firestore';
const LIMIT=5,WINDOW=15*60*1000,LOCK=10*60*1000;
const DUMMY_HASH='scrypt$32768$8$1$'+Buffer.alloc(24).toString('base64url')+'$'+Buffer.alloc(64).toString('base64url');
export async function checkCredentials(username,password){
 const name=normalizeUsername(username);
 if(!validUsername(name)||typeof password!=='string'||password.length>128)return null;
 const db=adminDb(),attempt=db.collection('cms_login_attempts').doc(name);
 const before=await attempt.get();const now=Date.now(),a=before.data()||{};
 if(Number(a.blockedUntil||0)>now)throw Object.assign(Error('Too many attempts. Try again in 10 minutes.'),{status:429});
 const snap=await db.collection('cms_users').doc(name).get();
 const user=snap.exists?{id:snap.id,...snap.data()}:null;
 // Only existing Firestore cms_users records may authenticate.
 // No environment-based account creation, setup token or first-login provisioning.
 const ok=await passwordVerify(password,user?.passwordHash||DUMMY_HASH);
 if(!ok||user?.active!==true){
  await db.runTransaction(async tx=>{
   const fresh=await tx.get(attempt),row=fresh.data()||{},windowStart=Number(row.windowStart||0);
   const within=now-windowStart<WINDOW;
   const failures=within?Number(row.failures||0)+1:1;
   tx.set(attempt,{failures,windowStart:within?windowStart:now,blockedUntil:failures>=LIMIT?now+LOCK:0,updatedAt:FieldValue.serverTimestamp()});
  });
  return null;
 }
 await attempt.delete().catch(()=>{});
 return user;
}
