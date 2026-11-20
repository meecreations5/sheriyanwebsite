import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
import {passwordHash,passwordVerify,normalizeUsername,validUsername} from '../lib/cms-password.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const records=new Map();
class Ref{
 constructor(col,id){this.id=id;this.key=col+'/'+id;}
 async get(){const x=records.get(this.key);return {id:this.id,exists:x!==undefined,data:()=>x&&structuredClone(x)}}
 async delete(){records.delete(this.key)}
 async set(v){records.set(this.key,structuredClone(v))}
}
const db={
 collection:col=>({doc:id=>new Ref(col,id)}),
 async runTransaction(fn){const tx={get:ref=>ref.get(),set:(ref,value)=>records.set(ref.key,structuredClone(value))};return fn(tx)}
};
const [userPassword,badPassword]=['GoodPasswordForCMS_2026!','DefinitelyWrongPass_2026!'];
const aliceHash=await passwordHash(userPassword);
records.set('cms_users/alice',{username:'alice',role:'super_admin',active:true,sessionVersion:1,passwordHash:aliceHash});
let guard=fs.readFileSync(path.join(root,'lib/cms-login-guard.js'),'utf8').replace(/^import .*?;\s*$/gm,'').replace('export async function checkCredentials','async function checkCredentials');
guard+='\n globalThis.__checkCredentials=checkCredentials;';
const fieldValue={serverTimestamp:()=>({__timestamp:true})};
const serverEnv={CMS_SESSION_SECRET:'test-session-secret-string-of-40-characters'};
const authCtx={adminDb:()=>db,passwordVerify,normalizeUsername,validUsername,FieldValue:fieldValue,Buffer,Date,ensureInitialAdmin:async()=>null};
vm.runInNewContext(guard,authCtx,{filename:'cms-login-guard.js'});
const login=authCtx.__checkCredentials;
assert.equal((await login('ALICE',userPassword)).username,'alice');
assert.equal(await login('alice',badPassword),null);
assert.equal(await login('unknown',userPassword),null);
assert.ok(records.has('cms_login_attempts/unknown'));
records.delete('cms_login_attempts/alice');
for(let i=0;i<5;i++)assert.equal(await login('alice',badPassword),null);
await assert.rejects(login('alice',badPassword),/Too many attempts/);
records.delete('cms_login_attempts/alice');
records.set('cms_users/alice',{...records.get('cms_users/alice'),active:false});
assert.equal(await login('alice',userPassword),null);
records.set('cms_users/alice',{...records.get('cms_users/alice'),active:true});
console.log('PASS: correct login, incorrect login, lockout, disabled user');

let session=fs.readFileSync(path.join(root,'lib/cms-session.js'),'utf8').replace(/^import .*?;\s*$/gm,'');
session=session.replace('export function createSession','function createSession').replace('export const cookieSettings','const cookieSettings').replace('export const clearCookie','const clearCookie').replace('export async function sessionUser','async function sessionUser').replace('export function requireRole','function requireRole');
session+='\n globalThis.__session={createSession,sessionUser,cookieSettings};';
const sessionCtx={adminDb:()=>db,createHash,createHmac,timingSafeEqual,Buffer,Date,process:{env:serverEnv}};
vm.runInNewContext(session,sessionCtx,{filename:'cms-session.js'});
const {createSession,sessionUser,cookieSettings}=sessionCtx.__session;
assert.equal(cookieSettings.httpOnly,true);
const cookie=createSession({id:'alice',sessionVersion:1});
const makeRequest=token=>({headers:{get:name=>name==='cookie'?'shaneryn_cms='+token:null}});
assert.equal((await sessionUser(makeRequest(cookie))).id,'alice');
assert.equal(await sessionUser(makeRequest(cookie+'tampered')),null);
records.set('cms_users/alice',{...records.get('cms_users/alice'),sessionVersion:2});
assert.equal(await sessionUser(makeRequest(cookie)),null,'Reset invalidates previous sessions');
records.set('cms_users/alice',{...records.get('cms_users/alice'),sessionVersion:1,active:false});
assert.equal(await sessionUser(makeRequest(cookie)),null,'Disabled user cannot reuse existing cookie');
console.log('PASS: signed session, tampering protection, password reset revocation, disabled-user revocation');
