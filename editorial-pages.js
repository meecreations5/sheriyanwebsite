/* SHANERYN editorial pages: shared prototype lookbook and honest request flow. */
(() => {
 'use strict';
 const looks = window.SHANERYN_LOOKS || [];
 const $ = selector => document.querySelector(selector);
 const key = 'shaneryn_demo_saved_looks_v1';
 const cats = ['Pant Sets','Cropped Pant Sets','Skirt Sets','Tunics','Dresses','Gowns'];
 const categories = {
  'Pant Sets':{image:'collection-full/sunshine.webp',copy:'Considered lines and confident proportions. Discover a new perspective on the pant set.'},
  'Cropped Pant Sets':{image:'collection-full/bellona.webp',copy:'A fresh play on proportion, in silhouettes made to feel personal.'},
  'Skirt Sets':{image:'collection-full/starlight.webp',copy:'Ease, elegance and the little details that make a silhouette memorable.'},
  'Tunics':{image:'collection-full/lozen.webp',copy:'Expressive layers and effortless forms, imagined for your individual point of view.'},
  'Dresses':{image:'collection-full/blaze.webp',copy:'An edit that moves with the moment, from quiet statements to the unforgettable.'},
  'Gowns':{image:'collection-full/fire-and-heart.webp',copy:'An occasion calls for expression. Explore silhouettes with presence and possibility.'}
 };
 const saved = () => {try {const ids=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(ids)?ids:[]}catch{return []}};
 const escapeText = s => String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const card = p => `<article class="ep-card"><a href="look.html?id=${encodeURIComponent(p.id)}" aria-label="Explore ${escapeText(p.title)}"><img loading="lazy" src="assets/${escapeText(p.catalogueImg||p.img)}" alt="Full-length SHANERYN look: ${escapeText(p.title)}"></a><div class="ep-card-caption"><div><small>${escapeText(p.cat)}</small><h3><a href="look.html?id=${encodeURIComponent(p.id)}">${escapeText(p.title)}</a></h3><p>${escapeText(p.id)}</p></div><a href="look.html?id=${encodeURIComponent(p.id)}" aria-label="Look details">↗</a></div></article>`;
 const params = new URLSearchParams(location.search);
 if ($('body[data-page="look"]')) {
  const id = params.get('id') || looks[0]?.id;
  const p = looks.find(x=>x.id===id) || looks[0];
  if (p) {
   $('#detail-title').textContent=p.title;$('#detail-breadcrumb').textContent=p.id;
   $('#detail-category').textContent=p.cat;$('#detail-code').textContent=p.id;$('#detail-tone').textContent=p.tone||'On request';
   $('#detail-image').src='assets/'+p.img;$('#detail-image').alt='Illustrative preview: '+p.title;
   $('#detail-crop').src='assets/'+p.img;$('#detail-crop').alt='Editorial crop of '+p.title;
   $('#detail-enquire').href='contact.html?look='+encodeURIComponent(p.id)+'&interest='+encodeURIComponent('Look Details');
   $('#detail-details-request').href=$('#detail-enquire').href;
   $('#detail-related').innerHTML=looks.filter(x=>x.id!==p.id && x.cat===p.cat).concat(looks.filter(x=>x.id!==p.id && x.cat!==p.cat)).slice(0,3).map(card).join('');
   document.title='SHANERYN | '+p.title;
   const b=$('#detail-save');const update=()=>{const active=saved().includes(p.id);b.setAttribute('aria-pressed',String(active));b.innerHTML=active?'♥ &nbsp; Saved look':'♡ &nbsp; Save look';document.querySelectorAll('[data-saved-count]').forEach(el=>el.textContent=String(saved().length));};
   b.addEventListener('click',()=>{const a=saved();const ids=a.includes(p.id)?a.filter(id=>id!==p.id):[...a,p.id];try{localStorage.setItem(key,JSON.stringify(ids))}catch{} update();});update();
  }
 }
 if ($('body[data-page="collection-edit"]')) {
  let category=params.get('category') || cats[0];if(!cats.includes(category))category=cats[0];
  const item=categories[category];$('#edit-title').textContent=category+'.';$('#edit-crumb').textContent=category.toUpperCase();
  $('#edit-description').textContent=item.copy;$('#edit-hero-image').src='assets/'+item.image;$('#edit-hero-image').alt='SHANERYN editorial for '+category;
  const group=looks.filter(p=>p.cat===category);
  $('#edit-count').textContent=`${group.length.toString().padStart(2,'0')} ${group.length===1?'look':'looks'}`;
  const request=$('#v49-category-request');if(request)request.href='contact.html?interest=Collections&look='+encodeURIComponent(category);
  $('#edit-grid-title').textContent='The '+category+' edit.';$('#edit-look-grid').innerHTML=group.length?group.map(card).join(''):'<div class="cv3-empty-category"><span>THE CATEGORY EDIT</span><h3>Collection coming soon.</h3><p>Final garment photography and styles for this category will be added after approval. In the meantime, explore the full lookbook or discuss a personalised design.</p><a class="ep-text-link" href="bespoke.html">Discover bespoke ↗</a></div>';
  document.title='SHANERYN | '+category;
 }
 const form=$('#ep-contact-form');
 if(form){
  const look=params.get('look');const interest=params.get('interest');
  if(look)$('#contact-look').value=look;
  if(interest){const sel=$('#contact-interest');const option=[...sel.options].find(o=>o.value===interest);if(option)sel.value=interest;else {let o=document.createElement('option');o.value=interest;o.textContent=interest;sel.appendChild(o);sel.value=interest;}}
  const status=$('#ep-contact-status');
  const contact=window.SHANERYN_CONTACT||{};
  if(contact.email)$('#ep-contact-submit').innerHTML='Open email draft <span>↗</span>';
  function build(){const d=new FormData(form);return `SHANERYN / REQUEST DETAILS\nName: ${d.get('name')||''}\nEmail: ${d.get('email')||''}\nPhone: ${d.get('phone')||'Not provided'}\nInterest: ${d.get('interest')||''}\nLook reference: ${d.get('look')||'Not specified'}\n\nMessage:\n${d.get('message')||''}`;}
  function valid(){const needed=[...form.querySelectorAll('[required]')];needed.forEach(el=>el.setAttribute('aria-invalid',String(!el.value.trim() || (el.type==='email' && !el.checkValidity()))));const bad=needed.find(el=>el.getAttribute('aria-invalid')==='true');if(bad){bad.focus();status.textContent='Please complete your name, valid email and message.';return false}return true}
  async function copy(){const text=build();try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}else{let ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();if(!document.execCommand('copy'))throw new Error('No clipboard access');ta.remove()}status.textContent='Request copied. Share it with SHANERYN using the confirmed business contact channel.';}catch{status.textContent='Clipboard unavailable in this browser. Please copy your details manually.';}}
  $('#ep-contact-copy').addEventListener('click',()=>{if(valid())copy()});
  form.addEventListener('submit',event=>{event.preventDefault();if(!valid())return;
   if(contact.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)){const href='mailto:'+encodeURIComponent(contact.email)+'?subject='+encodeURIComponent('SHANERYN Enquiry — '+(form.elements['look'].value||form.elements['interest'].value))+'&body='+encodeURIComponent(build());status.textContent='Opening your email application. Review and send the draft to complete your enquiry.';location.href=href;}
   else copy();
  });
 }
})();
