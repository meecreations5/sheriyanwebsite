import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const raw=read('lib/cms-data.js');
const ui=read('components/admin/CmsApp.jsx');
const render=read('lib/render-page.js');

// Real template fields: site grid uses the product's studio image, not its editorial image.
assert.match(render,/safeImage\(p\.catalogueImg\)\|\|safeImage\(p\.img\)/);
assert.match(ui,/Homepage four-look grid \/ collection card \(studio photograph\)/);
assert.match(ui,/if\(type!=='all'&&response\.item\?\.url\)\{onPick\(response\.item\.url\);onClose\(\);\}/);
assert.match(read('app/page.js'),/force-dynamic/);
assert.match(raw,/adminDb\(\)\.collection\(collectionName\)/);
assert.doesNotMatch(raw,/catch\(error\).*return \[\]/);

// Run the real public loader logic with mock Firestore backends, without cloud credentials.
let serverFails=false, publicFails=false, savedImage='https://storage.example/new-fire-heart.webp';
const base=[
 {id:'SH-SUNSHINE',title:'Sunshine',catalogueImg:'assets/sunshine.webp',visible:true},
 {id:'SH-FIREHEART',title:'Fire & Heart',img:'assets/looks/fire.jpg',catalogueImg:'assets/old-fire.webp',visible:true,sortOrder:2},
];
const collections={
 cms_products:()=>[{id:'SH-FIREHEART',catalogueImg:savedImage}],
 cms_pages:()=>[],cms_collections:()=>[],cms_categories:()=>[],
 cms_curated_collections:()=>[],cms_forms:()=>[],cms_settings:()=>[],
};
const snapshot=name=>({docs:(collections[name]?.()||[]).map(row=>({id:row.id,data:()=>row}))});
const documentSnapshot=(name,id)=>{
 const row=(collections[name]?.()||[]).find(row=>row.id===id);
 return {exists:!!row,data:()=>row};
};
const adminDb=()=>({collection:name=>({
 get:async()=>{if(serverFails)throw Error('server Firestore denied');return snapshot(name)},
 doc:id=>({get:async()=>{if(serverFails)throw Error('server Firestore denied');return documentSnapshot(name,id)}}),
})});
const getPublicDocs=async col=>{if(publicFails)throw Error('public Firestore denied');return snapshot(col.name)};
const getPublicDoc=async ref=>{if(publicFails)throw Error('public Firestore denied');const snap=documentSnapshot(ref.name,ref.id);return {exists:()=>snap.exists,data:()=>snap.data()}};
let source=raw.replace(/^import[^;]*;\s*$/gm,'').replace(/\bexport async function\b/g,'async function').replace(/\bexport const\b/g,'const').replace(/^export \{[^}]+\};?\s*$/gm,'');
source+='\nglobalThis.__cmsData={loadProducts,loadPage,loadSettings};\n';
const logs=[];
const context={adminDb,getPublicDocs,getPublicDoc,doc:(_db,name,id)=>({name,id}),collection:(_db,name)=>({name}),publicCmsDb:{},
 pageSeed:()=>null,pageManifest:()=>[],seedProducts:()=>structuredClone(base),seedCategories:()=>[],seedCuratedCollections:()=>[],seedForms:()=>({}),seedSettings:()=>({}),
 console:{warn:(...args)=>logs.push(['warn',...args]),error:(...args)=>logs.push(['error',...args])},structuredClone};
vm.runInNewContext(source,context,{filename:'cms-data.js'});

// The published image overrides packaged/seed imagery.
let products=await context.__cmsData.loadProducts();
assert.equal(products.find(p=>p.id==='SH-FIREHEART').catalogueImg,savedImage);
// Updating the same product again never needs a rebuild or seed change.
savedImage='https://storage.example/updated-fire-heart.webp';
products=await context.__cmsData.loadProducts();
assert.equal(products.find(p=>p.id==='SH-FIREHEART').catalogueImg,savedImage);
// If Cloud IAM read fails, the public SDK can still read published product records.
serverFails=true;
products=await context.__cmsData.loadProducts();
assert.equal(products.find(p=>p.id==='SH-FIREHEART').catalogueImg,savedImage);
// If both reads are unavailable, visibly fail instead of showing the OLD seed photo.
publicFails=true;
await assert.rejects(context.__cmsData.loadProducts(),/cannot be loaded/);
assert.ok(logs.some(x=>x[0]==='error'));
// Unpublished new products are still in the baseline as before when Firestore is empty.
serverFails=false;
collections.cms_products=()=>[];
products=await context.__cmsData.loadProducts();
assert.equal(products.find(p=>p.id==='SH-FIREHEART').catalogueImg,'assets/old-fire.webp');
console.log('PASS: CMS product image publishing uses Firestore records; no silent stale fallback; auto-select upload; field mapping');
