import {notFound} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadCuratedCollections,loadAccessories,loadPage,loadSettings} from '@/lib/cms-data';
import {buildPublicMetadata} from '@/lib/seo-utils';
import {collectionType,accessoryCollectionPath,accessoryMatchesCollection} from '@/lib/catalogue-model.mjs';
export const dynamic='force-dynamic';
async function resolve(params){
 const {collectionSlug}=await params;
 if(!/^[a-z0-9-]{1,80}$/.test(collectionSlug||''))notFound();
 const item=(await loadCuratedCollections()).find(c=>c.id===collectionSlug&&collectionType(c)==='accessories');
 if(!item)notFound();
 const accessories=await loadAccessories();
 if(!accessories.some(a=>accessoryMatchesCollection(a,item.id)))notFound();
 return item;
}
export async function generateMetadata({params}){
 const item=await resolve(params);
 const [settings,page,accessories]=await Promise.all([loadSettings(),loadPage('accessories'),loadAccessories()]);
 return buildPublicMetadata({title:item.seoTitle||`${item.name} | SHANERYN Accessories`,description:item.seoDescription||item.description||`Explore ${item.name} accessories.`,image:item.image,canonical:accessoryCollectionPath(item),settings,index:Boolean(page&&page.visible!==false&&accessories.some(a=>accessoryMatchesCollection(a,item.id)))});
}
export default async function AccessoryCollection({params}){
 const item=await resolve(params);
 return <LegacyPage slug="accessories" accessoryCollection={item}/>;
}
