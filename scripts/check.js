const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),base=path.join(root,'data','seed');
const must=(ok,why)=>{if(!ok)throw new Error(why)};
const manifest=JSON.parse(fs.readFileSync(path.join(base,'manifest.json'),'utf8'));
const products=JSON.parse(fs.readFileSync(path.join(base,'products.json'),'utf8'));
let fields=0,sections=0,assetCount=0;
for(const p of manifest){
 const doc=JSON.parse(fs.readFileSync(path.join(base,'pages',p.slug+'.json'),'utf8'));
 must(doc.bodyHtml&&doc.fields?.length,'Missing page content '+p.slug);
 const fieldIds=new Set(),sectionsIds=new Set();
 for(const item of doc.fields){must(!fieldIds.has(item.id),'Duplicate field '+p.slug+': '+item.id);fieldIds.add(item.id);if(item.kind==='text')must(doc.bodyHtml.includes('<!--cms:'+item.id+'-->')&&doc.bodyHtml.includes('<!--/cms:'+item.id+'-->'),'Missing text anchor '+p.slug+': '+item.id)}
 for(const item of doc.sections){must(!sectionsIds.has(item.id),'Duplicate section '+p.slug+': '+item.id);sectionsIds.add(item.id);must(doc.bodyHtml.includes('data-cms-section="'+item.id+'"'),'Missing section markup '+p.slug+': '+item.id)}
 for(const file of [...doc.styles,...doc.scripts])must(fs.existsSync(path.join(root,'public',file)),'Missing asset '+p.slug+': '+file);
 fields+=doc.fields.length;sections+=doc.sections.length;
}
must(products.length===8,'Baseline should include the eight approved looks');
for(const file of fs.readdirSync(path.join(root,'public'))){if(file.endsWith('.js')){cp.execFileSync(process.execPath,['--check',path.join(root,'public',file)],{stdio:'pipe'});assetCount++}}
must(!JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).dependencies['firebase-admin'],'Firebase Admin SDK should not be needed for browser CMS login');
must(fs.readFileSync(path.join(root,'components/admin/CmsApp.jsx'),'utf8').includes('signInWithEmailAndPassword(firebaseAuth,authEmail,password)'),'Direct Firebase Authentication username login is missing');
must(fs.readFileSync(path.join(root,'lib/cms-client-api.js'),'utf8').includes("getDoc"),'Firestore client CRUD adapter is missing');
for(const file of ['EASY_SETUP.md','firestore.rules','storage.rules','app/api/requests/route.js','app/api/cms-seed/[key]/route.js'])must(fs.existsSync(path.join(root,file)),'Missing Firebase direct-auth setup component: '+file);
console.log(JSON.stringify({status:'PASS',pages:manifest.length,editableFields:fields,sections,baselineProducts:products.length,legacyScriptsChecked:assetCount},null,2));
console.log('Note: Next.js build, Firebase Auth/Firestore/Storage and deployed responsive QA require npm install and live Firebase access.');
