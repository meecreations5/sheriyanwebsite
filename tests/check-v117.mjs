import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {passwordHash,passwordVerify,normalizeUsername,validUsername} from '../lib/cms-password.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const checks=[];
function check(name,fn){checks.push([name,fn])}
check('salted scrypt hashes never store plaintext and verify only the correct password',async()=>{
 const pw='ExampleGoodPassword#123';const first=await passwordHash(pw),second=await passwordHash(pw);
 assert.notEqual(first,second);assert.equal(first.includes(pw),false);
 assert.equal(await passwordVerify(pw,first),true);
 assert.equal(await passwordVerify('wrong',first),false);
 assert.equal(await passwordVerify('wrong','invalid'),false);
});
check('username normalisation and validation',()=>{
 assert.equal(normalizeUsername(' Admin_01 '),'admin_01');assert.ok(validUsername('admin_01'));assert.equal(validUsername('../bad'),false);
});
check('Firebase Admin SDK removed, Google Cloud trusted server SDK used',()=>{
 const packageInfo=JSON.parse(read('package.json'));
 assert.equal(packageInfo.dependencies['firebase-admin'],undefined);
 assert.ok(packageInfo.dependencies['@google-cloud/firestore']);
 assert.ok(packageInfo.dependencies['@google-cloud/storage']);
 const server=read('lib/cms-admin-server.js');
 assert.ok(server.includes("from '@google-cloud/firestore'"));
 assert.ok(server.includes("from '@google-cloud/storage'"));
 assert.doesNotMatch(server,/from ['"]firebase-admin\//);
 for(const f of ['lib/cms-server-api.js','lib/cms-media-server.js','lib/cms-login-guard.js','app/api/requests/route.js','app/api/admin/media/sign/route.js']){
  assert.doesNotMatch(read(f),/firebase-admin\//,f);
 }
});
check('only username/password in login; no Firebase Auth, setup token or setup screen',()=>{
 const ui=read('components/admin/CmsApp.jsx');
 assert.ok(ui.includes("authApi('login',{username:identifier,password})"));
 assert.doesNotMatch(ui,/setSetupToken|setSetup\(|First-time Super Admin setup|ONE-TIME SETUP CODE|authApi\('setup'/);
 assert.doesNotMatch(read('lib/cms-client-api.js'),/firebase\/auth|firebase\/firestore/);
 assert.ok(read('app/api/admin/auth/setup/route.js').includes('status:410'));
 assert.doesNotMatch(read('lib/cms-login-guard.js'),/ensureInitialAdmin|CMS_INITIAL_ADMIN_/);
 assert.equal(fs.existsSync(path.join(ROOT,'lib/cms-initial-admin.js')),false);
 assert.ok(read('lib/cms-login-guard.js').includes("collection('cms_users')"));
});
check('admin session protected by signed strict httpOnly cookie',()=>{
 const session=read('lib/cms-session.js');
 for(const word of ['httpOnly:true',"sameSite:'strict'",'timingSafeEqual','sessionVersion','sha256'])assert.ok(session.includes(word),word);
 assert.ok(session.includes("adminDb().collection('cms_users')"));
 assert.ok(read('app/api/admin/auth/login/route.js').includes('checkCredentials'));
});
check('cms_users credentials protected from browser and API responses',()=>{
 const rules=read('firestore.rules');
 for(const col of ['cms_users','cms_requests','cms_login_attempts','cms_internal','cms_pending_uploads']){
  assert.match(rules,new RegExp('match /'+col+'/\\{id\\} \\{ allow read,write: if false; \\}'));
 }
 assert.ok(read('lib/cms-server-api.js').includes('passwordHash,password,secret,resetToken,setupToken,...safe'));
 assert.ok(read('lib/cms-server-api.js').includes('passwordHash('));
 assert.ok(read('app/api/admin/cms/[[...path]]/route.js').includes('sessionUser'));
});
check('all visitor form writes stay behind server API',()=>{
 const src=read('app/api/requests/route.js');
 assert.ok(src.includes("adminDb().collection('cms_requests')"));
 assert.doesNotMatch(src,/publicCmsDb|firebase\/firestore/);
});
check('media dimensions and video upload guidance still present',()=>{
 const ui=read('components/admin/CmsApp.jsx');
 for(const str of ['1920 × 1080 px','1080 × 1920 px','1200 × 1600 px','1200 × 1800 px','1600 × 1200 px','Upload Video','YouTube Link','MediaGuide'])assert.ok(ui.includes(str),str);
 for(const f of ['app/api/admin/media/upload/route.js','app/api/admin/media/sign/route.js','app/api/admin/media/complete/route.js'])assert.ok(fs.existsSync(path.join(ROOT,f)));
});
check('original public website routes, styles, images and menu intact',()=>{
 for(const f of ['app/page.js','app/look/[productSlug]/page.js','app/collections/[collectionSlug]/page.js','components/LegacyScripts.jsx','components/LegacyPage.jsx','public/assets/hero-client-shaneryn7231.jpg'])assert.ok(fs.existsSync(path.join(ROOT,f)),f);
});
let failed=0;
for(const [name,fn] of checks){try{await fn();console.log('PASS:',name)}catch(e){failed++;console.error('FAIL:',name,e.message)}}
console.log(`${checks.length-failed}/${checks.length} passed`);
if(failed)process.exitCode=1;
