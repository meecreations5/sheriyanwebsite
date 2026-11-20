import {notFound, permanentRedirect} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadProducts, loadPage, loadSettings} from '@/lib/cms-data';
import {findProductBySlug, productPath, slugify} from '@/lib/product-paths';
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
  if (!page || page.visible === false) return {robots:{index:false,follow:false}};
  const title = product.seoTitle || `${product.title} | SHANERYN`;
  const description = product.seoDescription || product.description || '';
  const image = product.catalogueImg || product.img || '';
  return {
    title:{absolute:title}, description,
    alternates:{canonical:productPath(product)},
    openGraph:{title,description,type:'website',images:image?[image.startsWith('assets/')?'/'+image:image]:[]},
    icons:{icon:settings.branding?.favicon || '/favicon-64.png'}
  };
}

export default async function ProductDetail({params}) {
  const product = await resolveProduct(params);
  return <LegacyPage slug="look" activeProductId={product.id} />;
}
