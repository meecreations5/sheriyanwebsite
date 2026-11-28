/* SHANERYN V4.8: accessible compact sticky detail and one-use enquiry context.
   Measurements never appear in a URL, are never sent to a server by this code,
   and are removed from tab sessionStorage upon reading on Contact. */
(() => {
 'use strict';
 const $=selector=>document.querySelector(selector);
 const $$=selector=>[...document.querySelectorAll(selector)];
 const page=document.body.dataset.page;
 const handoffKey='shaneryn_v48_one_time_enquiry';
 if(page==='look'){
   const product=$('#look-detail'),title=$('#detail-title'),baseLink=$('#detail-enquire');
   const stickyName=$('#ld-sticky-title'),stickyDescription=$('#ld-sticky-description');
   const stickySwatch=$('#ld-sticky-swatch');
   const stickySave=$('#ld-sticky-save'),mainSave=$('#detail-save');
   const stickyRequest=$('#ld-sticky-request'),mobileRequest=$('#ld-mobile-request');
   const mobileName=$('#ld-mobile-cta-name'),mobileSize=$('#ld-mobile-cta-size');
   const lookId=window.SHANERYN_ACTIVE_LOOK_ID || new URLSearchParams(location.search).get('id') || window.SHANERYN_LOOKS?.[0]?.id || '';
   const look=window.SHANERYN_LOOKS?.find(x=>x.id===lookId)||window.SHANERYN_LOOKS?.[0];
   const measured=()=>window.SHANERYN_V48_LOOK_MEASUREMENTS?.()||[];
   function syncSelections(){
     const n=title?.textContent?.trim()||look?.title||'SHANERYN';
     if(stickyName)stickyName.textContent=n;
     if(mobileName)mobileName.textContent=n;
     if(stickyDescription)stickyDescription.textContent=look?`${look.cat} · ${look.tone||'As photographed'}`:'A considered silhouette';
     if(mobileSize){const price=String(look?.price||'').trim();mobileSize.textContent=innerWidth<=767?[look?.cat,/^\d+(?:\.\d{1,2})?$/.test(price)?'₹'+Number(price).toLocaleString('en-IN'):price].filter(Boolean).join(' · '):'Personal purchase enquiry';}
     const swatch=$('#ld-colour-dot');if(swatch&&stickySwatch)stickySwatch.style.background=swatch.style.background;
     const pressed=mainSave?.getAttribute('aria-pressed')==='true';
     if(stickySave){stickySave.setAttribute('aria-pressed',String(pressed));stickySave.textContent=pressed?'♥':'♡';stickySave.setAttribute('aria-label',pressed?'Remove saved look':'Save this look');}
     if(baseLink){for(const target of [stickyRequest,mobileRequest])if(target)target.href=baseLink.href;}
   }
   stickySave?.addEventListener('click',()=>{mainSave?.click();syncSelections();});
   $$('#detail-save').forEach(node=>node.addEventListener('click',()=>requestAnimationFrame(syncSelections)));
   $$('#ld-measure-fields').forEach(node=>node.addEventListener('input',syncSelections));
   syncSelections();
   // Important: one normal document scroll. Sticky summary is only shown once
   // the full title is gone, and releases at the end of the gallery/product.
   let queued=false;
   function refreshSticky(){
     queued=false;
     if(!product||!title)return;
     const headerHeight=$('#site-header')?.getBoundingClientRect().height||70;
     const rect=product.getBoundingClientRect();
     const originalAction=baseLink?.getBoundingClientRect();
     const actionVisible=!!originalAction && originalAction.bottom>headerHeight+8 && originalAction.top<innerHeight-16;
     const actionScrolledAbove=!!originalAction && originalAction.bottom<headerHeight+8;
     const withinProduct=rect.bottom>headerHeight+180 && rect.top<innerHeight*.7;
     // Avoid showing two 'Request Details' buttons together. The desktop rail
     // takes over after the inline CTA scrolls up. On mobile, it remains
     // available during the photograph gallery, but hides beside the real CTA.
     document.body.classList.toggle('ld-sticky-active',withinProduct&&actionScrolledAbove&&innerWidth>850);
     document.body.classList.toggle('ld-mobile-cta-active',withinProduct&&innerWidth<=850&&scrollY>110&&!actionVisible);
   }
   function queueSticky(){if(queued)return;queued=true;requestAnimationFrame(refreshSticky);}
   window.addEventListener('scroll',queueSticky,{passive:true});
   window.addEventListener('resize',queueSticky,{passive:true});
   document.addEventListener('visibilitychange',queueSticky);
   requestAnimationFrame(refreshSticky);
   function stageOneTimeRequest(){
     if(!look)return;
     const state={look:look.id,title:look.title,measurements:measured(),time:Date.now()};
     try{sessionStorage.setItem(handoffKey,JSON.stringify(state));}catch{}
   }
   [baseLink,$('#detail-details-request'),stickyRequest,mobileRequest].forEach(el=>el?.addEventListener('click',stageOneTimeRequest));
 }
 if(page==='contact-page'){
   let payload=null;
   try{
     const raw=sessionStorage.getItem(handoffKey);
     sessionStorage.removeItem(handoffKey); // cleared immediately, whether used or not
     if(raw)payload=JSON.parse(raw);
   }catch{}
   const params=new URLSearchParams(location.search),lookParam=params.get('look');
   if(payload && lookParam===payload.look && Date.now()-payload.time<10*60*1000){
     const textarea=$('#contact-message'),lookInput=$('#contact-look');
     if(lookInput && !lookInput.value.trim())lookInput.value=payload.look;
     if(textarea){
       const fragments=['I would like to enquire about '+payload.title+' ('+payload.look+').'];
       if(payload.measurements?.length)fragments.push('Optional measurements for discussion:\n'+payload.measurements.join('\n'));
       fragments.push('Please advise on fit, availability and next steps.');
       const current=textarea.value.trim();
       textarea.value=fragments.join('\n\n')+(current?'\n\n'+current:'');
     }
     const status=$('#ep-contact-status');if(status)status.textContent='Your selected look and preferences have been added to this draft. You can edit the message before sending.';
   }
 }
 if(page==='collections'){
   const select=$('#occasion-filter'),search=$('#look-search'),filters=$('.filters'),grid=$('#look-grid');
   const availableOccasions=new Set((window.SHANERYN_LOOKS||[]).map(p=>p.occasion));
   if(select){
     $$('option').filter(opt=>opt.parentElement===select && opt.value!=='all').forEach(opt=>{
       if(!availableOccasions.has(opt.value)){opt.disabled=true;opt.hidden=true;}
     });
     if(!availableOccasions.has(select.value)&&select.value!=='all'){
       select.value='all';select.dispatchEvent(new Event('change',{bubbles:true}));
     }
   }
   if(filters && grid){
     const clear=document.createElement('button');clear.type='button';clear.id='v48-clear-filters';
     clear.className='v48-clear-filters';clear.textContent='Clear filters ×';
     clear.hidden=true;filters.append(clear);
     function hasFilters(){return $('#look-search')?.value.trim() || (select&&select.value!=='all')||($('#sh120-collection')?.value||'all')!=='all'||($('#sh120-sort')?.value||'default')!=='default' || $('[data-category][aria-pressed="true"]')?.dataset.category!=='All';}
     function syncClear(){clear.hidden=!hasFilters();}
     function reset(){
       $('[data-category="All"]')?.click();
       if(search){search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));}
       if(select){select.value='all';select.dispatchEvent(new Event('change',{bubbles:true}));}for(const [id,value] of [['#sh120-collection','all'],['#sh120-sort','default']]){const control=$(id);if(control){control.value=value;control.dispatchEvent(new Event('change',{bubbles:true}));}} 
       syncClear();
     }
     clear.addEventListener('click',reset);
     filters.addEventListener('click',()=>requestAnimationFrame(syncClear));
     [search,select,$('#sh120-collection'),$('#sh120-sort')].forEach(el=>el?.addEventListener('input',syncClear));
     select?.addEventListener('change',syncClear);$('#sh120-collection')?.addEventListener('change',syncClear);$('#sh120-sort')?.addEventListener('change',syncClear);
     const refreshEmpty=()=>{
       const empty=grid.querySelector('.empty-state');
       if(!empty||empty.querySelector('.v48-empty-reset'))return;
       const action=document.createElement('button');action.type='button';
       action.className='v48-empty-reset';action.textContent='Clear filters and see all looks';
       action.addEventListener('click',reset);empty.append(action);
     };
     if('MutationObserver' in window)new MutationObserver(refreshEmpty).observe(grid,{childList:true});
     refreshEmpty();syncClear();
   }
 }
})();
