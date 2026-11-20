/* SHANERYN V5.1 | Inner-page Signature Experience & Enquiry UX
   Homepage intentionally untouched. Front-end prototype, no orders, accounts,
   backend form submission, appointment booking or payments. */
(() => {
  'use strict';
  const page = document.body?.dataset.page || '';
  if (!page || page === 'home') return;
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const looks = window.SHANERYN_LOOKS || [];
  const findLook = id => looks.find(x => x.id === id);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const savedKey = 'shaneryn_demo_saved_looks_v1';
  const recentKey = 'shaneryn_v51_recent_session';
  const bespokeHandoffKey = 'shaneryn_v51_bespoke_once';
  const getSaved = () => { try {const arr=JSON.parse(localStorage.getItem(savedKey)||'[]');return Array.isArray(arr)?arr.filter(x=>typeof x==='string'):[]} catch {return []} };
  const setSaved = ids => {try{localStorage.setItem(savedKey,JSON.stringify(ids));}catch{};syncSavedUI();};
  const recent = () => {try{const a=JSON.parse(sessionStorage.getItem(recentKey)||'[]');return Array.isArray(a)?a:[]}catch{return []}};
  const recordRecent = id => {if(!findLook(id))return;const items=[id,...recent().filter(x=>x!==id)].slice(0,5);try{sessionStorage.setItem(recentKey,JSON.stringify(items))}catch{}};
  const savedCount = () => getSaved().length;
  const syncSavedUI = () => {
    const active = getSaved();
    $$('[data-saved-count]').forEach(el=>el.textContent=String(active.length));
    $$('[data-save-id]').forEach(el=>{const selected=active.includes(el.dataset.saveId);el.setAttribute('aria-pressed',String(selected));el.textContent=selected?'♥':'♡';});
    const previewSave=$('#v51-preview-save');
    if(previewSave?.dataset.id){const selected=active.includes(previewSave.dataset.id);previewSave.textContent=selected?'♥  SAVED TO MY EDIT':'♡  SAVE TO MY EDIT';previewSave.setAttribute('aria-pressed',String(selected));}
    const savedAction=$('#v51-edit-enquire');
    if(savedAction){savedAction.hidden=!active.length;savedAction.textContent=`ENQUIRE ABOUT MY EDIT (${active.length}) ↗`;}
  };
  function toggleSaved(id){if(!findLook(id))return;const list=getSaved();setSaved(list.includes(id)?list.filter(x=>x!==id):[...list,id]);showFeedback(getSaved().includes(id)?'Added to My Edit':'Removed from My Edit');}
  let feedbackTimer;
  function showFeedback(text){
    const el=$('#toast');if(!el)return;el.textContent=text;el.classList.add('show');clearTimeout(feedbackTimer);feedbackTimer=setTimeout(()=>el.classList.remove('show'),2500);
  }
  function getUrl(id,interest='Garment Purchase Enquiry'){
    return 'contact.html?'+new URLSearchParams({interest,look:id}).toString();
  }
  function initIntro(){
    // No additional animation or navigation changes to the approved homepage.
    if(reducedMotion.matches)return;
    try {if(sessionStorage.getItem('shaneryn_v51_intro_seen')==='yes')return;sessionStorage.setItem('shaneryn_v51_intro_seen','yes');}catch{}
    const layer=document.createElement('div');layer.id='v51-signature-intro';layer.className='v51-signature-intro';
    layer.setAttribute('aria-label','SHANERYN signature introduction');
    layer.innerHTML='<div class="v51-intro-center"><div class="v51-intro-monogram"><img alt="" src="assets/brand/shaneryn-monogram-outline.svg"/></div><img class="v51-intro-wordmark" src="assets/brand/shaneryn-wordmark-light.png" alt="SHANERYN"/><span>AN EXPRESSION OF INDIVIDUALITY</span></div><button class="v51-intro-skip" type="button">SKIP INTRO ↗</button>';
    document.body.appendChild(layer);
    let done=false;
    const hide=()=>{if(done)return;done=true;layer.classList.add('is-leaving');setTimeout(()=>layer.remove(),300);};
    layer.querySelector('button').addEventListener('click',hide);
    document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();},{once:true});
    setTimeout(hide,1650);
  }
  function initSavedJourney(){
    const modal=$('#saved-modal');if(!modal)return;
    const windowEl=$('.modal-window',modal);
    const description=$('.bodycopy',windowEl);
    if(description)description.textContent='Your personal selection of SHANERYN looks. Save favourites and begin one conversation about the pieces you love.';
    const link=$('a[href="collections.html"]',windowEl);
    if(!link)return;
    const block=document.createElement('div');block.className='v51-edit-actions';
    block.innerHTML='<button type="button" class="v51-main-action" id="v51-edit-enquire">ENQUIRE ABOUT MY EDIT ↗</button><span>Saved locally in this browser; no account is required.</span>';
    link.before(block);
    block.querySelector('button').addEventListener('click',()=>{
      const ids=getSaved().filter(id=>!!findLook(id));if(!ids.length)return;
      location.href='contact.html?'+new URLSearchParams({interest:'Saved Looks Enquiry',look:ids.join(', ')}).toString();
    });
    // Original Saved Looks component retains image/detail navigation and removal.
    modal.addEventListener('click',()=>setTimeout(syncSavedUI,0));
    document.addEventListener('click',event=>{if(event.target.closest('#detail-save,[data-save-id],[data-remove],#ld-sticky-save'))setTimeout(syncSavedUI,0);},true);
    syncSavedUI();
  }
  function initQuickPreview(){
    const grid=$('#look-grid');if(!grid)return;
    const dialog=document.createElement('dialog');dialog.id='v51-quick-dialog';dialog.className='v51-preview-dialog';dialog.setAttribute('aria-label','Quick look preview');
    dialog.innerHTML=`<div class="v51-preview-shell"><button type="button" class="v51-preview-close" aria-label="Close quick look">×</button>
      <div class="v51-preview-visual"><img id="v51-preview-image" alt=""/><div class="v51-preview-switch"><button type="button" id="v51-preview-prev" aria-label="Previous photograph">←</button><span id="v51-preview-position">01 / 02</span><button type="button" id="v51-preview-next" aria-label="Next photograph">→</button></div></div>
      <div class="v51-preview-copy"><span class="ep-kicker">THE SHANERYN EDIT / QUICK LOOK</span><h2 id="v51-preview-title"></h2><span class="v51-preview-code" id="v51-preview-code"></span><p id="v51-preview-description"></p><div class="v51-preview-cta"><a class="v51-main-action" id="v51-preview-full" href="/collections">EXPLORE FULL LOOK ↗</a><a class="v51-underline-link" id="v51-preview-enquire" href="contact.html">BUY IT ↗</a><button type="button" class="v51-preview-save" id="v51-preview-save" aria-pressed="false">♡ SAVE TO MY EDIT</button></div><p class="v51-preview-note">The full gallery, fit details and enquiry preferences are available on the Look Detail page.</p></div>
    </div>`;
    document.body.append(dialog);
    let active=null,slide=0,images=[];
    const img=$('#v51-preview-image');
    function display(){if(!active)return;img.src=(/^(https?:\/\/|assets\/|\/)/i.test(images[slide])?images[slide]:'assets/'+images[slide]);img.alt=`${active.title} — garment photograph ${slide+1}`;$('#v51-preview-position').textContent=String(slide+1).padStart(2,'0')+' / '+String(images.length).padStart(2,'0');}
    function open(id){const p=findLook(id);if(!p)return;active=p;slide=0;images=[p.catalogueImg||p.img,p.img].filter((v,i,a)=>a.indexOf(v)===i);recordRecent(p.id);renderRecent();
      $('#v51-preview-title').textContent=p.title;$('#v51-preview-code').textContent=p.cat+' / '+p.id+' / '+(p.tone||'As photographed');
      $('#v51-preview-description').textContent=p.description||p.tagline||'Explore a considered SHANERYN silhouette.';
      $('#v51-preview-full').href=p.publicPath;
      $('#v51-preview-enquire').href=getUrl(p.id);$('#v51-preview-save').dataset.id=p.id;
      display();syncSavedUI();dialog.showModal();
    }
    function installButtons(){
      $$('.look-card',grid).forEach(card=>{if(card.querySelector('[data-v51-quick]'))return;
        const anchor=card.querySelector('.look-image-btn');const href=anchor?.getAttribute('href')||'';const path=new URL(href,document.baseURI).pathname;const id=looks.find(p=>p.publicPath===path)?.id;if(!id||!findLook(id))return;
        const btn=document.createElement('button');btn.type='button';btn.className='v51-quick-btn';btn.dataset.v51Quick=id;btn.setAttribute('aria-label','Quick preview '+findLook(id).title);btn.innerHTML='QUICK LOOK <span aria-hidden="true">↗</span>';
        anchor.insertAdjacentElement('afterend',btn);
        const syncPosition=()=>card.style.setProperty('--v51-image-bottom',Math.round(anchor.getBoundingClientRect().height)+'px');
        requestAnimationFrame(syncPosition);
        const photo=anchor.querySelector('img');if(photo&&!photo.complete)photo.addEventListener('load',syncPosition,{once:true});
        if('ResizeObserver' in window)new ResizeObserver(syncPosition).observe(anchor);
      });
    }
    new MutationObserver(installButtons).observe(grid,{childList:true});installButtons();
    grid.addEventListener('click',event=>{const btn=event.target.closest('[data-v51-quick]');if(btn)open(btn.dataset.v51Quick);
      else if(event.target.closest('a[href^="/look/"]'))storeCollectionReturn();});
    const close=()=>dialog.close();$('.v51-preview-close',dialog).addEventListener('click',close);
    dialog.addEventListener('click',event=>{if(event.target===dialog)close();});
    $('#v51-preview-next').addEventListener('click',()=>{slide=(slide+1)%images.length;display();});
    $('#v51-preview-prev').addEventListener('click',()=>{slide=(slide+images.length-1)%images.length;display();});
    $('#v51-preview-save').addEventListener('click',()=>{if(active)toggleSaved(active.id)});
    $('#v51-preview-full').addEventListener('click',storeCollectionReturn);
    dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();$('#v51-preview-next').click();}else if(e.key==='ArrowLeft'){e.preventDefault();$('#v51-preview-prev').click();}});
    let swipeStart=null;
    dialog.addEventListener('touchstart',e=>{if(e.touches.length===1)swipeStart={x:e.touches[0].clientX,y:e.touches[0].clientY};},{passive:true});
    dialog.addEventListener('touchend',e=>{if(!swipeStart)return;const dx=e.changedTouches[0].clientX-swipeStart.x;const dy=e.changedTouches[0].clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy))$('#v51-preview-'+(dx<0?'next':'prev')).click();},{passive:true});
    function storeCollectionReturn(){try{sessionStorage.setItem('shaneryn_v51_collection_return',JSON.stringify({time:Date.now(),category:$('[data-category][aria-pressed="true"]')?.dataset.category||'All',occasion:$('#occasion-filter')?.value||'all',search:$('#look-search')?.value||'',y:scrollY}));}catch{}}
    function restoreCollection(){
      let state;try{state=JSON.parse(sessionStorage.getItem('shaneryn_v51_collection_return')||'null');}catch{return;}
      if(!state||Date.now()-state.time>10*60*1000)return;
      if(!/\/look(?:\/|\?|\.html)/.test(document.referrer))return;
      try{sessionStorage.removeItem('shaneryn_v51_collection_return');}catch{}
      $$('[data-category]').find(el=>el.dataset.category===state.category)?.click();
      const occ=$('#occasion-filter');if(occ){occ.value=state.occasion;occ.dispatchEvent(new Event('change',{bubbles:true}));}
      const search=$('#look-search');if(search){search.value=state.search;search.dispatchEvent(new Event('input',{bubbles:true}));}
      setTimeout(()=>window.scrollTo({top:Math.max(0,Number(state.y)||0),behavior:'auto'}),120);
    }
    function renderRecent(){
      const target=$('#v51-recent'),items=$('#v51-recent-grid');if(!target||!items)return;
      const list=recent().map(findLook).filter(Boolean).slice(0,4);target.hidden=list.length===0;
      items.innerHTML=list.map(p=>`<a href="${p.publicPath}"><img loading="lazy" src="${escapeHtml(/^(https?:\/\/|assets\/|\/)/i.test(p.catalogueImg||p.img)?(p.catalogueImg||p.img):'assets/'+(p.catalogueImg||p.img))}" alt="Full-length ${escapeHtml(p.title)}"/><span>${escapeHtml(p.title)} <small>VIEW LOOK ↗</small></span></a>`).join('');
      $$('#v51-recent-grid a').forEach(a=>a.addEventListener('click',storeCollectionReturn));
    }
    renderRecent();restoreCollection();
  }
  function initCategoryNav(){
    const el=$('#v51-category-switch');if(!el)return;
    const current=new URLSearchParams(location.search).get('category')||'Pant Sets';
    const cats=[...new Set(looks.map(p=>p.cat))];
    el.innerHTML=cats.map(cat=>`<a href="collection.html?category=${encodeURIComponent(cat)}" ${current===cat?'aria-current="page"':''}>${escapeHtml(cat)}</a>`).join('');
    const bespoke=$('.v51-category-tail a');if(bespoke)bespoke.href='bespoke.html?category='+encodeURIComponent(current)+'#measurement-studio';
  }
  function initLookIntent(){
    const id=window.SHANERYN_ACTIVE_LOOK_ID || new URLSearchParams(location.search).get('id') || looks[0]?.id;
    const p=findLook(id)||looks[0];if(!p)return;
    recordRecent(p.id);
    // Keep one primary CTA across desktop, mobile and existing sticky UI.
    const link=getUrl(p.id);
    ['#detail-enquire','#ld-sticky-request','#ld-mobile-request','#detail-details-request'].forEach(selector=>{
      const anchor=$(selector);if(!anchor)return;anchor.href=link;
      if(selector!=='#detail-details-request')anchor.innerHTML='BUY IT NOW <span aria-hidden="true">↗</span>';
    });
    const personalise=$('#v51-personalise'),ask=$('#v51-ask-designer');
    if(personalise)personalise.href='bespoke.html?look='+encodeURIComponent(p.id)+'#measurement-studio';
    if(ask)ask.href=getUrl(p.id,'Styling Enquiry');
    // Lightweight tactile feedback only; no price or confirmation of inventory.
    const btn=$('#detail-save');
    btn?.addEventListener('click',()=>setTimeout(()=>{syncSavedUI();showFeedback(btn.getAttribute('aria-pressed')==='true'?'Added to My Edit':'Removed from My Edit');},0));
  }
  function initBespokeHandoff(){
    const review=$('#cv3-measure-review');if(!review)return;
    $$('[data-v51-bespoke-mode]').forEach(anchor=>anchor.addEventListener('click',()=>{
      const mode=anchor.dataset.v51BespokeMode;
      $$('[data-measure-mode]').find(btn=>btn.dataset.measureMode===mode)?.click();
    }));
    $('#v51-bespoke-enquire')?.addEventListener('click',()=>{
      const summary=$('#cv3-measure-summary')?.textContent?.trim();if(!summary)return;
      const type=$('#measure-select')?.value||'Custom garment';
      // Explicit one-use handoff; no body measurements stored in URLs or localStorage.
      try{sessionStorage.setItem(bespokeHandoffKey,JSON.stringify({time:Date.now(),summary}));}catch{}
      location.href='contact.html?'+new URLSearchParams({interest:'Bespoke / Customisation',look:type}).toString();
    });
  }
  function initContactIntent(){
    const select=$('#contact-interest');if(!select)return;
    const message=$('#contact-message'),form=$('#ep-contact-form');
    const labels={look:'A SHANERYN look',bespoke:'Bespoke / Customisation',service:'Styling Enquiry',general:'General Enquiry'};
    const note=$('#v51-intent-hint');
    const groupOf=value=>{
      const lower=String(value).toLowerCase();
      if(/bespoke|custom/.test(lower))return 'bespoke';
      if(/styling|analysis|consultation|colour|color/.test(lower))return 'service';
      if(/general/.test(lower))return 'general';return 'look';
    };
    const messages={look:'Share the look, preferred fit and your occasion. A garment enquiry is not an online purchase.',bespoke:'Tell us about a new design or changes to an existing look. Feasibility will be confirmed personally.',service:'Tell us which styling service interests you. Session details and fees will be discussed privately.',general:'Share your question. Preparing a draft does not send it to SHANERYN.'};
    function selectGroup(group,changeValue=false){
      $$('[data-v51-intent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v51Intent===group)));
      if(note)note.textContent=messages[group]||messages.general;
      if(changeValue){
        const val=group==='look'?'Look Details':labels[group];
        let option=Array.from(select.options).find(o=>o.value===val);
        if(!option){option=document.createElement('option');option.value=val;option.textContent=val;select.add(option);}
        select.value=val;
      }
    }
    $$('[data-v51-intent]').forEach(b=>b.addEventListener('click',()=>selectGroup(b.dataset.v51Intent,true)));
    select.addEventListener('change',()=>selectGroup(groupOf(select.value)));
    selectGroup(groupOf(select.value));
    // Bespoke measurements are applied only after an explicit request to continue.
    try{
      const raw=sessionStorage.getItem(bespokeHandoffKey);
      sessionStorage.removeItem(bespokeHandoffKey);
      const entry=raw?JSON.parse(raw):null;
      if(entry && entry.summary && Date.now()-entry.time<10*60*1000 && message){
        message.value=[`I'd like to enquire about a personalised SHANERYN piece.`,`My preliminary measurement notes for discussion:\n${entry.summary}`,message.value].filter(Boolean).join('\n\n');
        const status=$('#ep-contact-status');if(status)status.textContent='Your optional measurement summary is included in this email draft. Review it before sending.';
        selectGroup('bespoke');
      }
    }catch{}
    // The main contact flow already validates and prepares a mailto draft.
    // Add useful accessible context to form status, without suggesting submission.
    if(form){form.addEventListener('submit',()=>{const clarity=$('#v49-contact-clarity');if(clarity)clarity.textContent='Email draft prepared. Please send it from your email application; nothing was submitted on this website.';});}
  }
  function initFoundersSocial(){
    const url=window.SHANERYN_SITE_CONFIG?.founder?.linkedin;
    const slot=$('#v51-founder-linkedin');
    if(!slot)return;
    // Security and credibility: show only an actual, configured HTTPS profile.
    if(typeof url==='string' && /^https:\/\/(www\.)?linkedin\.com\/(in|company)\//i.test(url)){
      const a=document.createElement('a');a.className='v51-founder-linkedin';a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='CONNECT WITH SHIVANI ON LINKEDIN ↗';slot.replaceWith(a);
    } else slot.hidden=true;
  }
  initIntro();
  initSavedJourney();
  if(page==='collections')initQuickPreview();
  if(page==='collection-edit')initCategoryNav();
  if(page==='look')initLookIntent();
  if(page==='bespoke-page')initBespokeHandoff();
  if(page==='contact-page')initContactIntent();
  if(page==='story-page')initFoundersSocial();
})();
