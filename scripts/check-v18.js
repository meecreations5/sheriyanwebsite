const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const render=read('lib/render-page.js');
const admin=read('components/admin/CmsApp.jsx');
const homepage=JSON.parse(read('data/seed/pages/index.json'));
const products=JSON.parse(read('data/seed/products.json'));
const bestSection=homepage.sections.find(s=>s.originalId==='best-seller');
assert.ok(bestSection,'Homepage must have a Best Seller section');
const imageField=homepage.fields.find(f=>f.section===bestSection.id&&f.kind==='src');
assert.ok(imageField&&imageField.value.startsWith('assets/'),'Best Seller must retain its own baseline image');
const altField=homepage.fields.find(f=>f.section===bestSection.id&&f.kind==='alt');
assert.ok(altField,'Best Seller needs independent image description');
const extract=(start,end)=>{const a=render.indexOf(start),b=render.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'Missing renderer function '+start);return render.slice(a,b)};
const functions=extract('function patchFields($,page){','function patchSections($,page){')+'\n'+extract('function patchProducts($,products,settings,visibleCategories){','function patchCuratedCollections($,collections,active){');
const values={image:{src:imageField.value,alt:altField.value},imageLink:{href:'look.html?id=SH-STARLIGHT'},cta:{href:'look.html?id=SH-STARLIGHT'}};
let captionReplaced=false;
const mock={
  image:{length:1,attr(k,v){if(arguments.length===1)return values.image[k];values.image[k]=v;return this}},
  imageLink:{length:1,attr(k,v){if(arguments.length===1)return values.imageLink[k];values.imageLink[k]=v;return this}},
  cta:{length:1,attr(k,v){if(arguments.length===1)return values.cta[k];values.cta[k]=v;return this}}
};
const empty={length:0};
function $(selector){
 if(selector==='[data-cms-src="'+imageField.id+'"]'||selector==='[data-cms-alt="'+altField.id+'"]'||selector==='.best-seller-image img')return mock.image;
 if(selector==='[data-cms-href="f00046"]')return mock.cta;
 if(selector==='[data-cms-href="f00047"]')return mock.imageLink;
 if(selector==='.best-seller-image,.best-seller-text .underline-link')return {length:2,attr(key,value){mock.imageLink.attr(key,value);mock.cta.attr(key,value);return this}};
 if(selector==='.best-image-caption')return {length:1,html(){captionReplaced=true;return this}};
 return empty;
}
$.root=()=>({find:()=>({contents:()=>({each:()=>{}})})});
const ctx={
  $,console,
  normalized:(patches,id)=>patches?.[id]||null,
  safeImage:v=>/^(https:\/\/|\/|assets\/)/.test(v||'')?v:'',
  safeUrl:v=>String(v),
  escapeHtml:v=>String(v),
  attrCSS:()=>{},
};
vm.runInNewContext(read('lib/product-paths.js').replace(/\bexport\s+/g,'')+'\nthis.productPath=productPath;',ctx);
vm.runInNewContext(functions+'\nthis.patchFields=patchFields;this.patchProducts=patchProducts;',ctx);
const uploaded='https://firebasestorage.googleapis.com/v0/b/studio/o/media%2Fbest-seller.jpg?alt=media';
const page={fields:homepage.fields,patches:{[imageField.id]:{value:uploaded,visible:true},[altField.id]:{value:'Exclusive SHANERYN campaign photograph',visible:true}}};
const selected=products.find(p=>p.id==='SH-SUNSHINE');
assert.ok(selected,'SUNSHINE look available');
ctx.patchFields($,page);
assert.equal(values.image.src,uploaded,'Page Manager image patch should be applied to Best Seller');
ctx.patchProducts($,products,{home:{bestSellerId:selected.id,featuredProductIds:[]}},[]);
assert.equal(values.image.src,uploaded,'Choosing a different linked product must never replace the uploaded section image');
assert.equal(values.image.alt,'Exclusive SHANERYN campaign photograph','Product selection must not replace the uploaded photograph description');
assert.equal(values.imageLink.href,'/look/sunshine','Clicking Best Seller image must open selected product');
assert.equal(values.cta.href,'/look/sunshine','Best Seller CTA must open selected product');
assert.equal(captionReplaced,false,'Product selection must not overwrite editable Best Seller caption');
const productB=products.find(p=>p.id==='SH-STARLIGHT');
ctx.patchProducts($,products,{home:{bestSellerId:productB.id,featuredProductIds:[]}},[]);
assert.equal(values.image.src,uploaded,'Changing selected product again must preserve photo');
assert.equal(values.imageLink.href,'/look/starlight');
assert.match(admin,/Homepage Best Seller/,'Easy-to-find Best Seller image controls must be present');
assert.match(admin,/bestSellerPhoto\.id/,'Best Seller panel must reuse the existing page image field');
assert.match(admin,/Best Seller — Linked Product/,'Linked product selector must have clear label');
assert.doesNotMatch(admin,/label="Best Seller Image \(optional\)"/,'Product gallery must not provide misleading Best Seller image override');
console.log('PASS V1.8: Homepage section photo survives linked-product changes; CTA and photograph link to selected product; section caption and alt remain independently editable.');
