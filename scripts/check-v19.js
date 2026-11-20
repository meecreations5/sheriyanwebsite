const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');

(async()=>{
 const source=read('lib/admin-identity.js');
 const identity=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const {normalizeAdminUsername,validAdminUsername,usernameToAuthEmail,resolveAdminLogin,isInternalStaffEmail}=identity;
 const cases=['designer01','Editor_02','admin.one','MOBILE-LEAD'];
 for(const name of cases){
  assert.equal(validAdminUsername(name),true,name);
  assert.equal(usernameToAuthEmail(name),usernameToAuthEmail(name.toLowerCase()),'username sign-in must be case insensitive');
  assert.equal(resolveAdminLogin(name),usernameToAuthEmail(name));
  assert.equal(isInternalStaffEmail(usernameToAuthEmail(name)),true);
 }
 for(const name of ['', 'ab', '.test','test.', 'bad..name', 'has space','evil@example.com','/admin','bad!name','x'.repeat(33)]){
  assert.equal(validAdminUsername(name),false,'invalid username: '+name);
  assert.throws(()=>usernameToAuthEmail(name));
 }
 assert.equal(normalizeAdminUsername('  Editor_02  '),'editor_02');
 assert.equal(resolveAdminLogin('  old.admin@example.com  '),'old.admin@example.com','legacy email login must still work');
 assert.equal(isInternalStaffEmail('old.admin@example.com'),false);
 assert.equal(isInternalStaffEmail('staff.not..valid@shanerynwesbite.firebaseapp.com'),false);
 assert.throws(()=>resolveAdminLogin('bad@@example.com'));

 const admin=read('components/admin/CmsApp.jsx');
 const api=read('lib/cms-client-api.js');
 const rules=read('firestore.rules');
 const userEditor=admin.slice(admin.indexOf('function UserManager('),admin.indexOf('export default function CmsApp'));
 const login=admin.slice(admin.indexOf('function Login('),admin.indexOf('function PasswordChange('));
 assert.match(login,/USERNAME/);
 assert.match(login,/resolveAdminLogin\(identifier\)/);
 assert.match(login,/signInWithEmailAndPassword\(firebaseAuth,authEmail,password\)/);
 assert.doesNotMatch(login,/type="email"/);
 assert.match(login,/Original Super Admin: enter the email shown in Firebase Authentication/);
 assert.match(userEditor,/const initial=\{username:'',password:'',role:'editor'\}/);
 assert.doesNotMatch(userEditor,/label="Email address/);
 assert.doesNotMatch(userEditor,/form\.email/);
 assert.match(userEditor,/usernameToAuthEmail\(username\)/);
 assert.match(userEditor,/createUserWithEmailAndPassword\(secondaryAuth,email,form\.password\)/);
 assert.match(userEditor,/loginType:'username'/);
 assert.match(userEditor,/setPersistence\(secondaryAuth,inMemoryPersistence\)/);
 assert.match(userEditor,/await deleteUser\(created.user\)/);
 assert.match(admin,/function PasswordChange/);
 assert.match(admin,/reauthenticateWithCredential/);
 assert.match(admin,/updatePassword\(user,nextPassword\)/);
 assert.match(admin,/Change Password/);
 assert.match(api,/loginType:'username'/);
 assert.match(api,/validAdminUsername/);
 assert.match(api,/usernameToAuthEmail/);
 assert.match(rules,/allow create: if superAdmin\(\)/);
 assert.doesNotMatch(JSON.stringify(require(path.join(root,'package.json')).dependencies),/firebase-admin/);
 console.log('PASS V1.9: username-only staff onboarding, deterministic Firebase Auth alias, legacy login, role documents, password changes');
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
