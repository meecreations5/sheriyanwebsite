import {loadPublicPageSlugs, loadPage, loadProducts, loadCuratedCollections, loadAccessories, loadAccessoryCategories, loadCategories, seedCategories} from '@/lib/cms-data';
import {publicSiteOrigin} from '@/lib/seo-utils';
import {productPath} from '@/lib/product-paths';
import {collectionType,accessoryMatchesCollection,accessoryPath,accessoryCollectionPath,accessoryCategoryPath} from '@/lib/catalogue-model.mjs';
import {categoryHasLooks,clothingCategoryPath} from '@/lib/clothing-catalogue.mjs';
export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const origin = publicSiteOrigin();
  // No guessed public domain. Set NEXT_PUBLIC_SITE_URL before production launch.
  if (!origin) return [];
  const [slugs, products, collections, accessories, accessoryCategories, clothingCategories] = await Promise.all([
    loadPublicPageSlugs(),loadProducts(),loadCuratedCollections(),
    loadAccessories().catch(()=>[]),loadAccessoryCategories().catch(()=>[]),loadCategories()
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
  const hasCategoryPage=pageStatus.some(([slug,p])=>slug==='collection'&&p&&p.visible!==false);
  if(hasCategoryPage)for(const category of clothingCategories){
   if(categoryHasLooks(category,products,seedCategories()))entries.push({url:origin+clothingCategoryPath(category)});
  }
  const hasCollections = pageStatus.some(([slug,p])=>slug==='collections'&&p&&p.visible!==false);
  if (hasCollections) for (const collection of collections) {
    if (collectionType(collection)!=='clothing'||!products.some(product => (product.collectionIds || []).includes(collection.id))) continue;
    entries.push({url:origin + '/collections/' + encodeURIComponent(collection.id)});
  }
  const hasAccessories = pageStatus.some(([slug,p])=>slug==='accessories'&&p&&p.visible!==false);
  if(hasAccessories){
   for(const item of accessories)entries.push({url:origin+accessoryPath(item)});
   for(const item of collections.filter(c=>collectionType(c)==='accessories')){
    if(accessories.some(a=>accessoryMatchesCollection(a,item.id)))entries.push({url:origin+accessoryCollectionPath(item)});
   }
   for(const item of accessoryCategories){
    if(accessories.some(a=>a.categoryId===item.id))entries.push({url:origin+accessoryCategoryPath(item)});
   }
  }
  return entries;
}
