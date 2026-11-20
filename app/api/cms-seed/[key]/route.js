import {pageSeed,pageManifest,seedProducts,seedCollections,seedCategories,seedCuratedCollections,seedSettings,seedForms} from '@/lib/seed';
export const dynamic='force-dynamic';
export async function GET(_req,{params}){
 const {key}=await params;
 const staticData={manifest:pageManifest,products:seedProducts,collections:seedCollections,categories:seedCategories,'curated-collections':seedCuratedCollections,forms:seedForms,settings:seedSettings};
 const value=staticData[key]?staticData[key]():/^page-[a-z0-9-]+$/.test(key)?pageSeed(key.slice(5)):null;
 if(!value)return Response.json({error:'Not found'},{status:404});
 return Response.json(value,{headers:{'Cache-Control':'public, max-age=300'}});
}
