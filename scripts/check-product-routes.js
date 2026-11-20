const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const {productPath,findProductBySlug,findProductByLegacyId}=await import('../lib/product-paths.js');
 const products=JSON.parse(fs.readFileSync(path.join(root,'data/seed/products.json'),'utf8'));
 const urls=products.map(productPath);
 assert.equal(new Set(urls).size,products.length,'Product URL slugs must be unique');
 assert.ok(urls.every(u=>/^\/look\/[a-z0-9-]+$/.test(u)),'No SKU query strings are permitted in product URLs');
 assert.equal(productPath(findProductByLegacyId(products,'SH-SUNSHINE')),'/look/sunshine');
 assert.equal(findProductBySlug(products,'starlight').id,'SH-STARLIGHT');
 assert.equal(productPath({...products[0],title:'New Sunshine Name'}),'/look/sunshine','Renaming a baseline product should not silently change its URL');
 assert.equal(productPath({id:'SH-CUSTOM-1',title:'A Look',slug:'magenta-night'}),'/look/magenta-night');
 assert.equal(findProductBySlug(products,'not-a-real-look'),null);
 for (const f of ['app/look/[productSlug]/page.js','app/[slug]/page.js'])assert.ok(fs.existsSync(path.join(root,f)),'Missing App Router route '+f);
 console.log('PASS',products.length,'clean product URLs, slug resolution, SKU redirects and route files');
})().catch(err=>{console.error(err);process.exitCode=1});
