import 'server-only';
import {getDoc as getPublicDoc,getDocs as getPublicDocs,doc,collection} from 'firebase/firestore';
import {publicCmsDb} from '@/lib/firebase-public-server';
import {adminDb} from '@/lib/cms-admin-server';
import {pageSeed,pageManifest,seedProducts,seedCategories,seedCuratedCollections,seedSettings,seedForms} from '@/lib/seed';
import {upgradeLookEditorialPatches} from '@/lib/look-editorial-defaults.mjs';

// Public content is rendered on the Next.js server. Read it through the same
// Firestore project/identity used for CMS publishing, avoiding a common case
// where the CMS saves successfully but website reads are rejected by rules.
// The public Web SDK remains a fallback for development environments without
// server credentials. NEVER silently substitute seed imagery after read errors.
const PUBLIC_CONTENT_COLLECTIONS=new Set([
 'cms_pages','cms_products','cms_collections','cms_categories',
 'cms_curated_collections','cms_forms','cms_settings'
]);
function assertPublicCollection(name){
 if(!PUBLIC_CONTENT_COLLECTIONS.has(name))throw Error('Invalid public CMS content collection');
}
async function contentDoc(collectionName,id){
 assertPublicCollection(collectionName);
 try{
  const snap=await adminDb().collection(collectionName).doc(id).get();
  return snap.exists?snap.data():null;
 }catch(serverError){
  console.warn('SHANERYN server CMS read unavailable:',collectionName,serverError.message);
  try{
   const snap=await getPublicDoc(doc(publicCmsDb,collectionName,id));
   return snap.exists()?snap.data():null;
  }catch(publicError){
   console.error('SHANERYN published CMS read failed:',collectionName,publicError.message);
   throw Error('Published CMS content cannot be loaded from Firestore');
  }
 }
}
async function contentCollection(collectionName){
 assertPublicCollection(collectionName);
 try{
  const snap=await adminDb().collection(collectionName).get();
  return snap.docs.map(d=>({id:d.id,...d.data()}));
 }catch(serverError){
  console.warn('SHANERYN server CMS list unavailable:',collectionName,serverError.message);
  try{
   const snap=await getPublicDocs(collection(publicCmsDb,collectionName));
   return snap.docs.map(d=>({id:d.id,...d.data()}));
  }catch(publicError){
   console.error('SHANERYN published CMS list failed:',collectionName,publicError.message);
   throw Error('Published CMS content cannot be loaded from Firestore');
  }
 }
}
export async function loadPage(slug){const base=pageSeed(slug);const published=await contentDoc('cms_pages',slug);if(!base&&!published)return null;return {...(base||{}),...(published||{}),slug,
 fields:base?.fields||published?.fields||[],sections:base?.sections||published?.sections||[],bodyHtml:base?.bodyHtml||published?.bodyHtml||'',patches:upgradeLookEditorialPatches(slug,published?.patches||{})};}
export async function loadProducts(){const baseline=seedProducts();const saved=await contentCollection('cms_products');const all=new Map(baseline.map(p=>[p.id,p]));saved.forEach(p=>all.set(p.id,{...(all.get(p.id)||{}),...p}));return [...all.values()].filter(p=>p.visible!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0))}
export async function loadCategories(){
 const baseline=seedCategories();
 const [legacy,saved]=await Promise.all([contentCollection('cms_collections'),contentCollection('cms_categories')]);
 const all=new Map(baseline.map(p=>[p.id,p]));
 for(const p of legacy)all.set(p.id,{...(all.get(p.id)||{}),...p});
 for(const p of saved)all.set(p.id,{...(all.get(p.id)||{}),...p});
 return [...all.values()].filter(p=>p.visible!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
}
export async function loadCuratedCollections(){
 return (await contentCollection('cms_curated_collections')).filter(c=>c.visible!==false).sort((a,b)=>(a.sortOrder||0)-(b.sortOrder||0));
}
// Public sitemap uses only visible CMS pages; private user data is never queried.
export async function loadPublicPageSlugs() {
 const baseline = pageManifest().map(page=>page.slug);
 const saved = await contentCollection('cms_pages');
 const slugs = new Set([...baseline, ...saved.map(page=>page.slug||page.id)]);
 return [...slugs].filter(slug=>/^[a-z0-9-]+$/.test(slug));
}
// Legacy name used for website category filtering; keep its behavior.
export const loadCollections=loadCategories;
export async function loadSettings(){return {...seedSettings(),...(await contentDoc('cms_settings','site')||{})}}
export async function loadForms(){const forms=seedForms();const saved=await contentCollection('cms_forms');saved.forEach(x=>{forms[x.id]=x});return forms}
export {pageManifest,pageSeed,seedProducts,seedCategories,seedCuratedCollections,seedForms,seedSettings};
