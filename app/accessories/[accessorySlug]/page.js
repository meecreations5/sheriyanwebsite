import {notFound} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadAccessories,loadPage,loadSettings} from '@/lib/cms-data';
import {buildPublicMetadata} from '@/lib/seo-utils';
import {accessoryPath} from '@/lib/catalogue-model.mjs';
export const dynamic='force-dynamic';
async function resolve(params){
 const {accessorySlug}=await params;
 if(!/^[a-z0-9-]{1,80}$/.test(accessorySlug||''))notFound();
 const item=(await loadAccessories()).find(a=>a.id===accessorySlug);
 if(!item)notFound();
 return item;
}
export async function generateMetadata({params}){
 const item=await resolve(params);
 const [page,settings]=await Promise.all([loadPage('accessories'),loadSettings()]);
 return buildPublicMetadata({title:item.seoTitle||`${item.name} | SHANERYN Accessories`,description:item.seoDescription||item.description||`Discover ${item.name} at SHANERYN.`,image:item.image,canonical:accessoryPath(item),settings,index:Boolean(page&&page.visible!==false)});
}
export default async function AccessoryDetail({params}){
 const item=await resolve(params);
 return <LegacyPage slug="accessories" activeAccessoryId={item.id}/>;
}
