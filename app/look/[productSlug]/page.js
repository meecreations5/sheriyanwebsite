import {notFound, permanentRedirect} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadProducts, loadPage, loadSettings} from '@/lib/cms-data';
import {findProductBySlug, productPath, slugify} from '@/lib/product-paths';
import {buildPublicMetadata} from '@/lib/seo-utils';
export const dynamic = 'force-dynamic';
async function resolveProduct(params) {
  const {productSlug} = await params;
  if (!productSlug || !/^[a-z0-9-]{1,90}$/i.test(productSlug)) notFound();
  const products = await loadProducts();
  const product = findProductBySlug(products, productSlug);
  if (!product) notFound();
  if (productSlug !== slugify(productSlug)) permanentRedirect(productPath(product));
  return product;
}
export async function generateMetadata({params}) {
  const product = await resolveProduct(params);
  const [page, settings] = await Promise.all([loadPage('look'), loadSettings()]);
  const image = product.catalogueImg || product.img || '';
  return buildPublicMetadata({
    title: product.seoTitle || `${product.title} | SHANERYN`,
    description: product.seoDescription || product.description,
    canonical: productPath(product),
    image,
    settings,
    index: Boolean(page && page.visible !== false),
  });
}
export default async function ProductDetail({params}) {
  const product = await resolveProduct(params);
  return <LegacyPage slug="look" activeProductId={product.id}/>;
}
