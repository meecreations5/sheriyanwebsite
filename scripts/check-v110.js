const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const {createResetStaffPasswordHandler} = require('../functions/reset-staff-password');

class HttpsError extends Error {constructor(code, message) {super(message);this.code = code;}}
const now = 1795200000000;
const actorUid = 'superadmin123';
const targetUid = 'staffmember123';
const records = {
  [`cms_users/${actorUid}`]: {role: 'super_admin', active: true, username: 'superadmin'},
  [`cms_users/${targetUid}`]: {role: 'editor', active: true, username: 'designer01'},
};
const writes=[];
const accounts=[];
const revoked=[];
const audit=[];
const db={
  doc: id => ({
    id,
    async get() {return {exists: !!records[id], data: () => records[id]};},
  }),
  collection: name => ({async add(entry) {audit.push({name,entry});return {id:'audit-001'};}}),
  async runTransaction(fn) {
    return fn({
      async get(ref) {return {exists:!!records[ref.id], data:()=>records[ref.id]};},
      set(ref,data) {records[ref.id] = data; writes.push({id:ref.id,data});},
    });
  },
};
const auth={
  async getUser(uid) {if(uid!==targetUid)throw Object.assign(new Error('not found'),{code:'auth/user-not-found'});return {uid};},
  async updateUser(uid, update) {accounts.push({uid,update});},
  async revokeRefreshTokens(uid) {revoked.push(uid);},
};
const handler = createResetStaffPasswordHandler({db,auth,HttpsError,now:()=>now});
const request=(patch={})=>({auth:{uid:actorUid,token:{auth_time:now/1000-30}},data:{uid:targetUid,newPassword:'AnExampleOnly_Valid0123'},...patch});
const fail=async (arg,code)=>{await assert.rejects(handler(arg), e=>e.code===code,`Expected ${code}`);};

(async()=>{
 await fail({data:{}},'unauthenticated');
 await fail(request({auth:{uid:actorUid,token:{auth_time:now/1000-3600}}}),'failed-precondition');
 await fail(request({data:{uid:actorUid,newPassword:'AnExampleOnly_Valid0123'}}),'failed-precondition');
 await fail(request({data:{uid:targetUid,newPassword:'short'}}),'invalid-argument');
 records[`cms_users/${actorUid}`].role='editor';
 await fail(request(),'permission-denied');
 records[`cms_users/${actorUid}`].role='super_admin';
 const result=await handler(request());
 assert.equal(result.ok,true);
 assert.deepEqual(accounts,[{uid:targetUid,update:{password:'AnExampleOnly_Valid0123'}}]);
 assert.deepEqual(revoked,[targetUid]);
 assert.equal(audit.length,1);
 assert.deepEqual(Object.keys(audit[0].entry).sort(),['action','actorUid','performedAtMs','targetUid']);
 assert.equal(JSON.stringify({records,audit}).includes('AnExampleOnly_Valid0123'),false,'Password must never be persisted in CMS database');
 for(let i=0;i<4;i++)await handler(request());
 await fail(request(),'resource-exhausted');
 assert.equal(accounts.length,5,'A maximum of 5 password updates should be permitted during rate window');

 const ui=read('components/admin/CmsApp.jsx');
 const functions=read('functions/index.js');
 const firebaseJson=JSON.parse(read('firebase.json'));
 const pkg=JSON.parse(read('package.json'));
 const fnPkg=JSON.parse(read('functions/package.json'));
 assert.match(ui,/function ResetStaffPassword/);
 assert.match(ui,/getFunctions\(firebaseApp,'asia-south1'\)/);
 assert.match(ui,/httpsCallable\(/);
 assert.match(ui,/onClick=\{\(\)=>setResetTarget\(user\)\}/);
 assert.match(ui,/user\.id!==me\.uid/,'Super Admin must not reset their own password with staff-reset action');
 assert.match(ui,/Generate Strong Password/);
 assert.equal(firebaseJson.functions.source,'functions');
 assert.equal(firebaseJson.functions.runtime,'nodejs22');
 assert.equal(fnPkg.engines.node,'22');
 assert.match(pkg.version,/^1\.(?:10|11|12)\.0$/);
 assert.match(functions,/onCall\(/);
 assert.doesNotMatch(ui,/serviceAccount|privateKey|adminsdk/);
 console.log('PASS V1.10: secured callable password reset, Super Admin role check, recent login, no self reset, 5-per-window rate limit, revoke refresh tokens, and UI wiring');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
