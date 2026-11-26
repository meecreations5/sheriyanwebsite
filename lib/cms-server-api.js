import 'server-only';
import {FieldValue} from '@google-cloud/firestore';
import {adminDb} from '@/lib/cms-admin-server';
import {seedProducts,seedCategories,seedForms,seedSettings,pageSeed,pageManifest} from '@/lib/seed';
import {productSlug} from '@/lib/product-paths';
import {normalizeProductDetails} from '@/lib/product-details.mjs';
import {upgradeLookEditorialPatches} from '@/lib/look-editorial-defaults.mjs';
import {normalizeUsername,validUsername,passwordHash,validPassword} from '@/lib/cms-password.mjs';

// These thin adapters preserve the existing, proven CMS data validation and
// section/product editing logic while switching ALL writes to trusted server APIs.
const cmsDb={};
const collection=(_,name)=>adminDb().collection(name);
const doc=(_,name,id)=>adminDb().collection(name).doc(id);
const getDoc=x=>x.get(),getDocs=x=>x.get();
const setDoc=(x,data,opts)=>x.set(data,opts);
const updateDoc=(x,data)=>x.update(data);
const addDoc=(x,data)=>x.add(data);
const deleteDoc=x=>x.delete();
const writeBatch=()=>adminDb().batch();
const serverTimestamp=()=>FieldValue.serverTimestamp();
const query=(ref,...steps)=>steps.reduce((acc,fn)=>fn(acc),ref);
const orderBy=(key,dir)=>ref=>ref.orderBy(key,dir||'asc');
const limit=n=>ref=>ref.limit(n);
const seed=async key=>{
 let value;
 if(key==='manifest')value=pageManifest();
 else if(key.startsWith('page-'))value=pageSeed(key.slice(5));
 else if(key==='products')value=seedProducts();
 else if(key==='categories')value=seedCategories();
 else if(key==='forms')value=seedForms();
 else if(key==='settings')value=seedSettings();
 if(!value)throw Error('Unknown content seed '+key);
 return JSON.parse(JSON.stringify(value));
};
const COL={pages:'cms_pages',products:'cms_products',categories:'cms_categories',collections:'cms_curated_collections',
 forms:'cms_forms',media:'cms_media',settings:'cms_settings',requests:'cms_requests',
 users:'cms_users',revisions:'cms_revisions'};
const copy=x=>JSON.parse(JSON.stringify(x));
const docData=s=>({id:s.id,...s.data()});
const slugValid=s=>/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(String(s||''));
const small=(value,n=1000)=>String(value??'').slice(0,n);
const safeLink=x=>{const v=small(x,1800);return /^(https:\/\/|http:\/\/localhost|mailto:|tel:|\/|#|assets\/|[\w/-]+\.html(?:[?#].*)?)/i.test(v)&&!/[<>]/.test(v)?v:'#'};
const safeImage=x=>{const v=small(x,1800);return /^(https:\/\/|http:\/\/localhost|assets\/|\/)/i.test(v)&&!/[<>]/.test(v)?v:''};
const cleanArray=(x,max)=>Array.isArray(x)?x.slice(0,max):[];
const cleanIds=(arr,max=100)=>[...new Set(cleanArray(arr,max).map(x=>String(x||'').trim()).filter(slugValid))];
const safeVideo=x=>{
 const v=small(x,1800).trim();if(!v||/[<>\s]/.test(v))return '';
 if(/^\/(?!\/)[\w./%-]+\.(?:mp4|webm)(?:\?[^#]*)?$/i.test(v)||/^assets\/[\w./%-]+\.(?:mp4|webm)(?:\?[^#]*)?$/i.test(v))return v;
 try{const u=new URL(v);if(u.protocol!=='https:')return '';
   if(['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','www.youtube-nocookie.com','youtube-nocookie.com','youtu.be','www.youtu.be'].includes(u.hostname)){
     const id=u.hostname.includes('youtu.be')?u.pathname.split('/')[1]:u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/)?.[1];
     return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?v:'';
   }
   return /\.(?:mp4|webm)(?:$|\?)/i.test(u.pathname+u.search)?v:'';
 }catch{return ''}
};
let cached={};
async function list(collectionName){const snap=await getDocs(collection(cmsDb,collectionName));return snap.docs.map(docData)}
async function read(collectionName,id){const snap=await getDoc(doc(cmsDb,collectionName,id));return snap.exists?docData(snap):null}
async function addIfAbsent(collectionName,id,value){if(!await read(collectionName,id))await setDoc(doc(cmsDb,collectionName,id),value)}
async function amalgamate(type,seedKey){const [data,records]=await Promise.all([seed(seedKey),list(COL[type])]);const base=Array.isArray(data)?data:Object.values(data);const map=new Map(base.map(item=>[item.id,item]));for(const item of records)map.set(item.id,{...(map.get(item.id)||{}),...item});return [...map.values()]}
function trimPatches(body,fields){const allowed=new Map((fields||[]).map(f=>[f.id,f]));const patches={};for(const [id,p] of Object.entries(body.patches||{})){const field=allowed.get(id);if(!field||!p||typeof p!=='object')continue;let value=p.value;if(field.kind==='visibility')value=Boolean(value);else if(['src','background'].includes(field.kind))value=safeImage(value)||field.value;else if(field.kind==='href')value=safeLink(value);else value=small(value,12000);patches[id]={value,visible:p.visible!==false,...(field.kind==='text'?{fontSize:Math.max(0,Math.min(96,Number(p.fontSize)||0)),textAlign:['left','center','right'].includes(p.textAlign)?p.textAlign:'',fontWeight:[300,400,500,600,700].includes(Number(p.fontWeight))?Number(p.fontWeight):0}:{})}}
 return patches}
function cleanPage(body,base){const sections={};for(const s of base.sections||[]){const x=body.sectionSettings?.[s.id];if(x)sections[s.id]={visible:x.visible!==false,order:Math.max(0,Math.min(1000,Number(x.order??s.order)||0))}};
 return {name:small(body.name||base.name,140),title:small(body.title||base.title,180),description:small(body.description||base.description,500),socialImage:safeImage(body.socialImage),visible:body.visible!==false,patches:trimPatches(body,base.fields),sectionSettings:sections,heroImages:{desktop:safeImage(body.heroImages?.desktop),mobile:safeImage(body.heroImages?.mobile),alt:small(body.heroImages?.alt,160)},pastWorkExtras:cleanArray(body.pastWorkExtras,100).map((item,i)=>({id:slugValid(item?.id)?small(item.id,90):`past-extra-${i+1}`,src:safeImage(item?.src),alt:small(item?.alt,180),visible:item?.visible!==false})),filmMedia:{url:safeVideo(body.filmMedia?.url)},extraSections:cleanArray(body.extraSections,40).filter(s=>['text','split','gallery','cards','faq'].includes(s.type)).map(s=>({id:slugValid(s.id)?s.id:'custom-'+crypto.randomUUID(),type:s.type,heading:small(s.heading,200),body:small(s.body,12000),image:safeImage(s.image),href:safeLink(s.href),buttonText:small(s.buttonText,120),visible:s.visible!==false,cards:cleanArray(s.cards,30).map(c=>({title:small(c.title,300),text:small(c.text,1500)})),images:cleanArray(s.images,30).map(safeImage).filter(Boolean)})),updatedAt:serverTimestamp()}
}
function cleanProduct(p,id){return {id,slug:productSlug({...p,id}),title:small(p.title,180),styleNumber:small(p.styleNumber,50),cat:small(p.cat,100),occasion:small(p.occasion,90),description:small(p.description,3500),tagline:small(p.tagline,500),price:small(p.price,100).trim(),productDetails:normalizeProductDetails(p.productDetails),tone:small(p.tone,100),categoryId:small(p.categoryId,80),collectionIds:cleanIds(p.collectionIds,60),pieces:cleanArray(p.pieces,30).map(v=>small(v,100)),measurementGroups:p.measurementGroups&&typeof p.measurementGroups==='object'&&!Array.isArray(p.measurementGroups)?Object.fromEntries(Object.entries(p.measurementGroups).slice(0,12).map(([k,v])=>[small(k,100),cleanArray(v,30).map(i=>small(i,60))])):{},img:safeImage(p.img),catalogueImg:safeImage(p.catalogueImg),bestSellerImage:safeImage(p.bestSellerImage),gallery:cleanArray(p.gallery,30).map(v=>({src:safeImage(v.src),alt:small(v.alt,150)})).filter(v=>v.src),accessories:cleanArray(p.accessories,40).map(v=>({name:small(v.name,140),image:safeImage(v.image),price:small(v.price,80),description:small(v.description,800),visible:v.visible!==false})).filter(v=>v.image||v.name),video:safeVideo(p.video),seoTitle:small(p.seoTitle,180),seoDescription:small(p.seoDescription,350),sortOrder:Math.max(0,Math.min(99999,Number(p.sortOrder)||0)),visible:p.visible!==false,featured:!!p.featured,bestSeller:!!p.bestSeller,newDrop:!!p.newDrop}}
function cleanCategory(p,id){return {id,name:small(p.name,120),copy:small(p.copy,2000),image:safeImage(p.image),sortOrder:Math.max(0,Math.min(9999,Number(p.sortOrder)||0)),visible:p.visible!==false}}
function cleanCuratedCollection(p,id){return {id,name:small(p.name,120),description:small(p.description,2200),image:safeImage(p.image),sortOrder:Math.max(0,Math.min(9999,Number(p.sortOrder)||0)),visible:p.visible!==false}}
function cleanForm(p,id){return {id,title:small(p.title,100),fields:cleanArray(p.fields,50).filter(f=>/^[a-zA-Z][a-zA-Z0-9_-]{0,49}$/.test(f.name)).map(f=>({name:f.name,label:small(f.label,120),type:['text','email','tel','number','date','time','textarea','select'].includes(f.type)?f.type:'text',required:!!f.required,visible:f.visible!==false,options:cleanArray(f.options,50).map(s=>small(s,140))}))}}
function cleanSettings(p){return {social:Object.fromEntries(['instagram','facebook','youtube','linkedin'].map(k=>[k,p.social?.[k]?safeLink(p.social[k]):''])),contact:{email:small(p.contact?.email,254),whatsapp:small(p.contact?.whatsapp,35),phone:small(p.contact?.phone,35),address:small(p.contact?.address,400),mapsUrl:p.contact?.mapsUrl?safeLink(p.contact.mapsUrl):''},branding:{logo:safeImage(p.branding?.logo),favicon:safeImage(p.branding?.favicon),accent:/^#[0-9a-f]{6}$/i.test(p.branding?.accent||'')?p.branding.accent:'#c33583'},home:{bestSellerId:small(p.home?.bestSellerId,100),featuredProductIds:cleanArray(p.home?.featuredProductIds,4).map(x=>small(x,100))},seo:{siteName:small(p.seo?.siteName,100),defaultDescription:small(p.seo?.defaultDescription,500)},founderLinkedin:p.founderLinkedin?safeLink(p.founderLinkedin):'',updatedAt:serverTimestamp()}}
function can(role,resource,method){if(role==='super_admin')return true;const allowed={viewer:['me','pages','products','categories','collections','forms','settings','media'],editor:['me','pages','products','categories','collections','forms','settings','media','seed','revisions'],products:['me','products','categories','collections','media'],enquiries:['me','requests']};return (allowed[role]||[]).includes(resource)&&(!['viewer'].includes(role)||method==='GET')}
export async function cmsServerApi(resource,opts={},profile){
 if(!profile)throw Object.assign(Error('Please sign in again'),{status:401});
 const [kind,id]=resource.split('/');const method=opts.method||'GET';

 if(!can(profile.role,kind,method))throw Error('You do not have permission for this section');
 if(kind==='me')return {id:profile.id,uid:profile.id,username:profile.username,role:profile.role,projectId:'shanerynwesbite'};
 if(kind==='seed'&&method==='POST'){
  const manifest=await seed('manifest');for(const item of manifest){const base=await seed('page-'+item.slug);await addIfAbsent('cms_pages',item.slug,{name:item.name,title:base.title,description:base.description,visible:true,patches:{},sectionSettings:{},extraSections:[]})}
  const [products,categories,forms,settings]=await Promise.all([seed('products'),seed('categories'),seed('forms'),seed('settings')]);
  for(const p of products)await addIfAbsent('cms_products',p.id,p);
  // Preserve any previous edits saved in the V1.5 cms_collections category records.
  const oldCategories=await list('cms_collections').catch(()=>[]);
  const categoryMap=new Map(categories.map(c=>[c.id,c]));
  oldCategories.forEach(c=>categoryMap.set(c.id,{...(categoryMap.get(c.id)||{}),...c}));
  for(const c of categoryMap.values())await addIfAbsent('cms_categories',c.id,c);
  for(const [key,form] of Object.entries(forms))await addIfAbsent('cms_forms',key,form);
  await addIfAbsent('cms_settings','site',settings);
  return {ok:true};
 }
 if(kind==='pages'){
  if(method==='GET'&&!id){const [manifest,pages]=await Promise.all([seed('manifest'),list('cms_pages')]);const m=new Map(pages.map(p=>[p.id,p]));return [...manifest.map(p=>({...p,...(m.get(p.slug)||{})})),...pages.filter(p=>!manifest.some(s=>s.slug===p.id)).map(p=>({slug:p.id,path:'/'+p.id,...p}))]}
  if(method==='POST'&&!id){const body=opts.body||{};const slug=String(body.slug||'').trim().toLowerCase();if(!slugValid(slug)||['admin','api','index','new-drop','consultation'].includes(slug))throw Error('Invalid page slug');if(await read('cms_pages',slug))throw Error('Page already exists');const base=await seed('page-index');const bodyHtml=base.bodyHtml.replace(/<main[^>]*>[\s\S]*?<\/main>/i,'<main id="main-content"></main>');await setDoc(doc(cmsDb,'cms_pages',slug),{name:small(body.name||slug,140),title:small(body.title||slug,180),description:'',visible:false,patches:{},sectionSettings:{},extraSections:[],bodyHtml,fields:base.fields.filter(f=>['header','footer','navigation','dialogs','other'].includes(f.section)),sections:[],styles:base.styles,scripts:base.scripts,createdAt:serverTimestamp()});return {ok:true,slug}}
  if(!id||!slugValid(id))throw Error('Invalid page');const [fromDb,fromSeed]=await Promise.all([read('cms_pages',id),seed('page-'+id).catch(()=>null)]);const base=fromSeed||fromDb;if(!base)throw Error('Page not found');
  if(method==='GET')return {...base,...(fromDb||{}),slug:id,fields:base.fields||[],sections:base.sections||[],bodyHtml:base.bodyHtml||'',patches:upgradeLookEditorialPatches(id,fromDb?.patches||{})};
  if(method==='PUT'){const data=cleanPage(opts.body||{},base);if(fromDb)await addDoc(collection(cmsDb,'cms_revisions'),{pageId:id,previous:fromDb,changedBy:profile.username,createdAt:serverTimestamp()});await setDoc(doc(cmsDb,'cms_pages',id),data,{merge:true});return {ok:true}}
 }
 if(kind==='revisions'&&method==='GET'){const records=await list('cms_revisions');return records.filter(x=>x.pageId===id).slice(-20).reverse()}
 if(['products','categories','collections','forms','media'].includes(kind)){
  const source=COL[kind];
  if(method==='GET'&&!id){
   if(kind==='media')return list(source);
   if(kind==='categories'){
    const [baseline,old,saved]=await Promise.all([seed('categories'),list('cms_collections').catch(()=>[]),list('cms_categories').catch(()=>[])]);
    const merged=new Map(baseline.map(c=>[c.id,c]));
    // V1.5 categories were incorrectly saved under cms_collections.
    for(const row of old)merged.set(row.id,{...(merged.get(row.id)||{}),...row});
    for(const row of saved)merged.set(row.id,{...(merged.get(row.id)||{}),...row});
    return [...merged.values()].map(c=>c.id==='gowns'&&/^gowns$/i.test(c.name||'')?{...c,name:'Statement Outfits'}:c).sort((x,y)=>(x.sortOrder||0)-(y.sortOrder||0));
   }
   if(kind==='collections'){
    const [curated,products]=await Promise.all([list(source).catch(()=>[]),amalgamate('products','products')]);
    return curated.map(c=>({...c,productIds:products.filter(p=>(p.collectionIds||[]).includes(c.id)).map(p=>p.id)})).sort((x,y)=>(x.sortOrder||0)-(y.sortOrder||0));
   }
   return amalgamate(kind,kind);
  }
  if(method==='POST'&&!id || method==='PUT'&&id){
   const body=opts.body||{};
   const key=String(id||(kind==='media'?crypto.randomUUID():body.id||body.name?.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||crypto.randomUUID())).trim();
   if(!slugValid(key))throw Error('Enter a valid name or URL slug.');
   if(method==='POST'&&await read(source,key))throw Error('This item already exists.');
   if(kind==='collections'){
    const cleaned=cleanCuratedCollection(body,key),wanted=cleanIds(body.productIds,200);
    const products=await amalgamate('products','products');
    if(wanted.some(x=>!products.find(p=>p.id===x)))throw Error('One of the selected products no longer exists.');
    const batch=writeBatch(cmsDb);
    batch.set(doc(cmsDb,source,key),{...cleaned,updatedAt:serverTimestamp()},{merge:true});
    for(const product of products){
     const has=(product.collectionIds||[]).includes(key),need=wanted.includes(product.id);
     if(has!==need){
      const collectionIds=need?[...(product.collectionIds||[]).filter(x=>x!==key),key]:(product.collectionIds||[]).filter(x=>x!==key);
      batch.set(doc(cmsDb,'cms_products',product.id),{...cleanProduct(product,product.id),collectionIds,updatedAt:serverTimestamp()},{merge:true});
     }
    }
    await batch.commit();return {ok:true,id:key};
   }
   if(kind==='categories'){
    const cleaned=cleanCategory(body,key);
    const existing=method==='PUT'?(await read('cms_categories',key)||await read('cms_collections',key)):null;
    const batch=writeBatch(cmsDb);
    batch.set(doc(cmsDb,source,key),{...cleaned,updatedAt:serverTimestamp()},{merge:true});
    if(existing&&existing.name!==cleaned.name){
      const products=await amalgamate('products','products');
      for(const product of products.filter(x=>x.categoryId===key||x.cat===existing.name)){
       batch.set(doc(cmsDb,'cms_products',product.id),{...cleanProduct(product,product.id),cat:cleaned.name,categoryId:key,updatedAt:serverTimestamp()},{merge:true});
      }
    }
    await batch.commit();return {ok:true,id:key};
   }
   if(kind==='media')throw Error('Use the authenticated media upload endpoint.');
   const cleaned=kind==='products'?cleanProduct(body,key):cleanForm(body,key);
   await setDoc(doc(cmsDb,source,key),{...cleaned,updatedAt:serverTimestamp()},{merge:true});return {ok:true,id:key};
  }
  if(!id||!slugValid(id))throw Error('Invalid record ID');
  if(method==='GET')return read(source,id);
  if(method==='DELETE'){
   if(['products','categories','collections'].includes(kind))await setDoc(doc(cmsDb,source,id),{visible:false,updatedAt:serverTimestamp()},{merge:true});
   else await deleteDoc(doc(cmsDb,source,id));
   return {ok:true};
  }
 }
 if(kind==='settings'){if(method==='GET')return {...await seed('settings'),...(await read('cms_settings','site')||{})};if(method==='PUT'){await setDoc(doc(cmsDb,'cms_settings','site'),cleanSettings(opts.body||{}),{merge:true});return {ok:true}}}
 if(kind==='requests'){
  if(method==='GET'){const snap=await getDocs(query(collection(cmsDb,'cms_requests'),orderBy('createdAt','desc'),limit(300)));return snap.docs.map(docData)}
  if(method==='PUT'&&id){const p=opts.body||{};if(!['new','contacted','follow_up','converted','closed','lost','requested','confirmed','rescheduled','cancelled','completed'].includes(p.status))throw Error('Invalid request status');await updateDoc(doc(cmsDb,'cms_requests',id),{status:p.status,notes:small(p.notes,2500),assignedTo:small(p.assignedTo,120),followUpDate:small(p.followUpDate,40),updatedAt:serverTimestamp()});return {ok:true}}
 }
 if(kind==='users'){
  if(method==='GET'){
   return (await list('cms_users')).filter(x=>x.passwordHash).map(({passwordHash,password,secret,resetToken,setupToken,...safe})=>safe);
  }
  if(method==='POST'&&!id){
   const input=opts.body||{},username=normalizeUsername(input.username);
   if(!validUsername(username))throw Error('Username must be 3-32 characters, starting with a letter.');
   if(!validPassword(input.password))throw Error('Use a password between 12 and 128 characters.');
   if(!['super_admin','editor','products','enquiries','viewer'].includes(input.role))throw Error('Select a valid access role');
   const ref=doc(cmsDb,'cms_users',username);
   const hash=await passwordHash(input.password);
   try{await ref.create({username,role:input.role,active:true,passwordHash:hash,sessionVersion:1,authMethod:'cms_users',createdAt:serverTimestamp()})}
   catch(error){if(error.code===6||error.code==='already-exists')throw Error('This username is already taken.');throw error}
   return {ok:true,id:username};
  }
  if(!id||(!validUsername(id)&&!(method==='POST'&&id.endsWith(':reset'))))throw Error('Invalid username');
  if(method==='PUT'){
   const p=opts.body||{},ref=doc(cmsDb,'cms_users',id),old=await ref.get();
   if(!old.exists||!old.data().passwordHash)throw Error('Account not found or not migrated');
   if(!['super_admin','editor','products','enquiries','viewer'].includes(p.role))throw Error('Invalid role');
   if(id===profile.id&&(p.active===false||p.role!=='super_admin'))throw Error('You cannot disable or demote yourself');
   await ref.update({role:p.role,active:p.active!==false,sessionVersion:FieldValue.increment(1),updatedAt:serverTimestamp()});
   return {ok:true};
  }
  if(method==='POST'&&id.endsWith(':reset')){
   const target=id.slice(0,-6);
   if(!validUsername(target))throw Error('Invalid user');
   if(target===profile.id)throw Error('Use Change My Password to update your own password');
   const pwd=opts.body?.password;
   if(!validPassword(pwd))throw Error('Use a password between 12 and 128 characters.');
   const ref=doc(cmsDb,'cms_users',target),old=await ref.get();
   if(!old.exists||!old.data().passwordHash)throw Error('Account not found or not migrated');
   await ref.update({passwordHash:await passwordHash(pwd),sessionVersion:FieldValue.increment(1),updatedAt:serverTimestamp()});
   // A successful staff reset also clears an old invalid-password lockout.
   await doc(cmsDb,'cms_login_attempts',target).delete().catch(()=>{});
   return {ok:true};
  }
 }
 throw Error('Unsupported CMS action');
}
