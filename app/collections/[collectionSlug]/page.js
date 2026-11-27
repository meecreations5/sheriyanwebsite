import {notFound} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadCuratedCollections, loadSettings, loadPage, loadProducts} from '@/lib/cms-data';
import {buildPublicMetadata} from '@/lib/seo-utils';
import {collectionType} from '@/lib/catalogue-model.mjs';
export const dynamic = 'force-dynamic';
async function findCollection(params) {
  const {collectionSlug} = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(collectionSlug || '')) notFound();
  const list = await loadCuratedCollections();
  const selected = list.find(c => c.id === collectionSlug);
  if (!selected || collectionType(selected)!=='clothing') notFound();
  // A visible but unassigned collection is not a launched customer catalogue.
  // It remains editable in CMS and cannot expose an empty public landing page.
  const products=await loadProducts();
  if(!products.some(product=>product.visible!==false&&(product.collectionIds||[]).includes(selected.id)))notFound();
  return selected;
}
export async function generateMetadata({params}) {
  const collection = await findCollection(params);
  const [settings, page, products] = await Promise.all([loadSettings(), loadPage('collections'),loadProducts()]);
  const populated = products.some(product => (product.collectionIds || []).includes(collection.id));
  return buildPublicMetadata({
    title: collection.seoTitle || `${collection.name} | SHANERYN`,
    description: collection.seoDescription || collection.description || `Explore the ${collection.name} at SHANERYN.`,
    canonical: '/collections/' + collection.id,
    image: collection.image,
    settings,
    index: Boolean(page && page.visible !== false && populated),
  });
}
export default async function CuratedCollection({params}) {
  const collection = await findCollection(params);
  return <LegacyPage slug="collections" curatedCollection={collection}/>;
}
