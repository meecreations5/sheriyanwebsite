import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const json=f=>JSON.parse(read(f));
const pages=['index','collections','collection','look','bespoke','story','contact','styling-services','appointment','accessories'];
const data=pages.map(slug=>json(`data/seed/pages/${slug}.json`));
for(const page of data){assert.ok(page.bodyHtml.includes('<main'),`${page.slug} main`);assert.ok(Array.isArray(page.fields),`${page.slug} fields`);assert.ok(Array.isArray(page.sections),`${page.slug} sections`);}
const manifest=json('data/seed/manifest.json').map(x=>x.slug);
for(const slug of ['styling-services','appointment','accessories'])assert.ok(manifest.includes(slug),`${slug} registered`);
const products=json('data/seed/products.json');
const expected={'SH-SUNSHINE':'SH 001','SH-STARLIGHT':'SH 002','SH-BELLONA':'SH 003','SH-LOZEN':'SH 004','SH-BLAZE':'SH 005','SH-DAWNDUSK':'SH 006','SH-URASHIMA':'SH 007','SH-FIREHEART':'SH 008'};
assert.equal(products.length,8,'eight legacy looks intact');
for(const p of products){assert.equal(p.styleNumber,expected[p.id],`display number ${p.id}`);assert.ok(Array.isArray(p.accessories),'accessories per product');assert.ok(p.gallery.length>=3,'look gallery exists');}
assert.equal(new Set(products.map(p=>p.id)).size,8,'internal IDs remain unique');
assert.equal(json('data/seed/categories.json').find(c=>c.id==='gowns').name,'Statement Outfits');
const final=read('lib/final-feedback-v119.mjs');
for(const label of ['INCHES (in)','HOW TO MEASURE YOURSELF','Two Ways to Work With Us','Online Bespoke','In-Studio Bespoke','Book Your Appointment','Explore All Looks','Live in Luxury','Effortless movement','WhatsApp','v119-bespoke-submit'])assert.ok(final.includes(label),`final transform includes ${label}`);
assert.ok(!final.includes('$(el).detach()'),'unsupported Cheerio detach never reintroduced');
assert.match(read('public/shaneryn-final-v119.js'),/Color Analysis is available by in-studio appointment only/);
assert.match(read('app/api/requests/route.js'),/Color Analysis appointments are available in the studio only/);
assert.match(read('lib/cms-server-api.js'),/styleNumber:small\(p\.styleNumber/);
assert.match(read('lib/cms-server-api.js'),/accessories:cleanArray\(p\.accessories/);
assert.match(read('components/admin/CmsApp.jsx'),/Style Number \(customer-facing, editable\)/);
assert.match(read('components/admin/CmsApp.jsx'),/Accessories for this Look/);
assert.match(read('public/look-detail-v45.js'),/const mainViews=images\.slice\(0,3\)/);
for(const label of ['Front','Back','Profile'])assert.ok(read('public/look-detail-v45.js').includes(label),`gallery contains ${label}`);
assert.match(read('public/look-detail-v45.js'),/const detailViews=images\.slice\(3\)/);
assert.match(read('public/shaneryn-final-v119.css'),/aspect-ratio:3\/4!important/);
assert.ok(fs.statSync(path.join(root,'public/assets/shaneryn-how-to-measure.png')).size>100_000,'client measurement graphic copied');
assert.ok(read('public/feedback-v3.js').includes("'Body Measurements'"),'client measurement field name');
assert.ok(!read('public/feedback-v3.js').includes("'Body & Fit'"),'old group label removed');
assert.ok(!/\bShoulder width\b/.test(read('public/feedback-v3.js').replace(/replace\(\/Shoulder width[^;]+;/g,'')),'old field label removed');
for(const slug of ['collections','collection','look']){
 const page=data.find(x=>x.slug===slug);
 for(const id of ['f119-quote-small','f119-quote-main','f119-quote-last'])assert.ok(page.fields.some(f=>f.id===id),`${slug} quote CMS editable`);
}
const sty=data.find(x=>x.slug==='styling-services');
for(const service of ['Bespoke','Color Analysis','Personal Styling','Occasion Styling'])assert.ok(sty.bodyHtml.includes(`data-v119-service="${service}"`),`${service} service block`);
assert.ok(sty.bodyHtml.includes('id="v67-appointment-form"'),'styling has actual booking form');
assert.ok(data.find(x=>x.slug==='appointment').bodyHtml.includes('id="v67-appointment-form"'),'appointment page has actual form');
assert.ok(data.find(x=>x.slug==='accessories').bodyHtml.includes('v119-accessory-gallery'),'accessory page has dynamic gallery');
assert.ok(read('components/LegacyScripts.jsx').includes('shaneryn-final-v119.js'),'frontend enhancements run');
assert.ok(read('lib/render-page.js').includes('applyFinalFeedback($,page,products,settings,curatedCollections,activeProductId)'),'server transforms old CMS markup');
console.log('PASS: Final client feedback source checks — 8 style numbers, 3 new pages, CMS fields, bespoke, services, catalogue, appointments and media.');
