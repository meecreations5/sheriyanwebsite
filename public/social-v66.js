/* SHANERYN V6.7: consistent footer and Contact Us icons.
   Social links become interactive only when verified HTTPS platform URLs are supplied. */
(() => {
  'use strict';
  const icons = {
    whatsapp: '<path d="M20.5 11.8a8.5 8.5 0 0 1-12.7 7.4L3.5 20.5l1.4-4.1a8.5 8.5 0 1 1 15.6-4.6z"/><path d="M8.5 8.5c.3-.4.6-.4.8-.2l1.3 1.6c.2.2.1.5-.1.7l-.7.8c.8 1.4 1.9 2.5 3.3 3.2l.7-.7c.2-.2.5-.2.7-.1l1.8 1c.3.2.3.6.1.9-.5.7-1.3 1.1-2.3 1-3-.2-6.3-3.5-6.5-6.4 0-.8.3-1.4.9-1.8z"/>',
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none"/>',
    facebook: '<path d="M14.5 21v-8h2.7l.4-3.3h-3.1V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3-.1-1.4-.2-2.6-.2-2.7 0-4.5 1.6-4.5 4.6v2.2H8V13h2.7v8z" fill="currentColor" stroke="none"/>',
    youtube: '<rect x="2.6" y="5.6" width="18.8" height="12.8" rx="3.6"/><path d="m10 8.8 5.6 3.2-5.6 3.2z" fill="currentColor" stroke="none"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="7.4" cy="8" r=".8" fill="currentColor" stroke="none"/><path d="M7.4 11v6M11.7 17v-6M11.7 13.1c0-3.2 5.1-3.3 5.1.3V17"/>'
  };
  const hosts = {
    instagram:['instagram.com'], facebook:['facebook.com','fb.com'],
    youtube:['youtube.com','youtu.be'], linkedin:['linkedin.com']
  };
  const labels = {whatsapp:'WhatsApp',instagram:'Instagram',facebook:'Facebook',youtube:'YouTube',linkedin:'LinkedIn'};
  const profiles = window.SHANERYN_SITE_CONFIG?.social || {};
  const platforms=['whatsapp','instagram','facebook','youtube','linkedin'];
  const getUrl = (name) => {
    try {
      if(name==='whatsapp'){
        const configured=String(window.SHANERYN_CONTACT?.whatsapp||profiles.whatsapp||'').trim();
        const fromLink=configured.match(/^https:\/\/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?(\d{10,15})/i);
        const digits=fromLink?.[1]||(!/https?:/i.test(configured)?configured.replace(/\D/g,''):'');
        return /^\d{10,15}$/.test(digits)?'https://wa.me/'+digits:'';
      }
      const input=String(profiles[name]||'').trim();
      if (!input) return '';
      const url = new URL(input);
      const domain=url.hostname.toLowerCase();
      if (url.protocol==='https:' && hosts[name].some(host=>domain===host || domain.endsWith('.'+host)) && url.pathname!=='/') return url.href;
    } catch { /* Invalid or missing URLs are not links. */ }
    return '';
  };
  const makeIcon = (name) => {
    const href=getUrl(name), label=labels[name];
    const node=document.createElement(href?'a':'span');
    node.className='v66-social-icon'+(href?'':' is-pending');
    if (href) {
      node.href=href;node.target='_blank';node.rel='noopener noreferrer';
      node.setAttribute('aria-label',name==='whatsapp'?'Chat with SHANERYN on WhatsApp (opens in new tab)':'SHANERYN on '+label+' (opens in new tab)');
      node.title=name==='whatsapp'?'Chat with SHANERYN on WhatsApp':'SHANERYN on '+label;
    } else {
      node.setAttribute('role','img');
      node.setAttribute('aria-label',label+' profile link pending');
      node.title=name==='whatsapp'?'Official WhatsApp number to be added in Global Settings':'Official '+label+' profile link to be added';
    }
    node.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">'+icons[name]+'</svg>';
    return node;
  };
  const fillIcons = (element) => { platforms.forEach(name=>element.appendChild(makeIcon(name))); };

  const masthead=document.querySelector('.site-footer .footer-masthead');
  if (masthead && !masthead.querySelector('.v66-social')) {
    const nav=document.createElement('nav');
    nav.className='v66-social';nav.setAttribute('aria-label','SHANERYN social media');
    fillIcons(nav);
    const divider=masthead.querySelector('.footer-rule');
    if (divider) masthead.insertBefore(nav,divider); else masthead.appendChild(nav);
  }

  const contactNav=document.getElementById('v67-contact-social');
  if (contactNav && !contactNav.children.length) fillIcons(contactNav);
  const note=document.getElementById('v67-social-note');
  if (note) note.hidden=platforms.every(name=>Boolean(getUrl(name)));

  // A prior prototype had a misspelled contact email; never propagate a guessed inbox.
  const email=String(window.SHANERYN_CONTACT?.email||'').trim();
  const verified=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  document.querySelectorAll('[data-v67-contact-email-link]').forEach(link=>{
    if (!verified) return;
    link.href='mailto:'+email;
    link.textContent=email;
    link.setAttribute('aria-label','Email SHANERYN at '+email);
  });
  const contactAddress=document.getElementById('v67-contact-email');
  if (contactAddress && verified) {
    const a=document.createElement('a');a.className='cv3-email';a.href='mailto:'+email;
    a.textContent=email;contactAddress.replaceChildren(a);
  }
})();
