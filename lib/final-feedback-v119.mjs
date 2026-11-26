import {pageSeed} from '@/lib/seed';
import {load as loadHtml} from 'cheerio';
// Client-approved final website corrections, 25 November 2026.
// All transformations run after existing CMS field/section patches so that
// previously published Firestore pages receive the updated structure too.
const h=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const image=s=>/^(https:\/\/|\/|assets\/)/i.test(String(s||''))&&!/[<>]/.test(s)?String(s):'';
const copy=(p,id,fallback)=>h(p?.patches?.[id]?.visible===false?'':p?.patches?.[id]?.value??fallback);
const val=(p,id,fallback,tag='span')=>`<${tag} data-cms-text-refs="${id}"><!--cms:${id}-->${copy(p,id,fallback)}<!--/cms:${id}--></${tag}>`;
const show=group=>group==='Gowns'?'Statement Outfits':group;
const price=value=>{const s=String(value??'').trim();return /^\d+(?:\.\d{1,2})?$/.test(s)?'₹'+Number(s).toLocaleString('en-IN',{maximumFractionDigits:2}):s;};
function linkMenu($){
 const links=[['Homepage','/'],['Collection','/collections'],['Saved Looks','#saved'],['Accessories','/accessories'],['Bespoke','/bespoke'],['Styling Services','/styling-services'],['Fashion Film','/film'],['Our Story','/story'],['Testimonials','/testimonials'],['Our Contact','/contact'],['Enquire / Book Your Appointment','/appointment']];
 const nav=$('#mobile-menu');
 if(nav.length){
  nav.children('a,button').remove();
  nav.append(links.map(([label,href],i)=>href==='#saved'?`<button type="button" data-open-saved="" aria-label="Saved Looks">${label}<small>${String(i+1).padStart(2,'0')}</small></button>`:`<a href="${href}">${h(label)}<small>${String(i+1).padStart(2,'0')}</small></a>`).join(''));
 }
 // Desktop header and footer use the same destinations as the final menu.
 $('.nav-right a').each((_,node)=>{if($(node).text().includes('Styling Services'))$(node).attr('href','/styling-services')});
 $('.footer-grid a').each((_,node)=>{let a=$(node);if(a.text().includes('Styling Services'))a.attr('href','/styling-services')});
 const footer=$('.footer-grid .footer-col').last();
 if(footer.length&&!footer.find('.v119-appointment-nav').length)footer.prepend('<a class="v119-appointment-nav" href="/appointment">Book Your Appointment ↗</a>');
 if(footer.length&&!footer.find('.v119-accessories-nav').length)footer.prepend('<a class="v119-accessories-nav" href="/accessories">Accessories ↗</a>');
}
function whatsapp($,settings){
 const raw=String(settings?.contact?.whatsapp||'').trim();const digits=raw.replace(/\D/g,'');
 // A verified number must be configured in Global Settings. Never invent one.
 if(digits.length<10||digits.length>15)return;
 const href='https://wa.me/'+digits;
 if(!$('.v119-whatsapp').length)$('.footer-grid .footer-col').last().append(`<a class="v119-whatsapp" href="${href}" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>`);
}
function bookingCallout(service){return `<section class="v119-booking-cta" aria-label="Book Your Appointment"><div class="v119-wrap"><p class="v119-eyebrow">A PERSONAL CONVERSATION</p><h2>Book Your Appointment</h2><p>Choose a preferred date and time for a conversation with the SHANERYN studio.</p><a class="v119-btn" href="/appointment?service=${encodeURIComponent(service)}">BOOK YOUR APPOINTMENT ↗</a><small>Appointment requests are subject to confirmation by the studio.</small></div></section>`}
function finalQuote(page){return `<section class="v119-final-quote" aria-label="SHANERYN signature message"><div class="v119-quote-inner">${val(page,'f119-quote-small','Clothes To Empower','span')}${val(page,'f119-quote-main','Effortless movement','h2')}${val(page,'f119-quote-last','for fun celebrations','p')}</div></section>`}
function finalHomepage($){
 const grid=$('.occasion-ref-grid').first(),cta=$('.occasion-ref-all').first();
 if(grid.length&&cta.length){cta.addClass('v119-after-looks');grid.after(cta)}
 $('.occasion-ref-title h2').each((_,node)=>{if(/THE CURVE EDIT/i.test($(node).text()))$(node).text('COLLECTION')});
 // Avoid distorting the original approved homepage closure copy; only its hierarchy is tuned in CSS.
}
function finalCollections($,page,curated){
 $('.collection-hero-copy>.eyebrow').first().text('COLLECTION / SHANERYN');
 $('.collection-hero-copy>p').first().remove();
 $('.collections-top .eyebrow').first().text('EXPLORE THE LOOKS');
 $('.collections-top h2').first().text('Live in Luxury');
 $('.collections-top #look-count').attr('aria-live','polite');
 $('#occasion-filter').remove();
 $('.collection-hero .eyebrow').each((_,n)=>{if(/THE CURVE EDIT/i.test($(n).text()))$(n).text('COLLECTION / SHANERYN')});
 $('.filter-btn[data-category="Gowns"]').attr('data-category','Statement Outfits').text('Statement Outfits');
 $('.v51-text-band,.ep-wide-quote').remove();
 $('.cms-curated-showcase .cms-curated-name small').each((_,n)=>{if(/^(explore edit|discover collection)/i.test($(n).text().trim()))$(n).text('Explore All Looks ↗')});
 // The dynamically generated curated collection cards appear before this quote.
 $('.cms-curated-showcase .cms-curated-name strong').each((_,n)=>{if(/THE CURVE EDIT/i.test($(n).text()))$(n).text('COLLECTION')});
 // Card caption is editable through Page Manager (f00245), with the approved default.
 $('.cms-curated-showcase .cms-curated-name small').each((_,node)=>{if(/^(explore edit|discover collection)/i.test($(node).text().trim()))$(node).text('Explore All Looks ↗')});
 // A selected curated collection is a listing too and gets the same final signature.
 $('main').first().append(finalQuote(page));
}
function finalCategory($,page){
 $('.ep-collection-hero .ep-kicker,.ep-collection-hero .eyebrow').first().text('COLLECTION / SHANERYN');
 $('#edit-grid-title').text('Live in Luxury');
 $('.ep-collection-hero a[href*="collections"]').each((_,n)=>{if(/Explore/i.test($(n).text()))$(n).text('Explore All Looks ↗')});
 $('.ep-collection-hero p').first().remove();
 $('.ep-wide-quote').remove();
 $('main').first().append(finalQuote(page));
}
function finalLook($,page){
 $('.ld-interlude').replaceWith(finalQuote(page));
 $('.ld-gallery-intro span').first().text('COLLECTION');
 $('.ld-sticky-kicker').text('COLLECTION / SHANERYN');
 $('.ep-related h2').each((_,n)=>{if(/Discover/i.test($(n).text()))$(n).text('Explore other looks.')});
}
function finalBespoke($,page){
 $('#bespoke-heading em').removeAttr('style').addClass('v119-upright');
 // Styling Services now has its own page, not a second service catalogue inside Bespoke.
 $('#services').remove();
 $('.v69-bespoke-shortcuts a[href="#services"]').attr('href','/styling-services').text('Styling Services');
 $('#v49-measure-mode-help').text('Select your garment type. Enter the measurements shown for that silhouette.');
 $('.cv3-measurement .cv3-measure-wrap > p').first().text('Select your garment type. Enter the measurements shown for that silhouette.');
 const studioSteps=[
 ['Book an appointment','Choose a time that suits you.'],
 ['Consultation','Share your occasion, ideas and inspiration with our designer.'],
 ['Measurements','We take your measurements in person for a precise fit.'],
 ['Fabric & design','Select fabrics, embellishments and finishes in the studio.'],
 ['Fittings','Try on your piece and fine-tune it until it feels just right.'],
 ['Collection','Pick up your finished piece from the studio.']];
 const onlineSteps=[
 ['Send an enquiry','Tell us about your occasion and what you have in mind.'],
 ['Virtual consultation','Meet our designer over a video call.'],
 ['Measurements','We guide you step by step to take your measurements at home.'],
 ['Design approval','We share sketches, fabric swatches and details for your approval.'],
 ['Crafting','Your piece is made in our atelier.'],
 ['Delivery','Your finished piece is shipped to your door.']];
 const makeSteps=(steps,section)=>'<ol>'+steps.map(([title,body],i)=>`<li><strong>${val(page,`f119-${section}-step-${i+1}-title`,title)}</strong><span>${val(page,`f119-${section}-step-${i+1}-description`,body)}</span></li>`).join('')+'</ol>';
 const two=`<section class="v119-bespoke-journeys" data-cms-section="s-004" id="ways-to-work" aria-label="Two ways to work with us"><div class="v119-wrap"><p class="v119-eyebrow">BESPOKE / YOUR WAY</p>${val(page,'f119-bespoke-ways-title','Two Ways to Work With Us','h2')}<div class="v119-journey-grid"><article class="v119-journey-card"><p class="v119-eyebrow">01 / THE STUDIO</p><h3>In-Studio Bespoke</h3><p>How it works</p>${makeSteps(studioSteps,'studio')}<a href="/appointment?service=Bespoke&mode=studio" class="v119-btn">${val(page,'f119-studio-button','Book a Studio Appointment ↗')}</a></article><article class="v119-journey-card"><p class="v119-eyebrow">02 / FROM ANYWHERE</p><h3>Online Bespoke</h3><p>How it works</p>${makeSteps(onlineSteps,'online')}<a href="/contact?interest=Bespoke%20Online" class="v119-btn v119-outline">${val(page,'f119-online-button','Enquire for Online Bespoke ↗')}</a></article></div></div></section>`;
 const target=$('#measurement-studio');
 if(target.length){target.before(two);
  if(page.sectionSettings?.['s-004']?.visible===false)$('#ways-to-work').attr('style','display:none!important');
  const form=$('#cv3-measure-form');
  if(form.length){
   // The illustrated guide was supplied by the client on slide 9.
   form.before(`<details class="v119-measuring-guide"><summary>HOW TO MEASURE YOURSELF <span>View measuring guide +</span></summary><img src="/assets/shaneryn-how-to-measure.png" loading="lazy" alt="Illustrated guide to measuring height, chest, bust, waist, hip, shoulder, armhole, sleeve length and garment length" /></details><p class="v119-inches-rule"><strong>Measurements in INCHES (in)</strong><span>Enter all measurements in inches (in).</span></p>`);
   form.find('.ep-smallnote').first().remove();
   form.find('button[type=submit]').first().text('REVIEW MEASUREMENTS ↗');
   const details=`<div class="v119-bespoke-customer"><p class="v119-eyebrow">DETAILS</p><div class="v119-contact-fields"><label>Name *<input id="v119-bespoke-name" type="text" autocomplete="name" maxlength="120" required></label><label>Email *<input id="v119-bespoke-email" type="email" autocomplete="email" maxlength="254" required></label><label>Phone number<input id="v119-bespoke-phone" type="tel" autocomplete="tel" maxlength="35"></label></div><label class="v119-wide">OCCASION WEAR / YOUR SILHOUETTE<textarea id="v119-bespoke-occasion" rows="3" maxlength="500" placeholder="Describe the garment or silhouette you have in mind"></textarea></label><label class="v119-wide">SELECT LOOK / REFERENCE<input id="v119-bespoke-reference" type="text" maxlength="160" placeholder="Add a look reference, if any"></label><label class="v119-wide">Tell us about your occasion, style or requirements<textarea id="v119-bespoke-requirements" rows="4" maxlength="1600" placeholder="Tell the studio what you have in mind"></textarea></label><button class="v119-btn" type="button" id="v119-bespoke-submit">SUBMIT YOUR MEASUREMENTS ↗</button><p id="v119-bespoke-status" role="status" aria-live="polite"></p></div>`;
   form.after(details);
  }
 }
 // An actual appointment form is available here, not merely a navigation button.
 try{
  const template=loadHtml(pageSeed('contact').bodyHtml,{decodeEntities:false},false);
  const formSection=template('#book-appointment').first().clone();
  formSection.attr('data-cms-section','s-005');
  // The Contact template initially hides the appointment tab. Bespoke embeds
  // the form as a standalone section, so it must be visible by default.
  formSection.removeAttr('hidden').removeAttr('aria-hidden').removeAttr('data-v69-contact-panel');
  formSection.find('#v67-book-title').text('Book Your Appointment');
  formSection.find('#v67-book-service').empty().append('<option value="Bespoke" selected>Bespoke</option>');
  if(!formSection.find('[name=lookReference]').length)formSection.find('#v67-book-submit').first().before('<div class="v119-appointment-references"><label>SELECT LOOK / REFERENCE<input name="lookReference" type="text" maxlength="160" placeholder="Add a look reference, if any"></label><label>Tell us about your occasion, style or requirements<textarea name="requirements" rows="3" maxlength="1600" placeholder="Share what you have in mind"></textarea></label></div>');
  formSection.addClass('v119-bespoke-booking');
  if(page.sectionSettings?.['s-005']?.visible===false)formSection.attr('style','display:none!important');
  $('#past-work').after(formSection);
 }catch(error){console.error('[SHANERYN][CLIENT_FINAL_BESPOKE_BOOKING]',error?.message||error);$('#past-work').after(bookingCallout('Bespoke'));}

}
function finalContact($,page){
 const form=$('#ep-contact-form');
 if(form.length){
  // Eliminate duplicated or overly prescriptive questions from the client journey.
  form.find('#contact-garment').closest('label').remove();
  form.find('.v51-interest-chooser').find('legend').first().text('SELECT YOUR SERVICES');
  form.find('label').each((_,n)=>{if(/What brings you here\?/i.test($(n).text()))$(n).contents().filter((_,child)=>child.type==='text').first().replaceWith('Select your services ')});
  const select=$('#contact-interest');if(select.length){select.empty();select.append('<option value="">Select your service</option>');for(const service of ['Bespoke','Color Analysis','Personal Styling','Occasion Styling'])select.append(`<option value="${h(service)}">${h(service)}</option>`)}
  if(!form.find('[name="lookReference"]').length){form.find('#ep-contact-submit').first().before('<label>SELECT LOOK / REFERENCE<input type="text" name="lookReference" placeholder="Add a look reference, if any" maxlength="160"></label>')}
 }
 const book=$('#book-appointment');if(book.length){
  book.find('#v67-book-title').first().text('Book Your Appointment');
  book.find('#v67-book-service').first().empty().append('<option value="">Select your service</option>'+['Bespoke','Color Analysis','Personal Styling','Occasion Styling'].map(s=>`<option value="${s}">${s}</option>`).join(''));
  const selected=book.find('#v67-book-mode');selected.find('option').each((_,n)=>{if(/Video consultation/i.test($(n).text()))$(n).text('Online video consultation')});
  if(!book.find('[name=lookReference]').length)book.find('#v67-book-submit').first().before('<div class="v119-appointment-references"><label>SELECT LOOK / REFERENCE<input name="lookReference" type="text" maxlength="160" placeholder="Add a look reference, if any"></label><label>Tell us about your occasion, style or requirements<textarea name="requirements" rows="3" maxlength="1600" placeholder="Share what you have in mind"></textarea></label></div>');
 }
}
function accessories($,products){
 const out=[];for(const p of products){if(p.visible===false)continue;for(const a of p.accessories||[]){if(a.visible===false||!image(a.image))continue;out.push(`<article class="v119-accessory"><a href="/look/${encodeURIComponent(p.slug||p.id.toLowerCase())}"><img loading="lazy" src="${h(image(a.image))}" alt="${h(a.name||'SHANERYN accessory')}"/></a><h3>${h(a.name||'Accessory')}</h3>${a.price?`<p class="v119-accessory-price">${h(price(a.price))}</p>`:''}<p>Styled with ${h(p.title)}</p></article>`)}}
 $('#v119-accessory-gallery').html(out.length?out.join(''):'<div class="v119-empty-accessories"><h2>Accessories, thoughtfully considered.</h2><p>Our studio is curating these finishing details. Enquire if you have a specific look in mind.</p><a href="/contact?interest=Accessories" class="v119-btn">ENQUIRE ABOUT ACCESSORIES ↗</a></div>');
}
function finalStyleNames($,products,page,activeProductId){
 const active=products.find(p=>p.id===activeProductId);
 if(active&&page.slug==='look')$('#detail-code').text(active.styleNumber||active.id);
 if(page.slug==='collections'||page.slug==='collection'){
  // Browser card renderers also use styleNumber; do not alter immutable p.id.
  $('.look-card').each((_,node)=>{let code=$(node).find('.ep-card-caption p').first();if(code.length){const found=products.find(p=>p.id===code.text());if(found)code.text(found.styleNumber||found.id)}});
 }
}
export function applyFinalFeedback($,page,products,settings,curatedCollections=[],activeProductId=null){
 linkMenu($);whatsapp($,settings);
 if(page.slug==='index')finalHomepage($);
 if(page.slug==='bespoke')finalBespoke($,page);
 if(page.slug==='collections')finalCollections($,page,curatedCollections);
 if(page.slug==='collection')finalCategory($,page);
 if(page.slug==='look')finalLook($,page);
 if(page.slug==='contact')finalContact($,page);
 if(page.slug==='styling-services')$('#v67-book-title').first().text('Select a Service & Book Your Appointment');
 if(page.slug==='appointment')$('#v67-book-title').first().text('Book Your Appointment');
 // The Contact page uses hidden tabs; dedicated pages do not. Without this
 // correction /appointment and /styling-services render a blank booking area.
 if(page.slug==='appointment'||page.slug==='styling-services'){
  const book=$('#book-appointment').first();
  const sectionId=page.slug==='appointment'?'s-001':'s-002';
  if(book.length && page.sectionSettings?.[sectionId]?.visible!==false){
   book.removeAttr('hidden').removeAttr('aria-hidden').removeAttr('data-v69-contact-panel');
  }
 }
 if(page.slug==='accessories')accessories($,products);
 finalStyleNames($,products,page,activeProductId);
}
