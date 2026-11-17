/* SHANERYN V5 / Mobile-only app-like navigation and small progressive enhancements.
   No checkout, backend, or alteration to the original brand artwork. */
(() => {
  'use strict';
  const page = document.body?.dataset.page || '';
  const narrow = window.matchMedia('(max-width:767px)');
  const icon = (name) => ({
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    explore:'<rect x="3.5" y="3.5" width="17" height="17" rx="2"/><path d="M12 4v16M4 12h16"/>',
    bespoke:'<path d="m8 3 4 5 4-5 4 4-3 5v9H7v-9L4 7z"/><path d="M12 8v13"/>',
    heart:'<path d="M20.8 8.3c0 5.3-8.8 11.2-8.8 11.2S3.2 13.6 3.2 8.3a4.8 4.8 0 0 1 8.8-2.5 4.8 4.8 0 0 1 8.8 2.5z"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
  }[name] || '');
  const svg = n => `<svg aria-hidden="true" viewBox="0 0 24 24">${icon(n)}</svg>`;
  const current = {
    home:'home',collections:'explore','collection-edit':'explore',look:'explore',
    'bespoke-page':'bespoke'
  }[page]||'';
  const tabs = [
    ['home','Home','index.html','a'],
    ['explore','Explore','collections.html','a'],
    ['bespoke','Bespoke','bespoke.html','a'],
    ['heart','Saved',null,'button'],
    ['menu','Menu',null,'button']
  ];
  const nav = document.createElement('nav');
  nav.className='v5-tabbar'; nav.setAttribute('aria-label','SHANERYN mobile navigation');
  nav.innerHTML = tabs.map(([name,label,href,tag]) => {
    const chosen = name===current ? ' aria-current="page"' : '';
    const attr = tag==='a'?`href="${href}"`:'type="button"';
    return `<${tag} class="v5-tabbar-item" ${attr} data-v5-tab="${name}"${chosen} aria-label="${label}">${svg(name)}<span>${label}</span>${name==='heart'?'<small class="v5-saved-badge" aria-hidden="true"></small>':''}</${tag}>`;
  }).join('');
  document.body.appendChild(nav);
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const dockMenuButton=nav.querySelector('[data-v5-tab="menu"]');
  const dockSavedButton=nav.querySelector('[data-v5-tab="heart"]');
  dockMenuButton?.setAttribute('aria-controls','mobile-menu');
  dockMenuButton?.setAttribute('aria-expanded','false');
  dockSavedButton?.setAttribute('aria-haspopup','dialog');
  const menuPath=menuToggle?.querySelector('svg path');
  const menuPathOriginal=menuPath?.getAttribute('d');
  nav.querySelector('[data-v5-tab="menu"]')?.addEventListener('click',()=>menuToggle?.click());
  nav.querySelector('[data-v5-tab="heart"]')?.addEventListener('click',()=>document.querySelector('.nav-right [data-open-saved]')?.click());
  const syncMenu = () => {
    const opened = menu?.classList.contains('is-open');
    const btn=nav.querySelector('[data-v5-tab="menu"]');
    btn?.classList.toggle('is-active',!!opened);
    btn?.setAttribute('aria-expanded',String(!!opened));
    if(menuPath && narrow.matches)menuPath.setAttribute('d',opened?'M6 6l12 12M18 6 6 18':menuPathOriginal||'M3 7h18M3 12h18M3 17h18');
  };
  if(menu && 'MutationObserver' in window) new MutationObserver(syncMenu).observe(menu,{attributes:true,attributeFilter:['class']});
  syncMenu();
  // Saved badge uses existing prototype's saved-count updates. No new user-data storage.
  const badge=nav.querySelector('.v5-saved-badge');
  const source=[...document.querySelectorAll('[data-saved-count]')].find(el=>!nav.contains(el));
  const syncSaved=()=>{
    if(!badge)return;
    let number=Number(source?.textContent||0);
    if(!Number.isFinite(number)) number=0;
    badge.textContent=number>9?'9+':String(number);
    badge.classList.toggle('has-items',number>0);
  };
  if(source&&'MutationObserver' in window)new MutationObserver(syncSaved).observe(source,{childList:true,characterData:true,subtree:true});
  syncSaved();
  // While focusing into a form, the tab dock gets out of the way of the virtual keyboard.
  document.addEventListener('focusin',event=>{
    if(narrow.matches && event.target.matches('input,textarea,select'))document.body.classList.add('v5-input-focus');
  });
  document.addEventListener('focusout',event=>{
    if(event.target.matches('input,textarea,select'))document.body.classList.remove('v5-input-focus');
  });
  // Tiny discovery hint is a real affordance, not a decorative navigation control.
  const shop=document.querySelector('body[data-page="home"] .occasion-ref-grid');
  if(shop){
    const hint=document.createElement('p');hint.className='v5-swipe-hint';hint.textContent='SWIPE TO EXPLORE  /  01 - 04';
    shop.insertAdjacentElement('afterend',hint);
  }
  // Mobile-native horizontal swipe on the campaign hero. Vertical page scroll stays untouched.
  const hero = document.querySelector('body[data-page="home"] #hero');
  if(hero){
    let start=null;
    hero.addEventListener('touchstart',e=>{
      if(e.touches.length!==1)return;
      start={x:e.touches[0].clientX,y:e.touches[0].clientY};
    },{passive:true});
    hero.addEventListener('touchend',e=>{
      if(!start||!narrow.matches)return;
      const touch=e.changedTouches[0];if(!touch)return;
      const dx=touch.clientX-start.x,dy=touch.clientY-start.y;start=null;
      if(Math.abs(dx)>54&&Math.abs(dx)>Math.abs(dy)*1.35){
        hero.querySelector(dx<0?'[data-hero-next]':'[data-hero-prev]')?.click();
      }
    },{passive:true});
    hero.addEventListener('touchcancel',()=>{start=null;},{passive:true});
  }
  // Preserve app menu state safely when moving between breakpoints.
  narrow.addEventListener?.('change',event=>{
    if(!event.matches && menu?.classList.contains('is-open'))menuToggle?.click();
    if(!event.matches){
      document.body.classList.remove('v5-input-focus');
      if(menuPath)menuPath.setAttribute('d',menuPathOriginal||'M3 7h18M3 12h18M3 17h18');
    }
  });
})();
