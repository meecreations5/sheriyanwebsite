// A public fashion URL uses the product name, never its inventory SKU.
// Existing CMS records use legacy `sh-*` slugs. Keep them compatible without a migration.
export function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '').slice(0, 90);
}
export function productSlug(product) {
  if (!product) return '';
  const id = String(product.id || '').trim().toLowerCase();
  const stored = slugify(product.slug);
  // V1.3 stored the SKU as the initial slug. The display name is better for URLs.
  const legacySku = slugify(id);
  if (stored && stored !== legacySku) return stored;
  // Preserve published names for the original eight looks, even after title edits.
  const originalSlugs = {
    'sh-sunshine':'sunshine', 'sh-starlight':'starlight',
    'sh-fireheart':'fire-and-heart', 'sh-dawndusk':'dawn-and-dusk',
    'sh-urashima':'urashima-taro', 'sh-lozen':'lozen',
    'sh-bellona':'bellona', 'sh-blaze':'blaze'
  };
  return originalSlugs[legacySku] || slugify(product.title) || legacySku.replace(/^sh-/, '') || '';
}
export function productPath(product) {
  return `/look/${encodeURIComponent(productSlug(product))}`;
}
export function findProductBySlug(products, value) {
  const slug = slugify(value);
  return (products || []).find(product => productSlug(product) === slug) || null;
}
export function findProductByLegacyId(products, value) {
  const key = String(value || '').trim().toLowerCase();
  return (products || []).find(product =>
    String(product.id || '').toLowerCase() === key ||
    String(product.slug || '').toLowerCase() === key ||
    productSlug(product) === slugify(key)) || null;
}
