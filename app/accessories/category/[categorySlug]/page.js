import {notFound} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadAccessoryCategories,loadAccessories,loadPage,loadSettings} from '@/lib/cms-data';
import {buildPublicMetadata} from '@/lib/seo-utils';
import {accessoryCategoryPath} from '@/lib/catalogue-model.mjs';
export const dynamic='force-dynamic';
async function resolve(params){
 const {categorySlug}=await params;
 if(!/^[a-z0-9-]{1,80}$/.test(categorySlug||''))notFound();
 const item=(await loadAccessoryCategories()).find(c=>c.id===categorySlug);
 if(!item)notFound();
 return item;
}
export async function generateMetadata({params}){
 const item=await resolve(params);
 const [settings,page,accessories]=await Promise.all([loadSettings(),loadPage('accessories'),loadAccessories()]);
 return buildPublicMetadata({title:`${item.name} | SHANERYN Accessories`,description:item.description||`Discover ${item.name} at SHANERYN.`,image:item.image,canonical:accessoryCategoryPath(item),settings,index:Boolean(page&&page.visible!==false&&accessories.some(a=>a.categoryId===item.id))});
}
export default async function AccessoryCategory({params}){
 const item=await resolve(params);
 return <LegacyPage slug="accessories" accessoryCategory={item}/>;
}
