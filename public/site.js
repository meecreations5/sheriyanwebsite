/* SHANERYN presentation prototype: no checkout, no backend transactions. */
(() => {
  'use strict';
  const A='';
  const lookData=window.SHANERYN_LOOKS || [];
  const escapeText = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const priceLabel = value => {const raw=String(value ?? '').trim();if(!raw)return '';return /^(?:\d{1,3}(?:,\d{2,3})*|\d+)(?:\.\d{1,2})?$/.test(raw)?'₹'+Number(raw.replace(/,/g,'')).toLocaleString('en-IN',{maximumFractionDigits:2}):raw;};
  const find=(q,root=document)=>root.querySelector(q);
  const all=(q,root=document)=>[...root.querySelectorAll(q)];
  let lastFocus=null, activeModal=null, toastTimer=null;
  const keys={FAVORITES:'shaneryn_demo_saved_looks_v1'};
  function getSaved(){try{return JSON.parse(localStorage.getItem(keys.FAVORITES)||'[]')}catch{return []}}
  function setSaved(a){try{localStorage.setItem(keys.FAVORITES,JSON.stringify(a))}catch{}updateSavedCount()}
  function toggleSaved(id){let a=getSaved();a=a.includes(id)?a.filter(x=>x!==id):[...a,id];setSaved(a);all(`[data-save-id="${id}"]`).forEach(b=>{b.setAttribute('aria-pressed',String(a.includes(id)));b.textContent=a.includes(id)?'♥':'♡'});toast(a.includes(id)?'Look saved in this browser':'Look removed from saved looks')}
  function updateSavedCount(){all('[data-saved-count]').forEach(e=>e.textContent=String(getSaved().length))}
  function toast(t){let el=find('#toast');if(!el)return;el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
  function modalOpen(id){const m=find('#'+id);if(!m)return;lastFocus=document.activeElement;activeModal=m;m.hidden=false;document.body.classList.add('modal-open');const first=find('button,input,textarea,[tabindex="0"]',m);if(first)first.focus()}
  function modalClose(){if(!activeModal)return;const m=activeModal;activeModal=null;m.hidden=true;document.body.classList.remove('modal-open');if(m.id==='film-modal'){const frame=find('#film-iframe');if(frame)frame.src=''}if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus()}
  all('[data-close-modal]').forEach(b=>b.addEventListener('click',modalClose));all('.modal').forEach(m=>m.addEventListener('mousedown',e=>{if(e.target===m)modalClose()}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')modalClose();if(activeModal&&e.key==='Tab'){const focusables=all('button:not(:disabled),a[href],input,textarea,select,[tabindex="0"]',activeModal).filter(x=>!x.hidden);if(!focusables.length)return;let i=focusables.indexOf(document.activeElement);if(e.shiftKey&&i===0){e.preventDefault();focusables.at(-1).focus()}else if(!e.shiftKey&&i===focusables.length-1){e.preventDefault();focusables[0].focus()}}});
  function initNav(){const header=find('.site-header'),menu=find('#mobile-menu'),btn=find('#menu-toggle');function closeMenu(){if(!menu||!btn)return;menu.classList.remove('is-open');btn.setAttribute('aria-expanded','false');menu.setAttribute('aria-hidden','true')}if(menu&&btn){btn.addEventListener('click',()=>{let open=!menu.classList.contains('is-open');menu.classList.toggle('is-open',open);btn.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-hidden',String(!open))});all('a,button',menu).forEach(a=>a.addEventListener('click',closeMenu))}let top=find('#backtotop');let onscroll=()=>{let y=window.scrollY;header&&header.classList.toggle('scrolled',y>60);top&&top.classList.toggle('show',y>600)};addEventListener('scroll',onscroll,{passive:true});onscroll();top&&top.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));all('[data-open-saved]').forEach(b=>b.addEventListener('click',openSaved));all('[data-open-inquiry]').forEach(b=>b.addEventListener('click',()=>openInquiry(b.dataset.product||'')));updateSavedCount()}
  function initReveal(){if(!('IntersectionObserver' in window)){all('.reveal').forEach(e=>e.classList.add('visible'));return}let observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.1});all('.reveal').forEach(e=>observer.observe(e))}
  function initHero(){
    const el=find('#hero'), image=find('#hero-image'); if(!el||!image)return;
    const config=(window.SHANERYN_SITE_CONFIG||{}).hero||{};
    const slides=(config.slides||[]).filter(p=>p.desktop&&p.mobile); if(!slides.length)return;
    const single=config.mode==='single'||slides.length===1;
    const indicators=all('[data-slide-index]',el);let idx=0,locked=false,changeTimer=null;
    const nav=el.querySelector('.hero-bottom'),side=el.querySelector('.hero-side');
    if(nav)nav.hidden=single;if(side)side.hidden=single;
    indicators.forEach((b,i)=>{b.hidden=i>=slides.length;b.disabled=i>=slides.length});
    const choose=i=>{
      if(locked)return;
      idx=single?0:(i+slides.length)%slides.length;
      const slide=slides[idx],mobile=matchMedia('(max-width:720px)').matches;
      const v=(mobile?slide.mobile:slide.desktop);const src=/^(https?:\/\/|assets\/|\/)/i.test(v)?v:'assets/'+v;
      const apply=()=>{
        image.style.backgroundImage='url("'+src+'")';
        image.setAttribute('aria-label',slide.alt||'SHANERYN fashion campaign photograph');
        indicators.forEach((b,j)=>{b.classList.toggle('active',j===idx);b.setAttribute('aria-current',j===idx?'true':'false')});
        el.classList.remove('changing');locked=false;
      };
      locked=true;el.classList.add('changing');clearTimeout(changeTimer);
      changeTimer=setTimeout(apply,matchMedia('(prefers-reduced-motion: reduce)').matches?0:190);
    };
    if(!single){
      all('[data-hero-next]',el).forEach(b=>b.addEventListener('click',()=>choose(idx+1)));
      all('[data-hero-prev]',el).forEach(b=>b.addEventListener('click',()=>choose(idx-1)));
      indicators.forEach((b,j)=>b.addEventListener('click',()=>choose(j)));
      let swipeStart=null;
      el.addEventListener('touchstart',e=>{if(e.touches.length===1)swipeStart=e.touches[0].clientX},{passive:true});
      el.addEventListener('touchend',e=>{if(swipeStart===null)return;const delta=e.changedTouches[0].clientX-swipeStart;if(Math.abs(delta)>70)choose(idx+(delta<0?1:-1));swipeStart=null},{passive:true});
      let cycle=setInterval(()=>{if(document.visibilityState==='visible'&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)choose(idx+1)},Math.max(3000,Number(config.intervalMs)||6500));
      window.addEventListener('pagehide',()=>clearInterval(cycle),{once:true});
    }
    matchMedia('(max-width:720px)').addEventListener('change',()=>{locked=false;choose(idx)});
    // Immediately display the first image without an initial blank transition.
    const first=slides[0];const m=matchMedia('(max-width:720px)').matches;
    const v=(m?first.mobile:first.desktop);image.style.backgroundImage='url("'+(/^(https?:\/\/|assets\/|\/)/i.test(v)?v:'assets/'+v)+'")';
    image.setAttribute('aria-label',first.alt||'SHANERYN fashion campaign photograph');
  }
  function initFilm(){
    const config=(window.SHANERYN_SITE_CONFIG||{}).fashionFilm||{};
    const id=(config.youtubeId||window.SHANERYN_APPROVED_YOUTUBE_ID||'').trim();
    const valid=/^[a-zA-Z0-9_-]{11}$/.test(id);
    const ytUrl=valid?'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?autoplay=1&mute=1&playsinline=1&rel=0&controls=0&loop=1&playlist='+encodeURIComponent(id)+'&enablejsapi=1':'';
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    const startYoutube=frame=>{if(frame&&valid&&frame.getAttribute('src')!==ytUrl)frame.setAttribute('src',ytUrl)};
    const stopYoutube=frame=>{if(frame&&frame.getAttribute('src'))frame.removeAttribute('src')};
    all('[data-film-autoplay]').forEach(stage=>{
      const frame=stage.querySelector('iframe');
      const video=stage.querySelector('[data-film-motion]');
      const placeholder=stage.querySelector('[data-film-placeholder]');
      const section=stage.closest('section');
      const manual=section?.querySelector('[data-film-manual]');
      let inView=false;
      if(frame)frame.hidden=!valid;
      if(video){video.hidden=valid;video.muted=true;video.defaultMuted=true;video.playsInline=true;}
      if(placeholder)placeholder.hidden=valid||!!video;
      const showManual=()=>{if(manual)manual.hidden=false};
      const hideManual=()=>{if(manual)manual.hidden=true};
      const pause=()=>{
        if(valid)stopYoutube(frame);
        else if(video&&!video.paused)video.pause();
      };
      const play=async(overrideReduced=false)=>{
        if(!inView||document.hidden)return;
        if(!overrideReduced && (config.autoplayOnView===false||reduced.matches)){
          showManual();return;
        }
        if(valid){startYoutube(frame);hideManual();return;}
        if(!video){showManual();return;}
        try{
          video.muted=true;
          const promise=video.play();
          if(promise&&typeof promise.then==='function')await promise;
          hideManual();
        }catch(e){showManual()}
      };
      const enter=()=>{inView=true;play()};
      const leave=()=>{inView=false;pause()};
      if(manual)manual.addEventListener('click',()=>{if(!inView){section?.scrollIntoView({behavior:'smooth',block:'center'});inView=true;}play(true)});
      if(video){video.addEventListener('error',showManual);video.addEventListener('stalled',()=>{if(inView&&video.paused)showManual()});}
      if('IntersectionObserver' in window){
        const observer=new IntersectionObserver(entries=>{
          for(const entry of entries){if(entry.isIntersecting&&entry.intersectionRatio>=.23)enter();else leave();}
        },{threshold:[0,.23,.5]});
        observer.observe(section||stage);
      }else{inView=true;play()}
      document.addEventListener('visibilitychange',()=>document.hidden?pause():inView&&play());
      window.addEventListener('pagehide',pause,{once:true});
      if(typeof reduced.addEventListener==='function'){
        reduced.addEventListener('change',()=>{if(reduced.matches){pause();showManual()}else if(inView){play()}});
      }
    });
    all('[data-play-film]').forEach(button=>button.addEventListener('click',()=>{
      const blank=find('#film-placeholder'),iframe=find('#film-iframe');
      if(valid){if(blank)blank.hidden=true;if(iframe){iframe.hidden=false;startYoutube(iframe)}}
      else {if(blank)blank.hidden=false;if(iframe)iframe.hidden=true}
      modalOpen('film-modal');
    }));
  }
  function openInquiry(look=''){const ref=String(look||'');const interest=ref.startsWith('New Drop /')?'New Drop':ref.toLowerCase().includes('bespoke')||ref.toLowerCase().includes('customisation')?'Bespoke / Customisation':'Look Details';const params=new URLSearchParams({interest});if(ref)params.set('look',ref);window.location.href='contact.html?'+params.toString()}
  function copyFallback(text){let ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();const success=document.execCommand('copy');ta.remove();return success}
  async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}return copyFallback(text)}catch{return false}}
  function initInquiry(){let form=find('#inquiry-form');if(!form)return;const emailAvailable=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(window.SHANERYN_CONTACT?.email||''));const emailBtn=find('#open-email');if(emailBtn&&!emailAvailable){emailBtn.hidden=true;emailBtn.style.display="none"};form.addEventListener('submit',async e=>{e.preventDefault();const data=new FormData(form);const text=`SHANERYN enquiry\nName: ${String(data.get('name')||'')}\nEmail: ${String(data.get('email')||'')}\nInterested in: ${String(data.get('look')||'General enquiry')}\nGarment type: ${String(data.get('garmentType')||'Not specified')}\nMessage: ${String(data.get('message')||'')}`;const done=await copyText(text);toast(done?'Enquiry copied. Please share it with SHANERYN.':'Copy unavailable. Select the message to copy.');if(done)modalClose()});find('#open-email')?.addEventListener('click',()=>{const d=new FormData(form);const body=`Name: ${d.get('name')||''}\nEmail: ${d.get('email')||''}\nInterested in: ${d.get('look')||'General enquiry'}\nGarment type: ${d.get('garmentType')||'Not specified'}\nMessage: ${d.get('message')||''}`;const address=String(window.SHANERYN_CONTACT?.email||'').trim();if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)){window.location.href=`mailto:${address}?subject=${encodeURIComponent('SHANERYN enquiry')}&body=${encodeURIComponent(body)}`}else{copyText('SHANERYN enquiry\n'+body).then(done=>toast(done?'Request copied. Share it through an official SHANERYN contact channel.':'Unable to copy. Please copy your request manually.'))}})}
  function openSaved(){let list=find('#saved-list');if(!list)return;const data=getSaved().map(id=>lookData.find(p=>p.id===id)).filter(Boolean);list.innerHTML=data.length?data.map(p=>`<div class="saved-list-row"><a href="${p.publicPath}" aria-label="View ${p.title} details"><img src="${A+p.img}" alt="${p.title}"></a><div><a href="${p.publicPath}"><span>${p.title}</span></a><div class="bodycopy">${p.cat}</div></div><button type="button" data-remove="${p.id}">Remove</button></div>`).join(''):'<p class="bodycopy">No saved looks yet. Select the heart on an outfit to save it here.</p>';all('[data-remove]',list).forEach(b=>b.addEventListener('click',()=>{toggleSaved(b.dataset.remove);openSavedRender()}));modalOpen('saved-modal')}
  function openSavedRender(){let list=find('#saved-list');if(!list)return;const data=getSaved().map(id=>lookData.find(p=>p.id===id)).filter(Boolean);list.innerHTML=data.length?data.map(p=>`<div class="saved-list-row"><a href="${p.publicPath}" aria-label="View ${p.title} details"><img src="${A+p.img}" alt="${p.title}"></a><div><a href="${p.publicPath}"><span>${p.title}</span></a><div class="bodycopy">${p.cat}</div></div><button type="button" data-remove="${p.id}">Remove</button></div>`).join(''):'<p class="bodycopy">No saved looks yet.</p>';all('[data-remove]',list).forEach(b=>b.addEventListener('click',()=>{toggleSaved(b.dataset.remove);openSavedRender()}))}
  let visibleLooks=[],viewIndex=0,activeCategory='All',activeOccasion='all',searchText='',sortOrder='default';
  function getFiltered(){const result=lookData.filter(p=>(activeCategory==='All'||p.cat===activeCategory)&&(activeOccasion==='all'||p.occasion===activeOccasion)&&(!searchText||(p.title+' '+p.cat+' '+(p.styleNumber||p.id)+' '+(window.SHANERYN_CURATED_COLLECTIONS||[]).filter(c=>(p.collectionIds||[]).includes(c.id)).map(c=>c.name).join(' ')).toLowerCase().includes(searchText)));if(sortOrder==='name')result.sort((a,b)=>String(a.title).localeCompare(String(b.title)));if(sortOrder==='reverse')result.sort((a,b)=>String(b.title).localeCompare(String(a.title)));return result}
  function renderLooks(){const grid=find('#look-grid');if(!grid)return;visibleLooks=getFiltered();find('#look-count').textContent=`${visibleLooks.length} ${visibleLooks.length===1?'look':'looks'}`;const ed=find('#category-view-link');if(ed){ed.hidden=activeCategory==='All';if(!ed.hidden){const category=(window.SHANERYN_CATEGORY_DEFINITIONS||[]).find(c=>c.name===activeCategory);ed.href=category?'/category/'+encodeURIComponent(category.id):'/collection?category='+encodeURIComponent(activeCategory);ed.textContent='Explore All Looks ↗';}}grid.innerHTML=visibleLooks.length?visibleLooks.map(p=>`<article class="look-card"><a href="${p.publicPath}" class="look-image-btn" aria-label="View details for ${p.title}"><img src="${A+(p.catalogueImg||p.img)}" loading="lazy" decoding="async" alt="${p.title}, SHANERYN full outfit photograph"></a><button class="look-heart" type="button" aria-pressed="${getSaved().includes(p.id)}" data-save-id="${p.id}" aria-label="Save ${p.title}">${getSaved().includes(p.id)?'♥':'♡'}</button><div class="look-info"><div><h3><a href="${p.publicPath}">${p.title}</a></h3><p>${p.cat} · ${p.styleNumber||p.id}</p>${priceLabel(p.price)?`<p class="catalogue-price">${escapeText(priceLabel(p.price))}</p>`:''}<a class="look-details-link" href="${p.publicPath}">View Details ↗</a></div><button type="button" aria-label="Enquire about ${p.title}" data-inquire-id="${p.id}">↗</button></div></article>`).join(''):'<div class="empty-state" style="grid-column:1/-1">No looks match these filters. Try another category or search term.</div>';
    
    all('[data-save-id]',grid).forEach(b=>b.addEventListener('click',()=>toggleSaved(b.dataset.saveId)));
    all('[data-inquire-id]',grid).forEach(b=>b.addEventListener('click',()=>openInquiry(b.dataset.inquireId)));
  }
  function showLook(id){const p=visibleLooks.find(x=>x.id===id)||lookData.find(x=>x.id===id);if(!p)return;viewIndex=Math.max(0,visibleLooks.indexOf(p));if(viewIndex<0)visibleLooks=lookData,viewIndex=visibleLooks.findIndex(x=>x.id===id);renderLookModal();modalOpen('look-modal')}
  function renderLookModal(){const p=visibleLooks[viewIndex];if(!p)return;find('#look-modal-image').src=A+p.img;find('#look-modal-image').alt=`SHANERYN look: ${p.title}`;find('#look-modal-title').textContent=p.title;find('#look-modal-code').textContent=`${p.cat} · ${p.styleNumber||p.id}`;find('#look-modal-description').textContent='Explore the selected look, styling notes and its made-to-measure options on the detail page.';find('#look-modal-inquiry').dataset.product=p.id;find('#look-modal-position').textContent=`${viewIndex+1} / ${visibleLooks.length}`}
  function nextLook(dir){if(!activeModal||activeModal.id!=='look-modal'||!visibleLooks.length)return;viewIndex=(viewIndex+dir+visibleLooks.length)%visibleLooks.length;renderLookModal()}
  function initCollections(){if(!find('#look-grid'))return;const params=new URLSearchParams(location.search);const definitions=Array.isArray(window.SHANERYN_CATEGORY_DEFINITIONS)?window.SHANERYN_CATEGORY_DEFINITIONS:[];
    const possible=params.get('category');const chosen=definitions.find(c=>c.id===possible||c.name===possible);
    if(chosen&&lookData.some(p=>p.cat===chosen.name||p.categoryId===chosen.id))activeCategory=chosen.name;
    const occ=params.get('occasion');if(occ&&lookData.some(p=>p.occasion===occ))activeOccasion=occ;
    all('[data-category]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.category===activeCategory));b.addEventListener('click',()=>{activeCategory=b.dataset.category;all('[data-category]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));renderLooks()})});
    const sel=find('#occasion-filter');if(sel){sel.value=activeOccasion;sel.addEventListener('change',()=>{activeOccasion=sel.value;renderLooks()})}
    const search=find('#look-search');const sort=document.createElement('select');sort.className='sh120-sort';sort.setAttribute('aria-label','Sort looks');for(const [value,label] of [['default','Featured order'],['name','Name A–Z'],['reverse','Name Z–A']]){const option=document.createElement('option');option.value=value;option.textContent=label;sort.append(option)};find('#v69-filter-tools')?.append(sort);sort.addEventListener('change',()=>{sortOrder=sort.value;renderLooks()});search?.addEventListener('input',()=>{searchText=search.value.trim().toLowerCase();renderLooks()});
    all('[data-look-step]').forEach(b=>b.addEventListener('click',()=>nextLook(Number(b.dataset.lookStep))));find('#look-modal-inquiry')?.addEventListener('click',()=>{let id=find('#look-modal-inquiry').dataset.product;modalClose();openInquiry(id)});
    document.addEventListener('keydown',e=>{if(!activeModal||activeModal.id!=='look-modal')return;if(e.key==='ArrowLeft')nextLook(-1);else if(e.key==='ArrowRight')nextLook(1)});
    let start=null;const mod=find('#look-modal');mod?.addEventListener('touchstart',e=>{start=e.touches[0]?.clientX},{passive:true});mod?.addEventListener('touchend',e=>{if(start===null)return;const diff=e.changedTouches[0].clientX-start;if(Math.abs(diff)>60)nextLook(diff<0?1:-1);start=null},{passive:true});
    renderLooks()
  }
  initNav();initReveal();initHero();initFilm();initInquiry();initCollections();
})();
