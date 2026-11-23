import {notFound} from 'next/navigation';
import {loadPage,loadProducts,loadSettings,loadCategories,loadCuratedCollections,loadForms} from '@/lib/cms-data';
import {renderPage} from '@/lib/render-page';
import {productPath} from '@/lib/product-paths';
import LegacyScripts from '@/components/LegacyScripts';
import {toPlainClientData} from '@/lib/plain-client-data';
export default async function LegacyPage({slug,activeProductId=null,curatedCollection=null}){
 const [page,allProducts,settings,categories,curatedCollections,forms]=await Promise.all([loadPage(slug),loadProducts(),loadSettings(),loadCategories(),slug==='collections'?loadCuratedCollections():Promise.resolve([]),loadForms()]);
 const products=curatedCollection?allProducts.filter(x=>(x.collectionIds||[]).includes(curatedCollection.id)):allProducts;
 if(!page||page.visible===false)notFound();
 const markup=renderPage(page,products,settings,forms,curatedCollections,curatedCollection,categories,activeProductId);
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
  <div className="shaneryn-public-site" data-cms-page={slug} dangerouslySetInnerHTML={{__html:markup}} suppressHydrationWarning/>
  <LegacyScripts {...clientProps}/>
 </>
}
