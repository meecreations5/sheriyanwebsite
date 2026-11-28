import {notFound} from 'next/navigation';
import {loadPage,loadProducts,loadSettings,loadCategories,loadCuratedCollections,loadAccessories,loadAccessoryCategories,loadForms,pageSeed,seedProducts,seedSettings,seedCategories,seedForms} from '@/lib/cms-data';
import {withBespokeReadFallback,withBespokeRenderFallback} from '@/lib/bespoke-resilience.mjs';
import {renderPage} from '@/lib/render-page';
import {productPath} from '@/lib/product-paths';
import {decorateLookAccessories} from '@/lib/catalogue-model.mjs';
import {normalizeClothingProducts} from '@/lib/clothing-catalogue.mjs';
import LegacyScripts from '@/components/LegacyScripts';
import {toPlainClientData} from '@/lib/plain-client-data';
export default async function LegacyPage({slug,activeProductId=null,curatedCollection=null,activeClothingCategory=null,accessoryCollection=null,accessoryCategory=null,activeAccessoryId=null}){
 const [page,allProducts,settings,categories,curatedCollections,forms,accessories,accessoryCategories]=await withBespokeReadFallback(slug,
  ()=>Promise.all([loadPage(slug),loadProducts(),loadSettings(),loadCategories(),['index','collections','accessories'].includes(slug)?loadCuratedCollections():Promise.resolve([]),loadForms(),
    ['accessories','look'].includes(slug)?loadAccessories().catch(error=>{console.error('Accessory CMS read unavailable',error.message);return []}):Promise.resolve([]),
    slug==='accessories'?loadAccessoryCategories().catch(error=>{console.error('Accessory category CMS read unavailable',error.message);return []}):Promise.resolve([])]),
  ()=>[pageSeed('bespoke'),seedProducts(),seedSettings(),seedCategories(),[],seedForms(),[],[]]
 );
 const normalizedProducts=normalizeClothingProducts(allProducts,categories,seedCategories());
 // Category detail pages keep the full catalogue available for category switching.
 // Their page script filters the visible grid by the selected immutable ID.
 const baseProducts=curatedCollection?normalizedProducts.filter(x=>(x.collectionIds||[]).includes(curatedCollection.id)):normalizedProducts;
 const products=slug==='look'?decorateLookAccessories(baseProducts,accessories):baseProducts;
 if(!page||page.visible===false)notFound();
 const markup=withBespokeRenderFallback(slug,
  ()=>renderPage(page,products,settings,forms,curatedCollections,curatedCollection,categories,activeProductId,
    {accessories,accessoryCategories,accessoryCollection,accessoryCategory,activeClothingCategory,activeAccessory:accessories.find(a=>a.id===activeAccessoryId)||null}),
  ()=>pageSeed('bespoke')?.bodyHtml||'<main id="main-content"><p>Our Bespoke collection is temporarily unavailable. Please try again.</p></main>'
 );
 // The CMS may contain Firestore Timestamp instances (e.g. product.updatedAt).
 // React Server Components only accept plain data, so normalize every client prop.
 const clientProps=toPlainClientData({
  scripts:page.scripts,
  products:products.map(p=>({...p,publicPath:productPath(p)})),
  settings,collections:categories,curatedCollections,page,activeProductId,activeClothingCategoryId:activeClothingCategory?.id||null
 });
 const brandAccent=String(settings?.branding?.accent||'').trim();
 const customAccent=/^#[a-f0-9]{6}$/i.test(brandAccent)&&brandAccent.toLowerCase()!=='#c33583'?brandAccent:null;
 return <>
  {customAccent&&<style>{`:root{--accent:${customAccent};--ep-accent:${customAccent};--home-accent:${customAccent};--signature-magenta:${customAccent}}`}</style>}
  {page.styles?.map((sheet,i)=><link rel="stylesheet" href={'/'+sheet+'?v=1208'} key={sheet+i}/>)}
  <link rel="stylesheet" href="/cms-bridges.css"/>
  {slug==='index'&&<link rel="stylesheet" href="/shaneryn-v190-refinements.css?v=1208"/>}
  {slug==='bespoke'&&<link rel="stylesheet" href="/shaneryn-v1914-bespoke-borderless.css"/>}
  {(['collections','collection'].includes(slug))&&<link rel="stylesheet" href="/shaneryn-v1815-collection-prices.css"/>}
  {slug==='look'&&<link rel="stylesheet" href="/shaneryn-v1816-feedback-audit.css"/>}
  <link rel="stylesheet" href="/shaneryn-final-v119.css?v=1207"/>
  <link rel="stylesheet" href="/shaneryn-feedback-v1195.css?v=1207"/>
  <link rel="stylesheet" href="/shaneryn-v1196-page-consistency.css"/>
  {slug==='story'&&<link rel="stylesheet" href="/shaneryn-my-story-v1192.css"/>}
  {['index','accessories','look'].includes(slug)&&<link rel="stylesheet" href="/shaneryn-catalogue-v1193.css"/>}
  <link rel="stylesheet" href="/shaneryn-mobile-v120.css"/>
  <link rel="stylesheet" href="/shaneryn-mobile-v1202.css"/>
  <link rel="stylesheet" href="/shaneryn-mobile-v1203.css?v=1207"/>
  <link rel="stylesheet" href="/shaneryn-typography-v1205.css?v=1208"/>
  <link rel="stylesheet" href="/shaneryn-forms-labels-v1208.css?v=1208"/>
  <div className="shaneryn-public-site" data-cms-page={slug} dangerouslySetInnerHTML={{__html:markup}} suppressHydrationWarning/>
  <LegacyScripts {...clientProps}/>
 </>
}
