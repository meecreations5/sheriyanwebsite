// V1.13 menu controller and password-reset regression checks.
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const checks=[
 ['Next.js root layout loads menu script before hydration',()=>/import Script from 'next\/script'/.test(read('app/layout.js')) && /<Script src="\/cms-menu-controller\.js" strategy="beforeInteractive"/.test(read('app/layout.js'))],
 ['Menu script uses delegated capture click',()=>/addEventListener\('click',[\s\S]*?true\)/.test(read('public/cms-menu-controller.js'))],
 ['Menu handles header and mobile bottom tab',()=>read('public/cms-menu-controller.js').includes('#menu-toggle, .v5-tabbar [data-v5-tab="menu"]')],
 ['Menu keeps appropriate ARIA state',()=>read('public/cms-menu-controller.js').includes("menu.setAttribute('aria-hidden'") && read('public/cms-menu-controller.js').includes("trigger.setAttribute('aria-expanded'")],
 ['Menu handles legacy script click collisions',()=>read('public/cms-menu-controller.js').includes('stopImmediatePropagation()')],
 ['Password reset does not claim success on server failures',()=>read('components/admin/CmsApp.jsx').includes('Password was NOT changed')],
 ['Password reset still uses secured Firebase Callable Function',()=>read('components/admin/CmsApp.jsx').includes("httpsCallable(getFunctions(firebaseApp,'asia-south1'),'resetStaffPassword')")],
 ['Password strings never stored in Firestore by reset handler',()=>!read('functions/reset-staff-password.js').includes('newPassword,') && read('functions/reset-staff-password.js').includes('auth.updateUser(targetUid, {password: newPassword})')],
 ['Existing server serialization fix retained',()=>read('components/LegacyPage.jsx').includes('toPlainClientData')],
];
for(const [name,fn] of checks){if(!fn())throw new Error('FAILED: '+name);console.log('PASS:',name)}
console.log('All V1.13 source checks passed ('+checks.length+').');
