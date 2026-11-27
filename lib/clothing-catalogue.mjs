// Shared, side-effect-free clothing catalogue rules. Public pages never need
// a deployed list of category names; the CMS owns labels, IDs and membership.
import {collectionType} from './catalogue-model.mjs';
const lower=value=>String(value||'').trim().toLocaleLowerCase('en');
export const clothingCategoryPath=category=>'/category/'+encodeURIComponent(String(category?.id||'').toLowerCase());
export function findClothingCategory(categories=[],identifier=''){
 const key=lower(identifier);
 return categories.find(c=>lower(c.id)===key||lower(c.name)===key)||null;
}
export function clothingCategoryForProduct(product,categories=[],originalCategories=[]){
 if(!product)return null;
 const matchId=categories.find(c=>c.id===product.categoryId);
 if(matchId)return matchId;
 const legacyName=lower(product.cat)==='gowns'?'statement outfits':lower(product.cat);
 const matchName=categories.find(c=>lower(c.name)===legacyName);
 if(matchName)return matchName;
 // Early SHANERYN seed products had only a category name, not a category ID.
 // After an admin rename, match that original name to the immutable ID.
 const original=originalCategories.find(c=>lower(c.name)===legacyName||
   (c.id==='gowns'&&legacyName==='statement outfits'));
 return original?categories.find(c=>c.id===original.id)||null:null;
}
export function normalizeClothingProducts(products=[],categories=[],originalCategories=[]){
 return products.map(p=>{
  const category=clothingCategoryForProduct(p,categories,originalCategories);
  return category?{...p,categoryId:category.id,cat:category.name}:p;
 });
}
export function categoryHasLooks(category,products=[],originalCategories=[]){
 return Boolean(category && products.some(p=>p.visible!==false &&
  clothingCategoryForProduct(p,[category],originalCategories)?.id===category.id));
}
export function publishedClothingCollections(collections=[],products=[]){
 return collections.filter(c=>collectionType(c)==='clothing'&&c.visible!==false&&
  products.some(p=>p.visible!==false && Array.isArray(p.collectionIds)&&p.collectionIds.includes(c.id)));
}
