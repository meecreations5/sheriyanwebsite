import 'server-only';
import {load as loadHtml} from 'cheerio';
import {productPath,findProductByLegacyId} from '@/lib/product-paths';
import {normalizeProductDetails} from '@/lib/product-details.mjs';
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeImage=v=>{const x=String(v||'');return (/^(https:\/\/|\/|assets\/|data:image\/)/i.test(x)&&!/[<>]/.test(x))?x:''};
const safeUrl=v=>{const x=String(v||'').trim();return /^(https?:\/\/|mailto:|tel:|\/|#|[a-z0-9][\w/-]*\.html(?:[?#].*)?)/i.test(x)&&!/[<>]/.test(x)?x:'#'};
function attrCSS($el,hidden){if(hidden){$el.attr('aria-hidden','true').attr('style',(($el.attr('style')||'').replace(/display\s*:[^;]+;?/gi,'')+';display:none!important;'))}else{$el.removeAttr('aria-hidden')}}
function normalized(patches,id){const value=patches?.[id];return value&&typeof value==='object'?value:null}
function patchFields($,page){
 const patches=page.patches||{};
 const cmsComments=[];
 $.root().find('*').contents().each((_,node)=>{if(node.type==='comment'&&String(node.data).startsWith('cms:'))cmsComments.push(node)});
 for(const node of cmsComments){const id=String(node.data).slice(4);const patch=normalized(patches,id);if(!patch)continue;if(node.next&&node.next.type==='text')node.next.data=patch.visible===false?'':String(patch.value??'');const parent=$(node.parent);if(parent.length&&(patch.fontSize||patch.textAlign||patch.fontWeight)){const style=parent.attr('style')||'';const additions=[];if(patch.fontSize)additions.push('font-size:'+Number(patch.fontSize)+'px');if(patch.textAlign)additions.push('text-align:'+patch.textAlign);if(patch.fontWeight)additions.push('font-weight:'+Number(patch.fontWeight));parent.attr('style',style+';'+additions.join(';'))}}
 for(const field of page.fields||[]){if(field.kind==='text')continue;const patch=normalized(patches,field.id);if(!patch)continue;
  const selector=`[data-cms-${field.kind.replaceAll('-','_')}="${field.id}"]`;
  const el=$(selector);if(!el.length)continue;
  if(field.kind==='visibility'){attrCSS(el,patch.visible===false||patch.value===false);continue}
  if(patch.visible===false){if(field.kind==='placeholder')el.attr('placeholder','');else attrCSS(el,true);continue}
  const val=String(patch.value??field.value);
  if(field.kind==='background'){const img=safeImage(val);if(img){const style=el.attr('style')||'';el.attr('style',/background-image\s*:[^;]+/i.test(style)?style.replace(/background-image\s*:[^;]+/i,`background-image:url('${img.replace(/'/g,'%27')}')`):style+`;background-image:url('${img.replace(/'/g,'%27')}')`)}}
  else if(field.kind==='href')el.attr('href',safeUrl(val));
  else if(field.kind==='src')el.attr('src',safeImage(val)||field.value);
  else if(['aria-label','placeholder','title','alt'].includes(field.kind))el.attr(field.kind,val);
 }
}
function patchSections($,page){
 const state=page.sectionSettings||{};
 for(const s of page.sections||[]){const sec=$(`[data-cms-section="${s.id}"]`).first();if(!sec.length)continue;if(state[s.id]?.visible===false)attrCSS(sec,true)}
 // Sort only direct main children. Nested forms/sections retain the approved composition.
 const main=$('main').first();
 const direct=main.children('section[data-cms-section]').toArray();
 if(direct.length>1&&direct.some(el=>state[$(el).attr('data-cms-section')]?.order!=null)){
  const ordered=direct.map((el,i)=>({el,i,order:Number(state[$(el).attr('data-cms-section')]?.order??i)})).sort((a,b)=>a.order-b.order||a.i-b.i);
  // Move sections in their existing slot by replacing each original section with an ordered counterpart.
  const markers=direct.map(el=>({marker:$('<div data-cms-sort-placeholder="1"></div>'),el}));
  markers.forEach(({marker,el})=>$(el).before(marker));
  // Cheerio supports remove(), not jQuery detach(). The original nodes can
  // still be reinserted into the marker positions below, preserving content.
  direct.forEach(el=>$(el).remove());
  markers.forEach(({marker},i)=>{marker.replaceWith(ordered[i].el)});
 }
}
function blockHtml(block){
 const title=escapeHtml(block.heading||'New Section'),copy=escapeHtml(block.body||'');
 const media=safeImage(block.image||'');const link=safeUrl(block.href||'contact.html');const label=escapeHtml(block.buttonText||'ENQUIRE');
 const id=escapeHtml(block.id||'section');
 if(block.type==='gallery'){const images=(block.images||[]).slice(0,24).map(src=>`<img alt="SHANERYN gallery photograph" loading="lazy" src="${escapeHtml(safeImage(src))}"/>`).join('');return `<section id="${id}" class="cms-new-section cms-gallery"><span class="eyebrow">THE ARCHIVE</span><h2>${title}</h2><div class="cms-gallery-grid">${images}</div></section>`}
 if(block.type==='cards'){return `<section id="${id}" class="cms-new-section"><span class="eyebrow">THE EDIT</span><h2>${title}</h2><div class="cms-new-cards">${(block.cards||[]).slice(0,12).map(c=>`<article><h3>${escapeHtml(c.title||'')}</h3><p>${escapeHtml(c.text||'')}</p></article>`).join('')}</div></section>`}
 if(block.type==='faq'){return `<section id="${id}" class="cms-new-section"><h2>${title}</h2>${(block.cards||[]).slice(0,20).map(c=>`<details><summary>${escapeHtml(c.title||'Question')}</summary><p>${escapeHtml(c.text||'')}</p></details>`).join('')}</section>`}
 if(block.type==='split'){return `<section id="${id}" class="cms-new-section cms-split"><div>${media?`<img src="${escapeHtml(media)}" alt="SHANERYN editorial"/>`:''}</div><div><span class="eyebrow">SHANERYN</span><h2>${title}</h2><p>${copy}</p><a class="outlined-btn" href="${escapeHtml(link)}">${label}</a></div></section>`}
 return `<section id="${id}" class="cms-new-section cms-text-block"><span class="eyebrow">SHANERYN</span><h2>${title}</h2><p>${copy}</p><a class="outlined-btn" href="${escapeHtml(link)}">${label}</a></section>`;
}
function patchSite($,settings){
 const {contact={},branding={}}=settings||{};
 const mail=String(contact.email||'').trim();
 if(mail&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)){
  $('a[href^="mailto:"],a[data-v67-contact-email-link]').attr('href','mailto:'+mail);
  $('a[href^="mailto:"]').each((_,el)=>{const e=$(el);if(e.text().includes('@'))e.text(mail)})
 }
 if(branding.logo&&safeImage(branding.logo))$('img.logo-original').attr('src',branding.logo);
}
function patchForms($,formConfigs){
 const forms=[['enquiry','#ep-contact-form','.ep-contact-actions'],['appointment','#v67-appointment-form','.v67-book-actions']];
 for(const [kind,selector,actionsSelector] of forms){
  const form=$(selector);if(!form.length)continue;
  const def=formConfigs?.[kind];if(!def)continue;
  for(const field of def.fields||[]){
   const control=form.find(`[name="${field.name}"]`).first();
   if(!control.length){if(field.visible!==false){const attr=['text','email','tel','date','time','number'].includes(field.type)?field.type:'text';const opts=(field.options||[]).map(s=>`<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');let input=field.type==='select'?`<select name="${escapeHtml(field.name)}" ${field.required?'required':''}><option value="">Select</option>${opts}</select>`:field.type==='textarea'?`<textarea name="${escapeHtml(field.name)}" ${field.required?'required':''}></textarea>`:`<input type="${attr}" name="${escapeHtml(field.name)}" ${field.required?'required':''}/>`;form.find(actionsSelector).first().before(`<label class="cms-extra-field">${escapeHtml(field.label)}${field.required?' *':''}${input}</label>`) }continue}
   let label=control.closest('label');if(!label.length)label=control.parent('label');
   if(field.visible===false){attrCSS(label.length?label:control,true);control.removeAttr('required');continue}
   if(field.required)control.attr('required','required');else control.removeAttr('required');
   // Label text nodes change without losing nested inputs, fields or class styling.
   if(label.length){const first=label.contents().toArray().find(n=>n.type==='text'&&n.data.trim());if(first)first.data=String(field.label||field.name)+(field.required?' *':' ')}
   if(field.type==='select'&&Array.isArray(field.options)&&control.is('select')){const previous=control.find('option').first().text();control.empty();control.append('<option value="">'+escapeHtml(previous||'Please select')+'</option>');for(const opt of field.options.slice(0,60))control.append(`<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`)}
  }
  if(kind==='appointment'){
   form.find('.ep-smallnote').first().text('This sends an appointment request to the studio. Your preferred time is not confirmed until the studio accepts it.');
   form.find('#v67-book-submit').html('SEND APPOINTMENT REQUEST <span aria-hidden="true">↗</span>');
  }else{
   form.find('#v49-contact-clarity').text('Your enquiry will be sent securely to the SHANERYN team. We will contact you using the details you provide.');
   form.find('.ep-smallnote').first().text('Your request is saved securely and reviewed by the SHANERYN studio team.');
   form.find('#ep-contact-submit').html('SEND ENQUIRY <span aria-hidden="true">↗</span>');
  }
  form.append('<input aria-hidden="true" autocomplete="off" class="cms-honeypot" name="website" tabindex="-1" type="text"/>');
 }
}
// Extend the approved Bespoke Past Work archive without replacing the original
// photographs or breaking their existing CMS patch IDs and gallery styling.
function patchPastWorkGallery($,page){
 if(page.slug!=='bespoke')return;
 try{
  const grid=$('#past-work .v63-gallery-columns').first();
  if(!grid.length)return;
  const original=grid.children('.v63-work-item').toArray().filter(node=>{
   const button=$(node),img=button.find('img').first();
   return button.attr('aria-hidden')!=='true'&&img.attr('aria-hidden')!=='true';
  });
  const extras=(Array.isArray(page.pastWorkExtras)?page.pastWorkExtras:[])
   .filter(photo=>photo&&typeof photo==='object'&&photo.visible!==false&&safeImage(photo.src));
  const total=original.length+extras.length;
  for(const [index,node] of original.entries()){
   const button=$(node),alt=button.find('img').first().attr('alt')||'Past Work photograph';
   button.attr('data-work-index',String(index));
   button.attr('aria-label',`View past work photograph ${index+1} of ${total}: ${alt}`);
  }
  for(const [index,photo] of extras.entries()){
   const number=original.length+index+1;
   const source=escapeHtml(safeImage(photo.src));
   const alt=escapeHtml(String(photo.alt||'SHANERYN Past Work photograph').trim().slice(0,180));
   const padded=String(number).padStart(2,'0');
   grid.append(`<button class="v63-work-item" type="button" data-work-index="${number-1}" aria-label="View past work photograph ${number} of ${total}: ${alt}"><img src="${source}" alt="${alt}" loading="lazy" decoding="async"/><span class="v63-work-overlay" aria-hidden="true"><span>${padded} / VIEW</span><span>↗</span></span></button>`);
  }
  if(total)$('#v63-work-count').text('01 / '+String(total).padStart(2,'0'));
 }catch(error){
  // The original gallery remains available even if an additional CMS photo is malformed.
  console.error('[SHANERYN][BESPOKE_PAST_WORK_GALLERY]',error?.stack||error);
 }
}
function patchFilmMedia($,page){
 if(page.slug!=='film'||!page.filmMedia?.url)return;
 const url=String(page.filmMedia.url).trim();
 if(/^(https:\/\/|assets\/|\/)/i.test(url)&&!/(?:youtube\.com|youtu\.be)/i.test(url)){
  $('[data-film-motion] source').attr('src',url);
  $('[data-film-motion]').attr('preload','metadata');
 }
}
function patchProducts($,products,settings,visibleCategories){
 const safeProducts=products.filter(p=>p.visible!==false);
 const preferredIds=settings?.home?.featuredProductIds||[];
 const order=new Map(preferredIds.map((id,i)=>[id,i]));
 const featured=(preferredIds.length?safeProducts.filter(p=>order.has(p.id)).sort((a,b)=>order.get(a.id)-order.get(b.id)):safeProducts.filter(p=>p.featured)).slice(0,4);
 const cards=$('.occasion-ref-grid');
 if(cards.length&&featured.length)cards.html(featured.map((p,i)=>`<a class="occasion-ref-card" href="${productPath(p)}" aria-label="Explore ${escapeHtml(p.title)}"><img src="${escapeHtml(safeImage(p.catalogueImg)||safeImage(p.img))}" alt="${escapeHtml(p.title)} studio catalogue photograph" loading="lazy" decoding="async"/><span class="occasion-ref-copy"><span class="occasion-ref-name"><small>${String(i+1).padStart(2,'0')} / ${escapeHtml(p.cat||'LOOK')}</small><strong>${escapeHtml(p.title)}</strong></span><span class="occasion-ref-arrow">↗</span></span></a>`).join(''));
 const best=safeProducts.find(p=>p.id===settings?.home?.bestSellerId)||safeProducts.find(p=>p.bestSeller);
 if(best){
  // Selecting a Best Seller changes its product destination ONLY.
  // The photograph, alternative text and caption belong to the Homepage Best Seller section
  // and are edited independently via Page Manager (including its uploaded image patch).
  const link=productPath(best);
  $('.best-seller-image,.best-seller-text .underline-link').attr('href',link);
 }
 const filters=$('.filters');if(filters.length){const allowed=Array.isArray(visibleCategories)?new Set(visibleCategories.map(c=>c.name)):null;const cats=[...new Set(safeProducts.map(p=>p.cat).filter(c=>c&&(!allowed||allowed.has(c))))];filters.find('[data-category]').remove();filters.prepend([`<button type="button" class="filter-btn" data-category="All" aria-pressed="true">All Looks</button>`,...cats.map(c=>`<button type="button" class="filter-btn" data-category="${escapeHtml(c)}" aria-pressed="false">${escapeHtml(c)}</button>`)].join(''))}
}
// This showcase is appended dynamically, so it is not part of the original
// editable seed HTML. Its text fields are nevertheless normal Page Manager
// patches saved on cms_pages/collections and rendered with the same markers
// as other CMS text (including the live iframe preview).
function patchCuratedCollections($,collections,active,page){
 if(active){
  $('.collection-hero h1').first().text(active.name||'The Collection');
  $('.collection-hero p').first().text(active.description||'Discover this curated SHANERYN edit.');
  $('.collections-top h2').first().text('The edit.');
  if(safeImage(active.image))$('.collection-hero-image').first().attr('src',safeImage(active.image));
  return;
 }
 const available=(collections||[]).filter(c=>c.visible!==false);
 if(!available.length)return;
 // Never change the curated collection names or cover photos here. They are
 // already editable through the CMS Collections module.
 const fieldText=(id,fallback)=>{
  const patched=normalized(page?.patches,id);
  if(patched?.visible===false)return '';
  const baseline=page?.fields?.find(f=>f.id===id);
  return escapeHtml(patched?.value??baseline?.value??fallback);
 };
 const actionText=fieldText('f00245','Explore edit ↗');
 const cards=available.slice(0,24).map(c=>{
  const image=safeImage(c.image),name=escapeHtml(c.name||'The Edit');
  return `<a class="cms-curated-card" href="/collections/${escapeHtml(c.id)}">${image?`<img src="${escapeHtml(image)}" loading="lazy" alt="${name} collection photograph"/>`:''}<span class="cms-curated-name"><strong>${name}</strong><small data-cms-text-refs="f00245"><!--cms:f00245-->${actionText}<!--/cms:f00245--></small></span></a>`;
 }).join('');
 const block=`<section class="cms-curated-showcase"><div class="wrap"><span class="eyebrow" data-cms-text-refs="f00242"><!--cms:f00242-->${fieldText('f00242','CURATED BY SHANERYN')}<!--/cms:f00242--></span><h2 data-cms-text-refs="f00243"><!--cms:f00243-->${fieldText('f00243','Our Collections.')}<!--/cms:f00243--></h2><p data-cms-text-refs="f00244"><!--cms:f00244-->${fieldText('f00244','Explore considered edits for every occasion.')}<!--/cms:f00244--></p><div class="cms-curated-grid">${cards}</div></div></section>`;
 const anchor=$('.collections-main').last();if(anchor.length)anchor.after(block);else $('main').first().append(block);
}
// Enforce the client's inches-only measurement policy on both the shipped
// template and previously published Firestore pages. CMS content patches are
// applied first, so an old "Centimetres" option cannot reappear on the site.
function enforceInchesOnlyMeasurements($,page){
 if(page.slug!=='bespoke'&&page.slug!=='look')return;
 $('.cv3-unit-row').each((_,node)=>{
  // Preserve the CMS-editable introductory span and its patch marker.
  const row=$(node);
  row.find('label').remove();
  row.find('input[name="measure-unit"]').remove();
  const fixed=row.find('strong').first();
  if(fixed.length)fixed.text('INCHES (in)');
  else row.append('<strong>INCHES (in)</strong>');
 });
 // Defensive cleanup if the CMS ever contains an additional legacy unit choice.
 $('input[name="measure-unit"]').each((_,node)=>{
  const control=$(node),container=control.closest('label');
  if(container.length)container.remove();else control.remove();
 });
}

// Look Details: render optional structured descriptions directly before Colour Story.
// Older looks without structured details retain their original description.
// The occasion filter (product.occasion) is independent of descriptive occasions.
function renderProductInformation($,page,products,activeProductId){
 if(page.slug!=='look'||!activeProductId)return;
 const product=products.find(p=>p.id===activeProductId&&p.visible!==false);
 if(!product)return;
 // Product tagline moves into the pink eyebrow above the title.
 const headline=$('.ld-title-wrap h1').first();
 const tagline=$('#detail-tagline').first();
 $('.ld-title-wrap>.ep-kicker').remove();
 if(String(product.tagline||'').trim()){
  tagline.text(product.tagline).removeClass('ld-tagline').addClass('ld-small-tagline');
  headline.before(tagline);
 }else tagline.remove();
 // Category sits directly below the product name, not in the specification row.
 const category=$('#detail-category').first();
 if(category.length){
  const previousCell=category.parent();
  category.text(product.cat||'');
  const categoryLine=$('<p class="ld-look-category"></p>').append(category);
  headline.after(categoryLine);previousCell.remove();
 }
 $('#detail-title').text(product.title||'');
 $('#detail-code').text(product.id||'');
 $('#detail-breadcrumb').text(String(product.title||'').toUpperCase());
 // The old colour dot duplicates the detailed Fabric / Occasion information.
 $('.ld-colour').remove();
 // Avoid duplicated static accordions on older published look templates.
 $('.ld-accordions').remove();
 const price=String(product.price??'').trim();
 if(price){
  const safePrice=escapeHtml(price.slice(0,100));
  $('.ld-title-wrap').first().after(`<p class="ld-product-price"><span>PRICE</span><strong>${safePrice}</strong></p>`);
 }
 const details=normalizeProductDetails(product.productDetails);
 const section=(heading,inside)=>`<details class="ld-product-detail-block" open><summary>${heading}<span aria-hidden="true" class="ld-detail-indicator">+</span></summary><div class="ld-product-detail-body">${inside}</div></details>`;
 const paragraph=value=>escapeHtml(value).replace(/\r?\n/g,'<br>');
 const rows=values=>values.map(({garment,description})=>`<div class="ld-product-detail-entry">${garment?`<h3>${escapeHtml(garment)}</h3>`:''}${description?`<p>${paragraph(description)}</p>`:''}</div>`).join('');
 const blocks=[];
 if(details.fabric.length)blocks.push(section('FABRIC',rows(details.fabric)));
 if(details.design.length)blocks.push(section('DESIGN DESCRIPTION',rows(details.design)));
 if(details.embroidery)blocks.push(section('EMBROIDERY &amp; DETAILING',`<p>${paragraph(details.embroidery)}</p>`));
 if(details.occasions.length)blocks.push(section('OCCASION',`<p>${details.occasions.map(escapeHtml).join(' · ')}</p>`));
 if(blocks.length){
  // The previous free-text description often contained concatenated fabric and
  // design notes. Hide it when structured information exists to avoid repeating
  // the same copy; never delete the original field from Firestore or the CMS.
  $('#detail-description').remove();
  const information=`<section class="ld-product-information" aria-label="Product description">${blocks.join('')}</section>`;
  // The approved editorial order is description -> Colour Story -> purchase actions.
  $('.ld-actions').first().before(information);
 }else if(!String(product.description||'').trim()){
  $('#detail-description').remove();
 }
}

export function renderPage(page,products,settings,formConfigs,curatedCollections=[],activeCuratedCollection=null,visibleCategories=[],activeProductId=null){
 const $=loadHtml(page.bodyHtml,{decodeEntities:false},false);
 patchFields($,page);patchSections($,page);
 for(const extra of page.extraSections||[]){if(extra.visible!==false)$('main').first().append(blockHtml(extra))}
 patchSite($,settings);
 patchPastWorkGallery($,page);
 patchFilmMedia($,page);
 patchProducts($,products,settings,visibleCategories);
 // V1.18.16: the client requested NO introductory measurements paragraph.
 // Remove legacy HTML too, in case a previously published page still contains it.
 if(page.slug==='look')$('.ld-made .ld-measure-note').remove();
 renderProductInformation($,page,products,activeProductId);
 if(page.slug==='collections')patchCuratedCollections($,curatedCollections,activeCuratedCollection,page);
 patchForms($,formConfigs);
 enforceInchesOnlyMeasurements($,page);
 // Migrate any product link still stored in original editable CMS markup.
 $('a[href]').each((_,element)=>{
   const a=$(element), href=a.attr('href')||'';
   const match=href.match(/^(?:\/?look(?:\.html)?)\?id=([^&#]+)(?:[&#].*)?$/i);
   if(!match)return;
   let sku;try{sku=decodeURIComponent(match[1].replace(/\+/g,' '))}catch{return}
   const product=findProductByLegacyId(products,sku);
   if(product)a.attr('href',productPath(product));
 });
 return $.root().html();
}
