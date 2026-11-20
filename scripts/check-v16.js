const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const admin=read('components/admin/CmsApp.jsx');
const api=read('lib/cms-client-api.js');
const render=read('lib/render-page.js');
const rules=read('firestore.rules');
const legacy=read('components/LegacyScripts.jsx');
const product=read('data/seed/products.json');
const categories=JSON.parse(read('data/seed/categories.json'));
assert.equal(JSON.parse(product).length,8);
assert.equal(categories.length,6);
assert.match(admin,/function CategoryManager/);
assert.match(admin,/function CollectionManager/);
assert.match(admin,/function ChipEditor/);
assert.match(admin,/function LinkPicker/);
assert.match(admin,/function MultiProductPicker/);
assert.match(admin,/function MeasurementGroupEditor/);
assert.match(admin,/Selected Products|Select Products/);
assert.match(admin,/Garment Category/);
assert.match(admin,/Best Seller/);
assert.doesNotMatch(admin,/Best Seller product ID/);
assert.doesNotMatch(admin,/Featured product IDs \(comma-separated\)/);
assert.doesNotMatch(admin,/Garment pieces \(comma-separated\)/);
assert.match(admin,/createUserWithEmailAndPassword\(secondaryAuth,email,form\.password\)/);
assert.match(api,/cms_categories/);
assert.match(api,/cms_curated_collections/);
assert.match(api,/writeBatch/);
assert.match(api,/collectionIds/);
assert.match(render,/function patchCuratedCollections/);
assert.match(legacy,/SHANERYN_VISIBLE_CATEGORIES/);
assert.match(rules,/match \/cms_categories\//);
assert.match(rules,/match \/cms_curated_collections\//);
assert.ok(fs.existsSync(path.join(root,'app/collections/[collectionSlug]/page.js')));

// Run the actual Firestore client adapter against an in-memory Firestore simulation.
// No Firebase keys, network, admin credentials, or live data are needed for this test.
const store=new Map();
function key(c,id){return c+'/'+id}
function doc(_db,c,id){return {collection:c,id}}
function collection(_db,c){return {collection:c}}
function write(c,id,data,opts={}){const k=key(c,id);store.set(k,opts.merge?{...(store.get(k)||{}),...data}:data)}
function getDoc(d){const data=store.get(key(d.collection,d.id));return Promise.resolve({id:d.id,exists:()=>Boolean(data),data:()=>data})}
function getDocs(c){const rows=[...store].filter(([k])=>k.startsWith(c.collection+'/')).map(([k,val])=>({id:k.slice(c.collection.length+1),data:()=>val}));return Promise.resolve({docs:rows})}
function writeBatch(){const ops=[];return {set(d,v,options){ops.push([d,v,options])},async commit(){ops.forEach(([d,v,opt])=>write(d.collection,d.id,v,opt))}}}
const seedMap={manifest:JSON.parse(read('data/seed/manifest.json')),products:JSON.parse(product),categories,'curated-collections':[],collections:categories,settings:JSON.parse(read('data/seed/settings.json')),forms:JSON.parse(read('data/seed/forms.json'))};
const context={URL,crypto:require('node:crypto').webcrypto,console,
 firebaseAuth:{currentUser:{uid:'test-admin',email:'admin@example.test'}},cmsDb:{},
 doc,collection,getDoc,getDocs,
 setDoc:async(d,v,opt)=>write(d.collection,d.id,v,opt),
 addDoc:async()=>({id:'revision'}),
 deleteDoc:async d=>{store.delete(key(d.collection,d.id))},
 updateDoc:async(d,v)=>write(d.collection,d.id,v,{merge:true}),
 writeBatch,query:x=>x,orderBy:()=>{},limit:()=>{},serverTimestamp:()=>('test-timestamp'),
 fetch:async url=>{const keyName=decodeURIComponent(url.split('/').pop());const item=seedMap[keyName];return {ok:item!==undefined,json:async()=>item}}
};
store.set('cms_users/test-admin',{username:'tester',role:'super_admin',active:true});
// This is the legacy collection used as a CATEGORY in V1.5.
store.set('cms_collections/pant-sets',{id:'pant-sets',name:'Pant Sets',copy:'Previously edited description',visible:true,sortOrder:0});
store.set('cms_collections/custom-outfits',{id:'custom-outfits',name:'Custom Outfits',copy:'Old custom category',visible:true,sortOrder:6});
const stripped=api.replace(/^'use client';/m,'').replace(/^import\s+[\s\S]*?from\s*['"][^'"]+['"];?/gm,'').replace('export async function cmsApi','async function cmsApi')+'\nthis.cmsApi=cmsApi;';
vm.runInNewContext(stripped,context,{filename:'cms-client-api.js'});
(async()=>{
 context.productSlug=(await import('data:text/javascript;base64,'+Buffer.from(read('lib/product-paths.js')).toString('base64'))).productSlug;
 let cats=await context.cmsApi('categories');
 assert.equal(cats.length,7,'Legacy custom categories must be retained');
 assert.equal(cats.find(c=>c.id==='pant-sets').copy,'Previously edited description');
 let edits=await context.cmsApi('collections');assert.equal(edits.length,0,'Legacy categories must not become curated edits');
 await context.cmsApi('collections',{method:'POST',body:{id:'festive-edit',name:'The Festive Edit',description:'Celebration looks',visible:true,productIds:['SH-SUNSHINE','SH-STARLIGHT']}});
 edits=await context.cmsApi('collections');
 assert.equal(edits.length,1);
 assert.equal(JSON.stringify([...edits[0].productIds].sort()),JSON.stringify(['SH-STARLIGHT','SH-SUNSHINE'].sort()));
 assert.equal(JSON.stringify(store.get('cms_products/SH-SUNSHINE').collectionIds),JSON.stringify(['festive-edit']));
 await context.cmsApi('categories/pant-sets',{method:'PUT',body:{id:'pant-sets',name:'Modern Pant Sets',copy:'Contemporary separates',visible:true,sortOrder:0}});
 cats=await context.cmsApi('categories');
 assert.equal(cats.find(c=>c.id==='pant-sets').name,'Modern Pant Sets');
 assert.equal(store.get('cms_products/SH-SUNSHINE').cat,'Modern Pant Sets');
 assert.equal(store.get('cms_products/SH-SUNSHINE').collectionIds[0],'festive-edit','Collection membership should survive category rename');
 await context.cmsApi('collections/festive-edit',{method:'PUT',body:{id:'festive-edit',name:'The Festive Edit',description:'Celebration looks',visible:true,productIds:['SH-STARLIGHT']}});
 assert.equal((store.get('cms_products/SH-SUNSHINE').collectionIds||[]).includes('festive-edit'),false,'Removing a product from the collection must be saved');
 assert.equal(store.get('cms_products/SH-STARLIGHT').collectionIds.includes('festive-edit'),true);
 await context.cmsApi('collections',{method:'POST',body:{id:'evening-edit',name:'The Evening Edit',visible:true,productIds:['SH-STARLIGHT']}});
 assert.equal(store.get('cms_products/SH-STARLIGHT').collectionIds.length,2,'A product can belong to multiple curated collections');
 console.log('PASS V1.6: 7 categories (6 baseline + 1 legacy custom), curated collection CRUD, 2 initial linked products, 2 curated collections, membership updates, category rename, selectors and rules');
})().catch(err=>{console.error(err);process.exitCode=1});
