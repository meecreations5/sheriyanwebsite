// No Firebase credentials needed. Exercises the REAL cmsServerApi logic with a
// deterministic in-memory stand-in for Firestore's Firestore server collection surface.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {passwordHash,passwordVerify,normalizeUsername,validUsername,validPassword} from '../lib/cms-password.mjs';
import {normalizeProductDetails} from '../lib/product-details.mjs';
import {upgradeLookEditorialPatches} from '../lib/look-editorial-defaults.mjs';
import {collectionType} from '../lib/catalogue-model.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const docs=new Map();
class Ref{
 constructor(collection,id){this.name=collection;this.id=id;this.key=collection+'/'+id}
 async get(){const value=docs.get(this.key);return {id:this.id,exists:value!==undefined,data:()=>value&&structuredClone(value)}}
 async create(value){if(docs.has(this.key)){const e=Error('already exists');e.code=6;throw e}docs.set(this.key,structuredClone(value))}
 async set(value,opts){docs.set(this.key,{...(opts?.merge?docs.get(this.key)||{}:{}),...structuredClone(value)})}
 async update(value){if(!docs.has(this.key))throw Error('Missing');const prev=docs.get(this.key);const changes={};for(const [k,v] of Object.entries(value))changes[k]=v&&typeof v==='object'&&'__increment'in v?Number(prev[k]||0)+v.__increment:v;docs.set(this.key,{...prev,...changes})}
 async delete(){docs.delete(this.key)}
}
class Collection{
 constructor(name){this.name=name}
 doc(id){return new Ref(this.name,id)}
 async get(){return {docs:[...docs].filter(([key])=>key.startsWith(this.name+'/')).map(([key,value])=>({id:key.split('/').at(-1),data:()=>structuredClone(value)}))}}
 async add(data){const id='auto'+String(docs.size);const ref=this.doc(id);await ref.create(data);return ref}
 orderBy(){return this}
 limit(){return this}
}
const db={collection(name){return new Collection(name)},batch(){const actions=[];return {set:(...args)=>actions.push(['set',args]),commit:async()=>{for(const [kind,args] of actions)await args[0][kind](...args.slice(1))}}}};
const FieldValue={serverTimestamp:()=>({__timestamp:true}),increment:x=>({__increment:x})};
let source=fs.readFileSync(path.join(ROOT,'lib/cms-server-api.js'),'utf8').replace(/^import .*?;\s*$/gm,'');
source=source.replace('export async function cmsServerApi','async function cmsServerApi')+'\n globalThis.exportedCmsApi=cmsServerApi;';
const seedFile=name=>JSON.parse(fs.readFileSync(path.join(ROOT,'data/seed',name),'utf8'));
const sandbox={adminDb:()=>db,FieldValue,seedProducts:()=>seedFile('products.json'),seedCategories:()=>seedFile('categories.json'),seedCuratedCollections:()=>seedFile('curated-collections.json'),collectionType,seedForms:()=>seedFile('forms.json'),seedSettings:()=>seedFile('settings.json'),pageSeed:slug=>seedFile('pages/'+slug+'.json'),pageManifest:()=>seedFile('manifest.json'),productSlug:x=>x.slug||x.id,normalizeUsername,validUsername,passwordHash,validPassword,normalizeProductDetails,upgradeLookEditorialPatches,crypto:globalThis.crypto,URL,Buffer,console,structuredClone};
vm.runInNewContext(source,sandbox,{filename:'cms-server-api.js'});
const api=sandbox.exportedCmsApi;
const owner={id:'owner',username:'owner',role:'super_admin',active:true};
const editor={id:'contentuser',username:'contentuser',role:'editor',active:true};
const oldPass='ExampleInitialPassword2026!';const nextPass='ExampleReplacementPassword2026!';
const made=await api('users',{method:'POST',body:{username:'contentuser',password:oldPass,role:'editor'}},owner);
assert.equal(made.id,'contentuser');
const saved=docs.get('cms_users/contentuser');
assert.ok(saved.passwordHash.startsWith('scrypt$'));assert.ok(!JSON.stringify(saved).includes(oldPass));
assert.equal(await passwordVerify(oldPass,saved.passwordHash),true);
const users=await api('users',{method:'GET'},owner);
assert.equal(users.length,1);assert.equal(users[0].username,'contentuser');assert.equal('passwordHash' in users[0],false);
await assert.rejects(api('users',{method:'GET'},editor),/permission/);
docs.set('cms_login_attempts/contentuser',{failures:5,blockedUntil:9999999999999});
await api('users/contentuser:reset',{method:'POST',body:{password:nextPass}},owner);
assert.equal(docs.has('cms_login_attempts/contentuser'),false,'Password reset must clear old login lockout');
const rotated=docs.get('cms_users/contentuser');
assert.equal(await passwordVerify(oldPass,rotated.passwordHash),false);
assert.equal(await passwordVerify(nextPass,rotated.passwordHash),true);
assert.equal(rotated.sessionVersion,2);
await api('users/contentuser',{method:'PUT',body:{role:'viewer',active:false}},owner);
assert.equal(docs.get('cms_users/contentuser').active,false);
assert.equal(docs.get('cms_users/contentuser').sessionVersion,3);
await assert.rejects(api('users/owner',{method:'PUT',body:{role:'editor',active:false}},owner),/disable or demote yourself|not found/i);
console.log('PASS: mock cms_users user-create, hash, redact, role-check, reset, disable, session revocation');

// Public catalogue and editor data remain usable through the server API.
const products=await api('products',{method:'GET'},owner);
assert.ok(products.length>=8,'Expected seeded product catalogue');
const product={...products[0],title:'QA Garment Name',visible:true,price:'₹ 18,500 ',productDetails:{fabric:[{garment:'Top',description:'Crepe'},{garment:'',description:'  '}],design:[],embroidery:'',occasions:['Gala Dinners',' ']}};
await api('products/'+product.id,{method:'PUT',body:product},owner);
const savedProduct=docs.get('cms_products/'+product.id);
assert.equal(savedProduct.title,'QA Garment Name');
assert.equal(savedProduct.price,'₹ 18,500');
assert.deepEqual(savedProduct.productDetails.fabric,[{garment:'Top',description:'Crepe'}]);
assert.deepEqual(savedProduct.productDetails.occasions,['Gala Dinners']);
assert.equal(savedProduct.occasion,products[0].occasion,'Catalogue filter is unchanged');
const pages=await api('pages',{method:'GET'},owner);
assert.ok(pages.length>=8,'Expected seeded pages');
const home=await api('pages/index',{method:'GET'},owner);
assert.ok(home.bodyHtml&&home.fields?.length,'Expected editable homepage fields');
const editable=home.fields.find(f=>f.kind==='text');
assert.ok(editable);
await api('pages/index',{method:'PUT',body:{...home,patches:{[editable.id]:{value:'Homepage QA Sample Text',visible:true}}}},owner);
const savedPage=docs.get('cms_pages/index');
assert.equal(savedPage.patches[editable.id].value,'Homepage QA Sample Text');
const forms=await api('forms',{method:'GET'},owner);
assert.ok(forms.length>=1,'Expected seeded enquiry/appointment forms');
const categories=await api('categories',{method:'GET'},owner);
assert.ok(categories.length>=4);
const settings=await api('settings',{method:'GET'},owner);
assert.ok(settings.home&&settings.branding);
console.log('PASS: mock page editor, product Save & Publish, forms, categories and settings');


// V1.19.3: catalogue domain, isolation and many-to-many assignment smoke test.
const productEditor={id:'merch',username:'merch',role:'products',active:true};
const readonly={id:'viewer',username:'viewer',role:'viewer',active:true};
const starter=await api('collections',{method:'GET'},owner);
assert.ok(starter.some(c=>c.id==='the-curve-edit'&&c.type==='clothing'&&!c.visible));
assert.ok(starter.some(c=>c.id==='the-curve-edit-adorned'));
await api('accessory-categories',{method:'POST',body:{id:'jewellery',name:'Jewellery',visible:true}},productEditor);
const accessory={id:'pearl-belt',name:'Pearl Belt',sku:'AC 001',price:'2750',categoryId:'jewellery',
 image:'assets/product-detail/sunshine/01.webp',relatedLookIds:['SH-SUNSHINE'],collectionIds:[],visible:true,sortOrder:1};
await api('accessories',{method:'POST',body:accessory},productEditor);
assert.equal(docs.get('cms_accessories/pearl-belt').price,'2750');
assert.equal(docs.get('cms_accessories/pearl-belt').categoryId,'jewellery');
assert.deepEqual(docs.get('cms_accessories/pearl-belt').relatedLookIds,['SH-SUNSHINE']);
await assert.rejects(api('accessories',{method:'POST',body:{...accessory,id:'bad-link',relatedLookIds:['MISSING']}},owner),/existing clothing look/);
await assert.rejects(api('accessories',{method:'POST',body:{...accessory,id:'bad-collection',collectionIds:['the-curve-edit']}},owner),/accessory collection/);
const edit={name:'The Finishing Edit',type:'accessories',visible:true,accessoryIds:['pearl-belt']};
await api('collections',{method:'POST',body:{id:'finishing-edit',...edit}},owner);
await api('collections',{method:'POST',body:{id:'evening-accessories',name:'Evening Accessories',type:'accessories',visible:true,accessoryIds:['pearl-belt']}},owner);
assert.deepEqual(docs.get('cms_accessories/pearl-belt').collectionIds,['finishing-edit','evening-accessories']);
const accessoryCollections=await api('collections',{method:'GET'},owner);
assert.ok(accessoryCollections.find(c=>c.id==='finishing-edit').accessoryIds.includes('pearl-belt'));
assert.ok(!accessoryCollections.find(c=>c.id==='finishing-edit').productIds.length);
await api('collections/finishing-edit',{method:'PUT',body:{...edit,accessoryIds:[]}},owner);
assert.deepEqual(docs.get('cms_accessories/pearl-belt').collectionIds,['evening-accessories']);
await api('collections/the-curve-edit',{method:'PUT',body:{name:'The Curve Edit',type:'clothing',productIds:['SH-SUNSHINE'],visible:true}},owner);
const seedLook=docs.get('cms_products/SH-SUNSHINE');
assert.ok(seedLook.collectionIds.includes('the-curve-edit'));
await assert.rejects(api('products/SH-SUNSHINE',{method:'PUT',body:{...seedLook,collectionIds:['evening-accessories']}},owner),/cannot belong to accessory collections/);
assert.equal(docs.get('cms_accessories/pearl-belt').collectionIds[0],'evening-accessories','clothing collections must never touch accessories');
await assert.rejects(api('collections/the-curve-edit',{method:'PUT',body:{name:'Type Change',type:'accessories',accessoryIds:[]}},owner),/cannot be changed/);
docs.set('cms_curated_collections/legacy-edit',{name:'Legacy Edit',visible:true});
assert.equal((await api('collections',{method:'GET'},owner)).find(c=>c.id==='legacy-edit').type,'clothing');
await assert.rejects(api('accessories',{method:'POST',body:{...accessory,id:'readonly-attempt'}},readonly),/permission/);
assert.equal((await api('accessories',{method:'GET'},productEditor)).length,1);
const publishedSettings=await api('settings',{method:'GET'},owner);
await api('settings',{method:'PUT',body:{...publishedSettings,home:{...publishedSettings.home,featuredCollectionIds:['the-curve-edit']}}},owner);
assert.deepEqual(docs.get('cms_settings/site').home.featuredCollectionIds,['the-curve-edit']);
console.log('PASS: independent accessory CRUD, categories, multi-collection assignments, look links, legacy collection compatibility and role isolation');

// V1.19.7: rename seeded category safely and publish an independently named category.
const beforeCategoryRename=structuredClone(docs.get('cms_products/SH-SUNSHINE'));
await api('categories/pant-sets',{method:'PUT',body:{id:'pant-sets',name:'Wide Leg Sets',visible:true}},owner);
assert.equal(docs.get('cms_products/SH-SUNSHINE').categoryId,'pant-sets');
assert.equal(docs.get('cms_products/SH-SUNSHINE').cat,'Wide Leg Sets');
assert.equal(docs.get('cms_products/SH-SUNSHINE').price,beforeCategoryRename.price,'Renaming must not modify price');
assert.equal(docs.get('cms_products/SH-SUNSHINE').title,beforeCategoryRename.title,'Renaming must not modify product name');
assert.deepEqual(docs.get('cms_products/SH-SUNSHINE').productDetails,beforeCategoryRename.productDetails,
 'Renaming must not replace product descriptions');
await assert.rejects(api('categories',{method:'POST',body:{id:'gowns',name:'Duplicate'}} ,owner),/already exists/);
await assert.rejects(api('categories',{method:'POST',body:{id:'copycat',name:'Wide Leg Sets'}} ,owner),/already has this name/);
await api('categories',{method:'POST',body:{id:'cape-sets',name:'Couture Cape Sets',visible:true}},owner);
assert.ok((await api('categories',{method:'GET'},owner)).some(c=>c.id==='cape-sets'));
await api('collections/the-curve-edit-adorned',{method:'PUT',body:{name:'The Curve Edit - Adorned',type:'clothing',productIds:['SH-SUNSHINE'],visible:true}},owner);
const member=docs.get('cms_products/SH-SUNSHINE');
assert.ok(member.collectionIds.includes('the-curve-edit')&&member.collectionIds.includes('the-curve-edit-adorned'),
 'One look can belong to two clothing collections without duplication');
await api('products/SH-SUNSHINE',{method:'PUT',body:{...member,categoryId:'cape-sets',cat:'Couture Cape Sets'}},owner);
assert.equal(docs.get('cms_products/SH-SUNSHINE').categoryId,'cape-sets');
await assert.rejects(api('products/SH-SUNSHINE',{method:'PUT',body:{...member,categoryId:'missing-category',cat:'Missing Category'}},owner),/valid clothing category/);
await assert.rejects(api('products/SH-SUNSHINE',{method:'PUT',body:{...member,collectionIds:['missing-edit']}},owner),/no longer exists/);
assert.ok(docs.get('cms_products/SH-SUNSHINE').collectionIds.includes('the-curve-edit-adorned'),
 'A rejected update cannot alter existing collection membership');
console.log('PASS: category rename preserves product fields, CMS creates a new category, seeded duplicates rejected, multiple clothing edits supported, invalid memberships rejected.');
