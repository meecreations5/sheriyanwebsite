import {notFound, redirect, permanentRedirect} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadPage, loadSettings, loadProducts, pageSeed, seedSettings} from '@/lib/cms-data';
import {withBespokeReadFallback} from '@/lib/bespoke-resilience.mjs';
import {buildPublicMetadata} from '@/lib/seo-utils';
import {findProductByLegacyId, productPath} from '@/lib/product-paths';
export const dynamic = 'force-dynamic';
export async function generateMetadata({params}) {
  const {slug} = await params;
  if (!/^[a-z0-9-]+$/.test(slug || '')) return {robots:{index:false,follow:false}};
  const [page, settings] = await withBespokeReadFallback(slug,
    ()=>Promise.all([loadPage(slug),loadSettings()]),
    ()=>[pageSeed('bespoke'),seedSettings()]
  );
  if (!page || page.visible === false) return {robots:{index:false,follow:false}};
  // The legacy generic shells are not individual product/collection landing pages.
  const index = !['look','collection'].includes(slug);
  return buildPublicMetadata({
    title: page.title,
    description: page.description,
    canonical: '/' + slug,
    image: page.socialImage,
    settings,
    index,
  });
}
export default async function SitePage({params,searchParams}) {
  const {slug} = await params;
  if(!/^[a-z0-9-]+$/.test(slug)) notFound();
  if(slug==='look') {
    const {id} = await searchParams;
    if(!id) redirect('/collections');
    const products = await loadProducts();
    const product = findProductByLegacyId(products,id);
    if(!product) notFound();
    permanentRedirect(productPath(product));
  }
  return <LegacyPage slug={slug}/>;
}
