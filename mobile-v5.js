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
    whatsapp:'<path d="M20.7 11.5a8.7 8.7 0 0 1-12.8 7.7L3 20.8l1.6-4.7a8.7 8.7 0 1 1 16.1-4.6Z"/><path d="M8.1 8.1c-.4.5-.6 1.2-.3 2 .9 2.4 3 4.5 5.4 5.5.9.4 1.6.3 2.2-.1l.9-1.2-2.4-1.1-1.1.8c-1.4-.6-2.5-1.7-3.1-3.1l.8-1.1-1.2-2.3z"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>'
  }[name] || '');
  const svg = n => `<svg aria-hidden="true" viewBox="0 0 24 24">${icon(n)}</svg>`;
  const current = {
    home:'home',collections:'explore','collection-edit':'explore',look:'explore',
    'bespoke-page':'bespoke'
  }[page]||'';
  // A number is deliberately not invented. Set SHANERYN_CONTACT.whatsapp with
  // country code (digits only or +prefix) to enable direct WhatsApp chat.
  const whatsappDigits = String(window.SHANERYN_CONTACT?.whatsapp || '').replace(/\D/g, '');
  const whatsappReady = /^\d{8,15}$/.test(whatsappDigits);
  const whatsappHref = whatsappReady
    ? 'https://wa.me/' + whatsappDigits + '?text=' + encodeURIComponent('Hello SHANERYN, I would like to enquire about your collections.')
    : 'contact.html#ep-contact-form';
  const tabs = [
    ['home','Home','index.html','a'],
    ['explore','Explore','collections.html','a'],
    ['bespoke','Bespoke','bespoke.html','a'],
    ['whatsapp','WhatsApp',whatsappHref,'a'],
    ['menu','Menu',null,'button']
  ];
  const nav = document.createElement('nav');
  nav.className='v5-tabbar'; nav.setAttribute('aria-label','SHANERYN mobile navigation');
  nav.innerHTML = tabs.map(([name,label,href,tag]) => {
    const chosen = name===current ? ' aria-current="page"' : '';
    const attr = tag==='a'?`href="${href}"`:'type="button"';
    const chatAttrs = name==='whatsapp'
      ? whatsappReady
        ? ' target="_blank" rel="noopener noreferrer" aria-label="Chat with SHANERYN on WhatsApp"'
        : ' aria-label="Contact SHANERYN (WhatsApp number pending)" title="WhatsApp number pending: use the enquiry form"'
      : ` aria-label="${label}"`;
    return `<${tag} class="v5-tabbar-item" ${attr} data-v5-tab="${name}"${chosen}${chatAttrs}>${svg(name)}<span>${label}</span></${tag}>`;
  }).join('');
  document.body.appendChild(nav);
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  const dockMenuButton=nav.querySelector('[data-v5-tab="menu"]');
  dockMenuButton?.setAttribute('aria-controls','mobile-menu');
  dockMenuButton?.setAttribute('aria-expanded','false');
  const menuPath=menuToggle?.querySelector('svg path');
  const menuPathOriginal=menuPath?.getAttribute('d');
  nav.querySelector('[data-v5-tab="menu"]')?.addEventListener('click',()=>menuToggle?.click());
  const syncMenu = () => {
    const opened = menu?.classList.contains('is-open');
    const btn=nav.querySelector('[data-v5-tab="menu"]');
    btn?.classList.toggle('is-active',!!opened);
    btn?.setAttribute('aria-expanded',String(!!opened));
    if(menuPath && narrow.matches)menuPath.setAttribute('d',opened?'M6 6l12 12M18 6 6 18':menuPathOriginal||'M3 7h18M3 12h18M3 17h18');
  };
  if(menu && 'MutationObserver' in window) new MutationObserver(syncMenu).observe(menu,{attributes:true,attributeFilter:['class']});
  syncMenu();
  // Saved Looks remain available in the existing header, menus and collection tools.
  // While focusing into a form, the tab dock gets out of the way of the virtual keyboard.
  document.addEventListener('focusin',event=>{
    if(narrow.matches && event.target.matches('input,textarea,select'))document.body.classList.add('v5-input-focus');
  });
  document.addEventListener('focusout',event=>{
    if(event.target.matches('input,textarea,select'))document.body.classList.remove('v5-input-focus');
  });
  // The homepage Collection is now a non-scrolling 2-column gallery on phones.
  // Do not inject the previous swipe hint into this section.
  // The client-approved hero is a single photograph: no mobile swipe/slide controls.
  // Preserve app menu state safely when moving between breakpoints.
  narrow.addEventListener?.('change',event=>{
    if(!event.matches && menu?.classList.contains('is-open'))menuToggle?.click();
    if(!event.matches){
      document.body.classList.remove('v5-input-focus');
      if(menuPath)menuPath.setAttribute('d',menuPathOriginal||'M3 7h18M3 12h18M3 17h18');
    }
  });
})();
