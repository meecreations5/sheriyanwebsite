import {notFound} from 'next/navigation';
import LegacyPage from '@/components/LegacyPage';
import {loadCuratedCollections} from '@/lib/cms-data';
export const dynamic='force-dynamic';
async function findCollection(params){
 const {collectionSlug}=await params;
 if(!/^[a-z0-9-]{1,80}$/.test(collectionSlug||''))notFound();
 const list=await loadCuratedCollections();
 const selected=list.find(c=>c.id===collectionSlug);
 if(!selected)notFound();return selected;
}
export async function generateMetadata({params}){
 const collection=await findCollection(params);
 return {title:collection.name+' | SHANERYN',description:collection.description||'Curated looks from SHANERYN',alternates:{canonical:'/collections/'+collection.id},openGraph:{title:collection.name+' | SHANERYN',images:collection.image?[collection.image.startsWith('assets/')?'/'+collection.image:collection.image]:[]}};
}
export default async function CuratedCollection({params}){
 const collection=await findCollection(params);
 return <LegacyPage slug="collections" curatedCollection={collection}/>;
}
