import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {normalizeProductDetails} from '../lib/product-details.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const escaped=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

// Old products can have no structured information; empty records stay invisible.
assert.deepEqual(normalizeProductDetails(null),{fabric:[],design:[],embroidery:'',occasions:[]});
assert.deepEqual(normalizeProductDetails({fabric:[{},null,{garment:'',description:'   '}],design:[],occasions:['','  ']}),
 {fabric:[],design:[],embroidery:'',occasions:[]});
const sanitized=normalizeProductDetails({
 fabric:[{garment:' Black Palazzo Pant ',description:'Heavy-weight stretch crepe'}, {garment:'Black Sheer Top',description:'Liquid chiffon'}],
 design:[{garment:'Black Sheer Top',description:'Sheer high-low shirt'}],
 embroidery:'Beads\nCrystal',occasions:['Gala Dinners','Cocktail Parties','Gala Dinners',' '],
});
assert.equal(sanitized.fabric.length,2);
assert.equal(sanitized.design.length,1);
assert.deepEqual(sanitized.occasions,['Gala Dinners','Cocktail Parties']);
assert.equal(sanitized.embroidery,'Beads\nCrystal');
assert.equal(normalizeProductDetails({fabric:Array.from({length:20},()=>({description:'x'}))}).fabric.length,12);
assert.equal(normalizeProductDetails({occasions:Array.from({length:30},(_,i)=>`event ${i}`)}).occasions.length,20);

const render=read('lib/render-page.js');
const start=render.indexOf('function renderProductInformation(');
const end=render.indexOf('\nexport function renderPage(',start);
assert.ok(start>0&&end>start,'Product renderer exists');
const calls=[],removed=[];
const $=selector=>({first(){return this},after(html){calls.push({selector,html})},remove(){removed.push(selector)}});
const context={normalizeProductDetails,escapeHtml:escaped,$,console};
vm.runInNewContext(render.slice(start,end)+'\nglobalThis.__renderProductInformation=renderProductInformation;',context);
const renderInfo=context.__renderProductInformation;
const product={id:'SH-URASHIMA',title:'Urashima Taro',tagline:'',description:'',occasion:'evening',price:' ₹ 18,500 ',productDetails:{
 ...sanitized,
 fabric:[...sanitized.fabric,{garment:'<script>alert(1)</script>',description:'text <b>tag</b>'}],
}};
renderInfo($,{slug:'look'},[product],'SH-URASHIMA');
assert.deepEqual(removed,['#detail-tagline','#detail-description']);
assert.equal(calls.length,2);
const price=calls.find(row=>row.selector==='.ld-title-wrap')?.html;
const details=calls.find(row=>row.selector==='.ld-actions')?.html;
assert.match(price,/₹ 18,500/);
for(const heading of ['FABRIC','DESIGN DESCRIPTION','EMBROIDERY &amp; DETAILING','OCCASION'])assert.ok(details.includes(heading),`Missing heading ${heading}`);
assert.match(details,/Black Palazzo Pant/);
assert.match(details,/Cocktail Parties/);
assert.match(details,/Beads<br>Crystal/);
assert.match(details,/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
assert.doesNotMatch(details,/<script>|<b>tag<\/b>/);

calls.length=0;removed.length=0;
renderInfo($,{slug:'look'},[{id:'SH-EMPTY',tagline:'',description:'',price:'',occasion:'evening'}],'SH-EMPTY');
assert.equal(calls.length,0,'No empty price or product information wrapper');
assert.deepEqual(removed,['#detail-tagline','#detail-description']);

calls.length=0;removed.length=0;
renderInfo($,{slug:'look'},[{id:'SH-OCC',occasion:'bridal',productDetails:{occasions:[]}}],'SH-OCC');
assert.equal(calls.length,0,'Catalogue occasion filter alone cannot create an Occasion description');

calls.length=0;
renderInfo($,{slug:'home'},[product],product.id);
assert.equal(calls.length,0,'Homepage layout is unchanged');

const cmsApi=read('lib/cms-server-api.js');
const ui=read('components/admin/CmsApp.jsx');
const publicPage=read('components/LegacyPage.jsx');
assert.match(cmsApi,/price:small\(p\.price,100\)\.trim\(\),productDetails:normalizeProductDetails\(p\.productDetails\)/);
assert.match(cmsApi,/occasion:small\(p\.occasion,90\)/,'Original filter value persists');
assert.match(publicPage,/categories,activeProductId\)/,'Active product is provided to the server renderer');
assert.match(ui,/\['description','Descriptions'\]/,'New user-friendly tab');
assert.match(ui,/\+ Add garment/);
assert.match(ui,/\+ Add occasion/);
assert.match(ui,/No separate Show\/Hide switches/);
assert.match(ui,/Catalogue Occasion Filter/);
assert.match(read('public/look-detail-v45.js'),/ld-product-detail-block/);
console.log('PASS V1.18.6: optional fields, repeatable garments, escaping, blank suppression, occasion filter independence, and CMS field wiring');
