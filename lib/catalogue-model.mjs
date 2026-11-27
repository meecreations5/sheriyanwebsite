// Public, side-effect-free catalogue helpers. No database access or browser globals.
// Older curated collection records have no type and are always clothing.
export function collectionType(collection) {
  return collection?.type === 'accessories' ? 'accessories' : 'clothing';
}
export function accessoryPath(accessory) {
  return '/accessories/' + encodeURIComponent(String(accessory?.id || '').toLowerCase());
}
export function accessoryCollectionPath(collection) {
  return '/accessories/collections/' + encodeURIComponent(String(collection?.id || '').toLowerCase());
}
export function accessoryCategoryPath(category) {
  return '/accessories/category/' + encodeURIComponent(String(category?.id || '').toLowerCase());
}
export function accessoryMatchesCollection(accessory, collectionId) {
  return Array.isArray(accessory?.collectionIds) && accessory.collectionIds.includes(collectionId);
}
export function accessoryMatchesLook(accessory, lookId) {
  return Array.isArray(accessory?.relatedLookIds) && accessory.relatedLookIds.includes(lookId);
}
export function visibleAccessories(accessories = []) {
  return accessories.filter(item => item && item.visible !== false)
    .sort((a,b)=>(Number(a.sortOrder)||0)-(Number(b.sortOrder)||0));
}
export function decorateLookAccessories(products = [], accessories = []) {
  const visible = visibleAccessories(accessories);
  return products.map(product => {
    const related = visible.filter(item => accessoryMatchesLook(item,product.id))
      .map(item => ({name:item.name,image:item.image,price:item.price,description:item.description,
                    publicPath:accessoryPath(item),visible:true}));
    if (!related.length) return product;
    const existing = Array.isArray(product.accessories) ? product.accessories : [];
    const unique = related.filter(next => !existing.some(old =>
      String(old.image||'').trim()===String(next.image||'').trim() &&
      String(old.name||'').trim().toLowerCase()===String(next.name||'').trim().toLowerCase()));
    return {...product,accessories:[...existing,...unique]};
  });
}
// Legacy accessories are kept on the public Accessories landing page, without
// importing a copy into the independent CMS catalogue or changing look records.
export function legacyAccessories(products=[], independent=[]) {
  const known=new Set(independent.map(a=>String(a.image||'')+'|'+String(a.name||'').toLowerCase()));
  const found=[];
  for(const product of products) {
    if(product.visible===false)continue;
    for(const accessory of product.accessories||[]) {
      if(accessory.visible===false||!accessory.image)continue;
      const key=String(accessory.image)+'|'+String(accessory.name||'').toLowerCase();
      if(known.has(key))continue;
      known.add(key);
      found.push({...accessory,sourceLookId:product.id,sourceLookTitle:product.title,sourceLookSlug:product.slug});
    }
  }
  return found;
}
