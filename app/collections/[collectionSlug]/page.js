import {notFound} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadCuratedCollections, loadSettings, loadPage, loadProducts} from '@/lib/cms-data';
import {buildPublicMetadata} from '@/lib/seo-utils';
export const dynamic = 'force-dynamic';
async function findCollection(params) {
  const {collectionSlug} = await params;
  if (!/^[a-z0-9-]{1,80}$/.test(collectionSlug || '')) notFound();
  const list = await loadCuratedCollections();
  const selected = list.find(c => c.id === collectionSlug);
  if (!selected) notFound();
  return selected;
}
export async function generateMetadata({params}) {
  const collection = await findCollection(params);
  const [settings, page, products] = await Promise.all([loadSettings(), loadPage('collections'),loadProducts()]);
  const populated = products.some(product => (product.collectionIds || []).includes(collection.id));
  return buildPublicMetadata({
    title: `${collection.name} | SHANERYN`,
    description: collection.description || `Explore the ${collection.name} at SHANERYN.`,
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
