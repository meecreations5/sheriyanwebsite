import {productPath} from './product-paths.js';
import {accessoryPath,accessoryCollectionPath,accessoryCategoryPath,collectionType,
  accessoryMatchesCollection,visibleAccessories,legacyAccessories} from './catalogue-model.mjs';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const img=v=>{const s=String(v||'').trim();if(!/^(https:\/\/|\/[^/]|assets\/)/i.test(s)||/[<>\s]/.test(s))return '';return s.startsWith('assets/')?'/'+s:s};
const price=v=>{const s=String(v||'').trim();return /^\d+(?:\.\d{1,2})?$/.test(s)?'\u20b9'+Number(s).toLocaleString('en-IN'):s};
const photo=(src,alt,cls='')=>img(src)?`<img class="${cls}" src="${esc(img(src))}" loading="lazy" alt="${esc(alt)}"/>`:'';
function accessoryCard(a){
 const href=accessoryPath(a);
 return `<article class="v119-accessory v1193-accessory-card"><a href="${esc(href)}">${photo(a.image,a.name||'SHANERYN accessory')}</a><div class="v1193-accessory-card-caption"><h3><a href="${esc(href)}">${esc(a.name||'Accessory')}</a></h3>${a.price?`<p class="v119-accessory-price">${esc(price(a.price))}</p>`:''}<a class="v1193-view-link" href="${esc(href)}">VIEW ACCESSORY <span aria-hidden="true">\u2197</span></a></div></article>`;
}
function legacyCard(a){
 const path=productPath({slug:a.sourceLookSlug,id:a.sourceLookId,title:a.sourceLookTitle});
 return `<article class="v119-accessory v1193-accessory-card v1193-legacy"><a href="${esc(path)}">${photo(a.image,a.name||'SHANERYN accessory')}</a><div class="v1193-accessory-card-caption"><h3>${esc(a.name||'Accessory')}</h3>${a.price?`<p class="v119-accessory-price">${esc(price(a.price))}</p>`:''}<p>Styled with ${esc(a.sourceLookTitle||'SHANERYN')}</p><a class="v1193-view-link" href="${esc(path)}">VIEW LOOK <span aria-hidden="true">\u2197</span></a></div></article>`;
}
const empty=()=>'<div class="v119-empty-accessories"><h2>Finishing details, thoughtfully considered.</h2><p>Our studio is preparing this edit. Enquire about pieces or upcoming collections.</p><a class="v119-btn" href="/contact?interest=Accessories">ENQUIRE ABOUT ACCESSORIES</a></div>';
export function patchAccessoryCatalogue($,page,{products=[],accessories=[],categories=[],collections=[],activeCollection=null,activeCategory=null,activeAccessory=null}={}){
 if(page.slug!=='accessories')return;
 const items=visibleAccessories(accessories);
 const catList=categories.filter(c=>c.visible!==false), collList=collections.filter(c=>c.visible!==false&&collectionType(c)==='accessories');
 if(activeAccessory){
  const a=activeAccessory;
  const gallery=[{src:a.image,alt:a.name},...(a.gallery||[])].filter(x=>img(x.src));
  const pics=gallery.map(g=>photo(g.src,g.alt||a.name)).join('');
  const cat=catList.find(c=>c.id===a.categoryId);
  const labels=(a.collectionIds||[]).map(id=>collList.find(c=>c.id===id)).filter(Boolean);
  const related=products.filter(p=>p.visible!==false&&(a.relatedLookIds||[]).includes(p.id));
  const meta=[cat?`<a href="${esc(accessoryCategoryPath(cat))}">${esc(cat.name)}</a>`:'',
    ...labels.map(c=>`<a href="${esc(accessoryCollectionPath(c))}">${esc(c.name)}</a>`)].filter(Boolean).join(' <span aria-hidden="true">/</span> ');
  const lookCards=related.map(p=>`<a class="v1193-related-look" href="${esc(productPath(p))}">${photo(p.catalogueImg||p.img,p.title)}<span>${esc(p.title)}</span></a>`).join('');
  const html=`<main id="main-content" class="v119-standalone v1193-accessory-detail"><div class="v1193-accessory-detail-inner"><nav class="v1193-breadcrumb" aria-label="Breadcrumb"><a href="/accessories">ACCESSORIES</a> / ${esc(a.name)}</nav><div class="v1193-product-detail-grid"><div class="v1193-product-photos">${pics||'<div class="v1193-no-photo">Photograph coming soon</div>'}</div><div class="v1193-product-info"><p class="v119-eyebrow">SHANERYN / ACCESSORIES</p><h1>${esc(a.name)}</h1>${meta?`<div class="v1193-links">${meta}</div>`:''}${a.sku?`<p class="v1193-sku">STYLE: ${esc(a.sku)}</p>`:''}${a.price?`<p class="v1193-price">${esc(price(a.price))}</p>`:''}${a.description?`<p class="v1193-description">${esc(a.description).replace(/\n/g,'<br>')}</p>`:''}<a class="v119-btn" href="/contact?interest=Accessories&amp;lookReference=${encodeURIComponent(a.name)}">ENQUIRE ABOUT THIS ACCESSORY \u2197</a><p class="v1193-note">Personal enquiries only. No online checkout.</p></div></div>${related.length?`<section class="v1193-related"><p class="v119-eyebrow">STYLE IT WITH</p><h2>Related Looks</h2><div class="v1193-related-grid">${lookCards}</div></section>`:''}</div></main>`;
  $('main').first().replaceWith(html);
  return;
 }
 const matching=activeCollection?items.filter(a=>accessoryMatchesCollection(a,activeCollection.id)):activeCategory?items.filter(a=>a.categoryId===activeCategory.id):items;
 const heading=activeCollection?.name||activeCategory?.name||'Accessories';
 const copy=activeCollection?.description||activeCategory?.description||'Discover considered finishing details, curated by the SHANERYN studio.';
 $('.v119-page-intro h1').first().text(heading);
 $('.v119-page-intro>p').last().text(copy);
 const area=$('#v119-accessory-gallery');
 if(!area.length)return;
 const parent=area.closest('.v119-accessories-page');
 if(!activeCollection&&!activeCategory){
  const curated=collList.filter(c=>items.some(a=>accessoryMatchesCollection(a,c.id)));
  if(curated.length){parent.before(`<section class="v1193-accessory-navigation"><div class="v119-wrap"><p class="v119-eyebrow">CURATED ACCESSORY COLLECTIONS</p><h2>Shop by Collection</h2><div class="v1193-collection-cards">${curated.map(c=>`<a class="v1193-collection-card" href="${esc(accessoryCollectionPath(c))}">${photo(c.image||items.find(a=>accessoryMatchesCollection(a,c.id))?.image,c.name)}<span>${esc(c.name)}</span></a>`).join('')}</div></div></section>`)}
  const cats=catList.filter(c=>items.some(a=>a.categoryId===c.id));
  if(cats.length){parent.before(`<nav class="v1193-category-nav" aria-label="Browse accessory categories"><div class="v119-wrap"><span class="v119-eyebrow">BROWSE BY CATEGORY</span><div class="v1193-category-links">${cats.map(c=>`<a class="${img(c.image)?'v1193-category-cover':''}" href="${esc(accessoryCategoryPath(c))}">${photo(c.image,c.name)}<span>${esc(c.name)}</span></a>`).join('')}</div></div></nav>`)}
 }
 if(activeCollection||activeCategory){
  parent.before('<div class="v119-wrap v1193-back"><a href="/accessories">\u2190 ALL ACCESSORIES</a></div>');
 }
 const legacy=(!activeCollection&&!activeCategory)?legacyAccessories(products,matching):[];
 const cards=[...matching.map(accessoryCard),...legacy.map(legacyCard)];
 area.html(cards.length?cards.join(''):empty());
}
