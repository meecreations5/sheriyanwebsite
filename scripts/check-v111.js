const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const ui=read('components/admin/CmsApp.jsx');
const css=read('app/admin/admin.css');
const api=read('lib/cms-client-api.js');
const rules=read('firestore.rules');
const fn=read('functions/reset-staff-password.js');
const first=ui.indexOf('function Login(');
const middle=ui.indexOf('function ResetStaffPassword(');
const end=ui.indexOf('function MediaPicker(');
const manager=ui.slice(ui.indexOf('function UserManager('),ui.indexOf('export default function CmsApp('));
const login=ui.slice(first,ui.indexOf('function PasswordChange('));
const reset=ui.slice(middle,end);
assert.ok(first>0&&middle>first&&end>middle,'Expected login and reset modules');
// Existing legacy admins can sign in with their real Firebase email; new username accounts still work.
assert.match(login,/resolveAdminLogin\(identifier\)/);
assert.match(login,/USERNAME OR ORIGINAL ADMIN EMAIL/);
assert.match(login,/original Super Admin may use an email login/i);
assert.match(login,/sendPasswordResetEmail\(firebaseAuth,resolveAdminLogin\(identifier\)\)/);
// Only the requested primary user actions are visible without exposing advanced role changes.
assert.match(manager,/\+ Create User/);
assert.match(manager,/Reset Password/);
assert.match(manager,/Disable User/);
assert.match(manager,/Enable User/);
assert.match(manager,/<details className="cms-staff-permissions">/);
assert.match(manager,/if\(user\.id===me\.uid\)/);
assert.match(manager,/window\.confirm\('Disable /);
assert.match(manager,/createUserWithEmailAndPassword\(secondaryAuth,email,form\.password\)/);
assert.match(manager,/await deleteUser\(created\.user\)/);
// Email-based accounts require no Cloud Function for link-based recovery.
assert.match(reset,/const hasMailbox=.*!isInternalStaffEmail\(realEmail\)/);
assert.match(reset,/await sendPasswordResetEmail\(firebaseAuth,realEmail\)/);
assert.match(reset,/setMethod\('manual'\)/);
// Username-only accounts use V1.10 authenticated Admin SDK callable, never a Firestore password field.
assert.match(reset,/httpsCallable\(getFunctions\(firebaseApp,'asia-south1'\),'resetStaffPassword'\)/);
assert.match(fn,/await auth\.updateUser\(targetUid, \{password: newPassword\}\)/);
assert.match(fn,/actor\.data\(\)\?\.role !== 'super_admin'/);
assert.match(api,/if\(kind==='users'\)/);
const usersRuleBlock=rules.split('match /cms_users/{uid} {')[1]?.split('match /cms_requests/')[0]||'';
assert.match(usersRuleBlock,/allow get: if request.auth/);
assert.doesNotMatch(usersRuleBlock,/allow (?:read|write): if true;/); // Firestore users are not publicly open
assert.doesNotMatch(manager,/password:form\.password/);
assert.match(css,/\.cms-staff-row/);
assert.match(css,/@media\(max-width:850px\)/);
const pkg=JSON.parse(read('package.json'));
assert.ok(['1.11.0','1.12.0','1.13.0'].includes(pkg.version));
console.log('PASS V1.11: compact Admin Users, guarded disable, existing login guidance, email password recovery, secure callable fallback, no Firestore passwords');
