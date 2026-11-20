import {notFound, redirect, permanentRedirect} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadPage, loadSettings, loadProducts} from '@/lib/cms-data';
import {findProductByLegacyId, productPath} from '@/lib/product-paths';
export const dynamic='force-dynamic';
export async function generateMetadata({params}) {
 const {slug}=await params;
 const [page,settings]=await Promise.all([loadPage(slug),loadSettings()]);
 if(!page)return {title:'Not Found'};
 const title=page.title,description=page.description,image=page.socialImage||'';
 return {title,description,icons:{icon:settings.branding?.favicon||'/favicon-64.png'},openGraph:{title,description,images:image?[image]:[]}};
}
export default async function SitePage({params,searchParams}) {
 const {slug}=await params;
 if(!/^[a-z0-9-]+$/.test(slug)) notFound();
 if(slug==='look') {
   const {id}=await searchParams;
   if(!id) redirect('/collections');
   const products=await loadProducts();
   const product=findProductByLegacyId(products,id);
   if(!product) notFound();
   permanentRedirect(productPath(product));
 }
 return <LegacyPage slug={slug}/>;
}
