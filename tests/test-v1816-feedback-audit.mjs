import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=name=>fs.readFileSync(path.resolve(root,name),'utf8');
const look=JSON.parse(read('data/seed/pages/look.json'));
const collections=JSON.parse(read('data/seed/pages/collections.json'));
const lookHtml=look.bodyHtml;
const render=read('lib/render-page.js');
const admin=read('components/admin/CmsApp.jsx');
const lookJs=read('public/look-detail-v45.js');
const lookCss=read('public/look-detail-v45.css');
const closingCss=read('public/shaneryn-v1816-feedback-audit.css');
const pageComponent=read('components/LegacyPage.jsx');
const homepageCss=read('public/shaneryn-v190-refinements.css');
const bespokeCss=read('public/shaneryn-v1914-bespoke-borderless.css');
const priceCss=read('public/shaneryn-v1815-collection-prices.css');

// 01 / Catalogues derive prices from the actual published CMS product object.
assert.match(read('public/site.js'),/priceLabel\(p\.price\)/);
assert.match(read('public/editorial-pages.js'),/showPrice&&priceLabel\(p\.price\)/);
assert.match(priceCss,/catalogue-price/);
assert.match(priceCss,/ep-card-price/);
// 02 / Collections introduction heading, body and action are editable in CMS.
for (const id of ['f00242','f00243','f00244','f00245']) {
 assert.ok(collections.fields.some(f=>f?.id===id&&f.kind==='text'),id+' editable in published CMS seed');
 assert.ok(admin.includes('cms-curated-'+id),id+' visible editing control');
}
assert.match(render,/function patchCuratedCollections/);
// 03 / Correct editorial title hierarchy, tagline, category and strong price.
assert.match(render,/headline\.before\(tagline\)/);
assert.match(render,/headline\.after\(categoryLine\)/);
assert.match(lookCss,/\.ld-product-price strong\{font:500 clamp\(22px/);
// 04 / Optional structured descriptions, ahead of buying controls.
for (const label of ['FABRIC','DESIGN DESCRIPTION','EMBROIDERY &amp; DETAILING','OCCASION']) assert.ok(render.includes(label),label);
assert.match(render,/if\(blocks\.length\)/);
assert.match(render,/\.ld-actions'\)\.first\(\)\.before\(information\)/);
// 05 / Colour Story removed in actual server renderer, not only hidden with CSS.
assert.match(render,/\.ld-colour'\)\.remove\(\)/);
assert.doesNotMatch(lookHtml,/class="ld-colour"/,'Colour Story must not remain in current Look Details HTML');
for(const id of ['f00211','f00212','f00213'])assert.ok(!look.fields.some(f=>f?.id===id),id+' should not appear as an obsolete CMS edit control');
// 06 / Measurements introduction removed, units locked to inches, CMS field gone.
assert.ok(lookHtml.includes('MEASUREMENTS REQUIRED'));
assert.doesNotMatch(lookHtml,/class="ld-measure-note"/);
assert.ok(!look.fields.some(f=>f?.id==='f00222'),'Unused measurement intro field not presented in Page Manager');
assert.match(render,/\.ld-made \.ld-measure-note'\)\.remove\(\)/);
assert.match(closingCss,/\.ld-made \.ld-measure-note\s*\{\s*display:\s*none\s*!important/);
assert.match(lookJs,/const unitName=\(\)=> 'in'/);
assert.match(lookJs,/\$\{esc\(name\)\} \(in\)/);
// 07 / Actual customer submission API, not just a renamed CTA.
assert.ok(lookHtml.includes('SUBMIT YOUR MEASUREMENTS'));
for (const id of ['ld-customer-name','ld-customer-email','ld-enquire-measures']) assert.ok(lookHtml.includes('id="'+id+'"'),id);
assert.match(lookJs,/fetch\('\/api\/requests'/);
assert.match(lookJs,/measurementSummary:values\.join/);
assert.match(read('app/api/requests/route.js'),/await ref\.set\(/);
// 08 / Related imagery retains natural height.
assert.match(lookCss,/\.ep-related-grid \.ep-card>a:first-child img\{[^}]*height:auto;[^}]*aspect-ratio:auto;[^}]*object-fit:contain;/);
// 09 / Bespoke overlapping photos borderless without changing positioning.
assert.match(bespokeCss,/\.v63-bespoke-intro \.bespoke-visual > img/);
assert.match(bespokeCss,/border: 0 !important/);
// 10 / Existing 17 Past Work photos + CMS controls for extras.
const bespoke=JSON.parse(read('data/seed/pages/bespoke.json'));
assert.equal((bespoke.bodyHtml.match(/class="v63-work-item"/g)||[]).length,17);
assert.match(admin,/Add Photograph/);
assert.match(admin,/movePastWorkPhoto/);
assert.match(admin,/Show photograph on website/);
assert.match(read('lib/cms-server-api.js'),/pastWorkExtras:cleanArray/);
// 11 / Homepage closing label upright.
assert.match(homepageCss,/#closure \.closure-v62-kicker em\s*\{\s*font-style:\s*normal !important/);
// 12 / Closing copy matches all 3 lines; light-theme headline is actually legible.
for (const text of ['clothes to empower','effortless moments','for fun celebrations']) assert.ok(lookHtml.includes(text),text);
assert.match(closingCss,/background:\s*#241e26/);
assert.match(closingCss,/\.ld-interlude-headline,\s*\n\.shaneryn-public-site\[data-cms-page="look"\] \.ld-interlude \.ld-interlude-note\s*\{\s*color:\s*#fff/);
assert.match(closingCss,/color:\s*#e4a9c9 !important/);
assert.match(pageComponent,/slug==='look'&&<link rel="stylesheet" href="\/shaneryn-v1816-feedback-audit.css"\/>/);
assert.ok(pageComponent.indexOf('/cms-bridges.css')<pageComponent.indexOf('/shaneryn-v1816-feedback-audit.css'),'Contrast override must follow legacy styles');
// 13 / CMS editable labels and images remain active.
for (const id of ['f00217','f00227','f00235','f00236','f00238']) assert.ok(look.fields.some(f=>f?.id===id),id+' still editable');
assert.match(admin,/Save & Publish/);
assert.match(read('public/cms-preview.js'),/shaneryn-cms-preview/);
// 14 / Responsive styles and mobile app-style views retained.
assert.match(read('public/mobile-v5.css'),/body\[data-page="look"\] \.ld-product/);
assert.match(priceCss,/@media\(max-width:720px\)/);
assert.match(lookCss,/@media\(max-width:850px\)/);
assert.match(homepageCss,/@media \(max-width: 720px\)/);
console.log('PASS V1.18.16: 14 written requirements audited in source; three template/visual issues corrected.');

// Exercise customer measurement requests against the real server handler with
// in-memory Firestore mocks. No live customer data or credentials are accessed.
const rawRoute=read('app/api/requests/route.js');
const routeJs=rawRoute.replace(/^import [^\n]*\n/gm,'').replace('export const runtime=', 'const runtime=').replace('export async function POST','async function POST');
const writes=[];
const fakeDb=()=>({collection:name=>({doc:()=>({id:'abc123456',set:async data=>{writes.push({name,data})}})})});
const context={adminDb:fakeDb,FieldValue:{serverTimestamp:()=>'<server-timestamp>'},Response,Date,URL,Map,Number,Object,String,Error,console,Math};
vm.runInNewContext(routeJs+'\nglobalThis.submitRequest=POST;',context);
const domain='https://shanerynwebsite.vercel.app';
const request=fields=>new Request(domain+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json',Origin:domain,Host:'shanerynwebsite.vercel.app'},body:JSON.stringify({kind:'enquiry',source:'/look/starlight',fields})});
const submitted=await context.submitRequest(request({name:'Example Customer',email:'example@customer.test',phone:'',look:'SH-STARLIGHT',message:'Measurements for Starlight (SH-STARLIGHT)\nWaist: 32 in',measurementSummary:'Waist: 32 in'}));
assert.equal(submitted.status,201,'valid measurement enquiry persisted');
assert.equal((await submitted.json()).ok,true);
assert.equal(writes.length,1);
assert.equal(writes[0].name,'cms_requests');
assert.equal(writes[0].data.fields.measurementSummary,'Waist: 32 in');
const rejected=await context.submitRequest(request({name:'X',email:'bad@',message:'Waist: 32 in'}));
assert.equal(rejected.status,400);
assert.equal(writes.length,1,'bad form may not create a request');
console.log('PASS V1.18.16: measurement enquiry reaches the studio requests collection; invalid submissions rejected.');
