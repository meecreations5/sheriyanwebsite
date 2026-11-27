import assert from 'node:assert/strict';
import {patchAccessoryCatalogue} from '../lib/catalogue-render.mjs';
const landing={heading:'',description:'',gallery:'',inserts:[],main:''};
function mockDom(state){
 const gallery={length:1,html(value){if(value!==undefined)state.gallery=value;return this},closest(){return parent}};
 const parent={before(html){state.inserts.push(html);return this}};
 const heading={length:1,text(value){state.heading=value;return this}};
 const description={length:1,text(value){state.description=value;return this}};
 const main={length:1,replaceWith(value){state.main=value;return this}};
 return selector=>({
   '.v119-page-intro h1':{first:()=>heading},
   '.v119-page-intro>p':{last:()=>description},
   '#v119-accessory-gallery':gallery,
   'main':{first:()=>main},
 })[selector]||{length:0};
}
const items=[{id:'pearl-belt',name:'Pearl Belt',image:'assets/pearl.png',price:'2750',categoryId:'jewellery',collectionIds:['adorned-acc'],relatedLookIds:['SH-SUNSHINE'],visible:true},
{id:'red-bag',name:'Red Bag',image:'https://example.com/bag.png',price:'AED 150',categoryId:'bags',collectionIds:['day-edit'],visible:true},
{id:'hidden',name:'Hidden',image:'assets/hidden.png',categoryId:'bags',visible:false}];
const categories=[{id:'jewellery',name:'Jewellery',visible:true,image:'assets/cover.png'},{id:'bags',name:'Bags',visible:true}];
const collections=[{id:'adorned-acc',name:'Adorned Accessories',type:'accessories',visible:true},{id:'day-edit',name:'Day Edit',type:'accessories',visible:true},{id:'the-curve-edit',name:'The Curve Edit',type:'clothing',visible:true}];
const products=[{id:'SH-SUNSHINE',title:'Sunshine',slug:'sh-sunshine',visible:true,accessories:[{name:'Vintage Ring',image:'assets/ring.png',price:'1000'}]}];
patchAccessoryCatalogue(mockDom(landing),{slug:'accessories'},{products,accessories:items,categories,collections});
assert.equal(landing.heading,'Accessories');
assert.match(landing.gallery,/Pearl Belt/);assert.match(landing.gallery,/Red Bag/);
assert.match(landing.gallery,/Vintage Ring/,'legacy accessory still appears on landing');
assert.doesNotMatch(landing.gallery,/>Hidden</);
assert.match(landing.gallery,/\u20b92,750/);
assert.match(landing.gallery,/AED 150/);
assert.match(landing.gallery,/\/accessories\/pearl-belt/);
assert.match(landing.inserts.join(''),/\/accessories\/collections\/adorned-acc/);
assert.match(landing.inserts.join(''),/\/accessories\/category\/jewellery/);
assert.doesNotMatch(landing.inserts.join(''),/>The Curve Edit</,'clothing collections cannot appear in accessories');
const filtered={heading:'',description:'',gallery:'',inserts:[],main:''};
patchAccessoryCatalogue(mockDom(filtered),{slug:'accessories'},{products,accessories:items,categories,collections,activeCollection:collections[0]});
assert.equal(filtered.heading,'Adorned Accessories');assert.match(filtered.gallery,/Pearl Belt/);assert.doesNotMatch(filtered.gallery,/Red Bag|Vintage Ring/);
const catFiltered={heading:'',description:'',gallery:'',inserts:[],main:''};
patchAccessoryCatalogue(mockDom(catFiltered),{slug:'accessories'},{products,accessories:items,categories,collections,activeCategory:categories[1]});
assert.equal(catFiltered.heading,'Bags');assert.match(catFiltered.gallery,/Red Bag/);assert.doesNotMatch(catFiltered.gallery,/Pearl Belt/);
const detail={heading:'',description:'',gallery:'',inserts:[],main:''};
patchAccessoryCatalogue(mockDom(detail),{slug:'accessories'},{products,accessories:items,categories,collections,activeAccessory:items[0]});
assert.match(detail.main,/Pearl Belt/);assert.match(detail.main,/\u20b92,750/);
assert.match(detail.main,/\/contact\?interest=Accessories/);
assert.match(detail.main,/\/look\/sunshine/,'related clothing link uses canonical URL, not legacy SKU');
assert.match(detail.main,/\/assets\/pearl.png/,'nested URLs must use absolute asset paths');
const escape={heading:'',description:'',gallery:'',inserts:[],main:''};
patchAccessoryCatalogue(mockDom(escape),{slug:'accessories'},{accessories:[{id:'safe',name:'<script>alert(1)</script>',image:'assets/safe.png',visible:true}],categories:[],collections:[]});
assert.doesNotMatch(escape.gallery,/<script>/,'customer-facing content must be escaped');
assert.match(escape.gallery,/&lt;script&gt;/);
console.log('PASS v1.19.3: catalogue landing, collection/category filtering, legacy coexistence, priced accessory detail, related looks, nested assets and HTML escaping.');
