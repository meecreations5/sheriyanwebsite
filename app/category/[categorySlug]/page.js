import {notFound} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadCategories,loadPage,loadSettings,loadProducts,seedCategories} from '@/lib/cms-data';
import {buildPublicMetadata} from '@/lib/seo-utils';
import {clothingCategoryPath,findClothingCategory,categoryHasLooks} from '@/lib/clothing-catalogue.mjs';
export const dynamic='force-dynamic';
async function resolveCategory(params){
 const {categorySlug}=await params;
 if(!/^[a-z0-9-]{1,80}$/.test(categorySlug||''))notFound();
 const category=findClothingCategory(await loadCategories(),categorySlug);
 if(!category||category.id!==categorySlug)notFound();
 return category;
}
export async function generateMetadata({params}){
 const category=await resolveCategory(params);
 const [settings,page,products]=await Promise.all([loadSettings(),loadPage('collection'),loadProducts()]);
 return buildPublicMetadata({
  title:`${category.name} | SHANERYN`,description:category.copy||`Explore ${category.name} at SHANERYN.`,
  image:category.image,canonical:clothingCategoryPath(category),settings,
  index:Boolean(page&&page.visible!==false&&categoryHasLooks(category,products,seedCategories()))
 });
}
export default async function ClothingCategoryPage({params}){
 const category=await resolveCategory(params);
 return <LegacyPage slug="collection" activeClothingCategory={category}/>;
}
