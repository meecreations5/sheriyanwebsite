import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
const base=path.join(process.cwd(),'data','seed');
const read=name=>JSON.parse(fs.readFileSync(path.join(base,name),'utf8'));
export function pageSeed(slug){try{return read('pages/'+slug+'.json')}catch{return null}}
export function pageManifest(){return read('manifest.json')}
export const seedProducts=()=>read('products.json');
export const seedCategories=()=>read('categories.json');
export const seedCuratedCollections=()=>read('curated-collections.json');
// Backward compatible alias for older imports.
export const seedCollections=seedCategories;
export const seedSettings=()=>read('settings.json');
export const seedForms=()=>read('forms.json');
