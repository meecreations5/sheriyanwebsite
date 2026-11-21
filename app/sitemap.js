import {loadPublicPageSlugs, loadPage, loadProducts, loadCuratedCollections} from '@/lib/cms-data';
import {publicSiteOrigin} from '@/lib/seo-utils';
import {productPath} from '@/lib/product-paths';
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const origin = publicSiteOrigin();
  // No guessed public domain. Set NEXT_PUBLIC_SITE_URL before production launch.
  if (!origin) return [];
  const [slugs, products, collections] = await Promise.all([
    loadPublicPageSlugs(),loadProducts(),loadCuratedCollections(),
  ]);
  const entries = [];
  const pageStatus = await Promise.all(slugs.map(async slug => [slug, await loadPage(slug)]));
  for (const [slug, page] of pageStatus) {
    if (!page || page.visible === false || ['look','collection'].includes(slug)) continue;
    entries.push({url:origin + (slug === 'index' ? '/' : '/' + slug)});
  }
  const hasLookPage = pageStatus.some(([slug,p])=>slug==='look'&&p&&p.visible!==false);
  if (hasLookPage) for (const product of products) {
    entries.push({url:origin + productPath(product)});
  }
  const hasCollections = pageStatus.some(([slug,p])=>slug==='collections'&&p&&p.visible!==false);
  if (hasCollections) for (const collection of collections) {
    if (!products.some(product => (product.collectionIds || []).includes(collection.id))) continue;
    entries.push({url:origin + '/collections/' + encodeURIComponent(collection.id)});
  }
  return entries;
}
