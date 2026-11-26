import {notFound} from 'next/navigation';
import {loadPage,loadProducts,loadSettings,loadCategories,loadCuratedCollections,loadForms,pageSeed,seedProducts,seedSettings,seedCategories,seedForms} from '@/lib/cms-data';
import {withBespokeReadFallback,withBespokeRenderFallback} from '@/lib/bespoke-resilience.mjs';
import {renderPage} from '@/lib/render-page';
import {productPath} from '@/lib/product-paths';
import LegacyScripts from '@/components/LegacyScripts';
import {toPlainClientData} from '@/lib/plain-client-data';
export default async function LegacyPage({slug,activeProductId=null,curatedCollection=null}){
 const [page,allProducts,settings,categories,curatedCollections,forms]=await withBespokeReadFallback(slug,
  ()=>Promise.all([loadPage(slug),loadProducts(),loadSettings(),loadCategories(),slug==='collections'?loadCuratedCollections():Promise.resolve([]),loadForms()]),
  ()=>[pageSeed('bespoke'),seedProducts(),seedSettings(),seedCategories(),[],seedForms()]
 );
 const products=curatedCollection?allProducts.filter(x=>(x.collectionIds||[]).includes(curatedCollection.id)):allProducts;
 if(!page||page.visible===false)notFound();
 const markup=withBespokeRenderFallback(slug,
  ()=>renderPage(page,products,settings,forms,curatedCollections,curatedCollection,categories,activeProductId),
  ()=>pageSeed('bespoke')?.bodyHtml||'<main id="main-content"><p>Our Bespoke collection is temporarily unavailable. Please try again.</p></main>'
 );
 // The CMS may contain Firestore Timestamp instances (e.g. product.updatedAt).
 // React Server Components only accept plain data, so normalize every client prop.
 const clientProps=toPlainClientData({
  scripts:page.scripts,
  products:products.map(p=>({...p,publicPath:productPath(p)})),
  settings,collections:categories,page,activeProductId
 });
 const brandAccent=String(settings?.branding?.accent||'').trim();
 const customAccent=/^#[a-f0-9]{6}$/i.test(brandAccent)&&brandAccent.toLowerCase()!=='#c33583'?brandAccent:null;
 return <>
  {customAccent&&<style>{`:root{--accent:${customAccent};--ep-accent:${customAccent};--home-accent:${customAccent};--signature-magenta:${customAccent}}`}</style>}
  {page.styles?.map((sheet,i)=><link rel="stylesheet" href={'/'+sheet} key={sheet+i}/>)}
  <link rel="stylesheet" href="/cms-bridges.css"/>
  {slug==='index'&&<link rel="stylesheet" href="/shaneryn-v190-refinements.css"/>}
  {slug==='bespoke'&&<link rel="stylesheet" href="/shaneryn-v1914-bespoke-borderless.css"/>}
  {(['collections','collection'].includes(slug))&&<link rel="stylesheet" href="/shaneryn-v1815-collection-prices.css"/>}
  {slug==='look'&&<link rel="stylesheet" href="/shaneryn-v1816-feedback-audit.css"/>}
  <link rel="stylesheet" href="/shaneryn-final-v119.css"/>
  {slug==='story'&&<link rel="stylesheet" href="/shaneryn-my-story-v1192.css"/>}
  <div className="shaneryn-public-site" data-cms-page={slug} dangerouslySetInnerHTML={{__html:markup}} suppressHydrationWarning/>
  <LegacyScripts {...clientProps}/>
 </>
}
