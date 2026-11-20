const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname,'..');
const admin = fs.readFileSync(path.join(root,'components/admin/CmsApp.jsx'),'utf8');
const css = fs.readFileSync(path.join(root,'app/admin/admin.css'),'utf8');
const rules = fs.readFileSync(path.join(root,'firestore.rules'),'utf8');
const navExpr = admin.match(/^const NAV=(.*);$/m);
assert.ok(navExpr,'Admin module catalogue exists');
const nav = vm.runInNewContext(navExpr[1]);
const labels = nav.map(v=>v[2]);
assert.equal(labels.length,11,'V1.6 has eleven distinct admin modules');
assert.equal(new Set(nav.map(v=>v[0])).size,11);
for (const name of ['Dashboard','Admin Users','Page Manager','Products & Looks','Categories','Collections','Forms','Enquiries','Appointments','Media Library','Global Settings']) {
 assert.ok(labels.includes(name),'Missing admin module '+name);
}
const expr = admin.match(/^ const allowed=\(view\)=>(.*);$/m);
assert.ok(expr,'Role based UI menu permissions exist');
for (const role of ['super_admin','editor','products','enquiries','viewer']) {
 const allowed = vm.runInNewContext('(view) => '+expr[1],{me:{role}});
 const visible = nav.filter(([key])=>allowed(key)).map(([key])=>key);
 assert.equal(visible.includes('users'),role==='super_admin','Staff management should remain Super Admin only');
 assert.ok(visible.includes('dashboard'),'Dashboard missing for '+role);
 console.log(role+': '+visible.join(', '));
}
assert.ok(nav.findIndex(v=>v[0]==='users')<4,'Users must be near top of desktop nav');
assert.match(admin,/const availableNav=NAV\.filter/);
assert.match(admin,/admin-mobile-nav/);
assert.match(admin,/admin-mobile-module/);
assert.match(admin,/availableNav\.map\(\(\[key,,name\]\)/);
assert.match(admin,/canOpen\(to\)/,'Dashboard must not show inaccessible actions');
assert.match(admin,/admin-mobile-actions/);
assert.match(css,/\.admin-sidebar nav\{display:none\}/);
assert.match(css,/\.admin-mobile-nav select/);
assert.match(css,/\.admin-mobile-actions/);
assert.match(rules,/allow list: if superAdmin\(\)/,'List users only for Super Admin');
assert.match(rules,/allow create: if superAdmin\(\)/,'Only Super Admin can create staff role documents');
console.log('PASS V1.7: nav inventory, role permissions, responsive menu and mobile sign-out');
