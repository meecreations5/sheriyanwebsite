import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const {productSlug,productPath,findProductBySlug}=await import('../lib/product-paths.js');
const products=JSON.parse(read('data/seed/products.json'));
const paths=new Set();
for(const p of products){const u=productPath(p);assert.match(u,/^\/look\/[a-z0-9-]+$/);assert.ok(!u.includes('SH-'));assert.equal(findProductBySlug(products,productSlug(p)).id,p.id);paths.add(u)}
assert.equal(paths.size,products.length,'Each seeded look needs a unique public path');
for(const file of ['app/page.js','app/look/[productSlug]/page.js','app/collections/[collectionSlug]/page.js','components/LegacyScripts.jsx','components/LegacyPage.jsx','next.config.mjs'])assert.ok(fs.existsSync(path.join(root,file)));
const redirects=read('next.config.mjs');assert.ok(redirects.includes('/index.html'));assert.ok(redirects.includes('/new-drop.html'));
console.log('PASS: '+products.length+' clean public product URLs, original pages and legacy redirects');
