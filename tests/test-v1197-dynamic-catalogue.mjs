import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {findClothingCategory,clothingCategoryPath,normalizeClothingProducts,
 clothingCategoryForProduct,categoryHasLooks,publishedClothingCollections} from '../lib/clothing-catalogue.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const baseline=JSON.parse(read('data/seed/categories.json'));
const categories=[{id:'pant-sets',name:'Wide Leg Sets',visible:true,copy:'New named category',image:'assets/wide-leg.png'},
 {id:'gowns',name:'Statement Outfits',visible:true},
 {id:'cape-sets',name:'Couture Cape Sets',visible:true,copy:'A new collection of cape sets.',image:'assets/cape.png'},
 {id:'hidden-pieces',name:'Hidden Pieces',visible:false}];
const looks=[{id:'SH-SUNSHINE',title:'Sunshine',cat:'Pant Sets',visible:true},
 {id:'SH-STAR',cat:'Gowns',visible:true},
 {id:'SH-CAPE',title:'Couture Cape',cat:'Couture Cape Sets',categoryId:'cape-sets',price:'24500',catalogueImg:'assets/cape-look.png',publicPath:'/look/couture-cape',visible:true},
 {id:'SH-HIDDEN',title:'Hidden Cape',cat:'Hidden Pieces',categoryId:'hidden-pieces',visible:false}];
const normal=normalizeClothingProducts(looks,categories,baseline);
assert.equal(normal[0].cat,'Wide Leg Sets','Seed-era products follow renamed category by ID');
assert.equal(normal[0].categoryId,'pant-sets');
assert.equal(normal[1].cat,'Statement Outfits','Legacy Gowns maps to Statement Outfits');
assert.equal(normal[2].cat,'Couture Cape Sets','New CMS categories have no static list restriction');
assert.equal(looks[0].categoryId,undefined,'Normalization never alters saved product records');
assert.equal(findClothingCategory(categories,'cape-sets').name,'Couture Cape Sets');
assert.equal(clothingCategoryPath(categories[2]),'/category/cape-sets');
assert.equal(clothingCategoryForProduct(normal[2],categories,baseline)?.id,'cape-sets');
assert.ok(categoryHasLooks(categories[2],normal,baseline));
assert.equal(categoryHasLooks(categories[3],normal,baseline),false,'Hidden product not publicly counted');
const curated=[{id:'the-curve-edit',name:'The Curve Edit',type:'clothing',visible:true},
 {id:'the-curve-edit-adorned',name:'The Curve Edit - Adorned',type:'clothing',visible:true},
 {id:'future-edit',name:'Future Edit',type:'clothing',visible:true},
 {id:'accessory-edit',name:'Jewellery Edit',type:'accessories',visible:true},
 {id:'private-edit',name:'Private Edit',type:'clothing',visible:false}];
const membership=[{id:'SH-CAPE',visible:true,collectionIds:['the-curve-edit','the-curve-edit-adorned']},
 {id:'SH-HIDDEN',visible:false,collectionIds:['future-edit']}];
assert.deepEqual(publishedClothingCollections(curated,membership).map(x=>x.id),
 ['the-curve-edit','the-curve-edit-adorned'],'Only visible, populated clothing edits appear publicly');

// Exercise the actual public category-page script with a newly created category.
function previewCategory(definitions,products,slug){
 const elements=Object.fromEntries(['#edit-title','#edit-crumb','#edit-description','#edit-hero-image',
 '#edit-count','#edit-grid-title','#edit-look-grid'].map(id=>[id,{textContent:'',src:'',innerHTML:'',removeAttribute(){this.src=''}}]));
 const document={title:'',querySelector(selector){if(selector==='body[data-page="collection-edit"]')return {};return elements[selector]||null}};
 const window={SHANERYN_LOOKS:products,SHANERYN_CATEGORIES:Object.fromEntries(definitions.map(c=>[c.name,{copy:c.copy||'',image:c.image||''}])),
 SHANERYN_VISIBLE_CATEGORIES:definitions.map(c=>c.name),SHANERYN_CATEGORY_DEFINITIONS:definitions,SHANERYN_ACTIVE_CATEGORY_ID:slug};
 vm.runInNewContext(read('public/editorial-pages.js'),{document,window,
  location:{pathname:'/category/'+slug,search:''},URLSearchParams,decodeURIComponent,encodeURIComponent,console},
  {filename:'editorial-pages.js'});
 return {elements,document};
}
const categoryPreview=previewCategory([categories[2]],[normal[2]],'cape-sets');
assert.equal(categoryPreview.elements['#edit-title'].textContent,'Couture Cape Sets.');
assert.equal(categoryPreview.elements['#edit-description'].textContent,'A new collection of cape sets.');
assert.match(categoryPreview.elements['#edit-look-grid'].innerHTML,/Couture Cape/);
assert.match(categoryPreview.elements['#edit-look-grid'].innerHTML,/₹24,500/);
const emptyPreview=previewCategory([categories[2]],[],'cape-sets');
assert.equal(emptyPreview.elements['#edit-title'].textContent,'Couture Cape Sets.');
assert.match(emptyPreview.elements['#edit-look-grid'].innerHTML,/Collection coming soon/);

const publicCollections=read('public/site.js');
assert.doesNotMatch(publicCollections,/\['Pant Sets','Cropped Pant Sets','Skirt Sets','Tunics','Dresses','Statement Outfits'\]/,
 'The public collections filter must not use a static six-category allowlist');
assert.match(publicCollections,/SHANERYN_CATEGORY_DEFINITIONS/);
assert.match(publicCollections,/\/category\//);
assert.match(read('public/signature-v51.js'),/\/category\//);
assert.match(read('components/LegacyScripts.jsx'),/SHANERYN_ACTIVE_CATEGORY_ID/);
assert.match(read('components/LegacyPage.jsx'),/normalizeClothingProducts/);
assert.match(read('lib/render-page.js'),/publishedClothingCollections/);
assert.match(read('app/sitemap.js'),/categoryHasLooks/);
assert.ok(fs.existsSync(path.join(root,'app/category/[categorySlug]/page.js')));
console.log('PASS V1.19.7: dynamic clothing categories, ID-stable links, renamed legacy products, empty categories, multi-collection publishing, category page and SEO routes.');
