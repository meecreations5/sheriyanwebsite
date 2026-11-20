// Verify login uses only pre-existing cms_users accounts; never provisions one.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {passwordHash,passwordVerify,normalizeUsername,validUsername} from '../lib/cms-password.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const files=['lib/cms-login-guard.js','app/api/admin/auth/login/route.js'];
const contents=files.map(f=>fs.readFileSync(path.join(root,f),'utf8'));
for(const src of contents)assert.doesNotMatch(src,/ensureInitialAdmin|CMS_INITIAL_ADMIN_USERNAME|CMS_INITIAL_ADMIN_PASSWORD|collection\('cms_internal'\)/);
assert.ok(!fs.existsSync(path.join(root,'lib/cms-initial-admin.js')));
assert.doesNotMatch(fs.readFileSync(path.join(root,'.env.example'),'utf8'),/^CMS_INITIAL_ADMIN_/m);

const records=new Map();
class Ref{
 constructor(col,id){this.key=col+'/'+id;this.id=id}
 async get(){const row=records.get(this.key);return {id:this.id,exists:row!==undefined,data:()=>row&&structuredClone(row)}}
 async delete(){records.delete(this.key)}
}
const db={
 collection:col=>({doc:id=>new Ref(col,id)}),
 async runTransaction(fn){const tx={get:ref=>ref.get(),set:(ref,body)=>records.set(ref.key,structuredClone(body))};return fn(tx)}
};
const original=fs.readFileSync(path.join(root,'lib/cms-login-guard.js'),'utf8');
let code=original.replace(/^import .*?;\s*$/gm,'').replace('export async function checkCredentials','async function checkCredentials');
code+='\n globalThis.verifyFromCmsUsers=checkCredentials;';
const context={adminDb:()=>db,passwordVerify,normalizeUsername,validUsername,FieldValue:{serverTimestamp:()=>new Date()},Buffer,Date};
vm.runInNewContext(code,context);
const login=context.verifyFromCmsUsers;
const pass='ExampleLongPassword#2026';
assert.equal(await login('owner',pass),null,'Unknown account must not authenticate');
assert.equal(records.has('cms_users/owner'),false,'Login must never auto-create an account');
assert.equal([...records.keys()].some(x=>x.startsWith('cms_internal/')),false);

// A single pre-existing Firestore cms_users document authenticates normally.
records.set('cms_users/owner',{
 username:'owner',role:'super_admin',active:true,sessionVersion:1,authMethod:'cms_users',passwordHash:await passwordHash(pass)
});
assert.equal((await login('OWNER',pass)).role,'super_admin');
assert.equal(await login('owner','WrongPassword#2026'),null);
assert.equal(records.has('cms_users/owner'),true);
assert.equal([...records.keys()].some(x=>x.startsWith('cms_internal/')),false);
console.log('PASS: only existing cms_users admin may login; no first-login provisioning or cms_internal records');
