/* SHANERYN V4.7 desktop usability layer; original catalogue and enquiry handlers untouched. */
(() => {
  'use strict';
  const menu = document.getElementById('mobile-menu');
  const trigger = document.getElementById('menu-toggle');
  const scrim = document.getElementById('v47-menu-scrim');
  const header = document.getElementById('site-header');
  if (!menu || !trigger) return;
  const updateHeaderHeight = () => {
    if (header) document.documentElement.style.setProperty('--v47-header-height', `${Math.round(header.getBoundingClientRect().height)}px`);
  };
  if (header && 'ResizeObserver' in window) new ResizeObserver(updateHeaderHeight).observe(header);
  window.addEventListener('resize', updateHeaderHeight, {passive:true});
  updateHeaderHeight();
  function syncMenu() {
    const open = menu.classList.contains('is-open');
    if (scrim) scrim.hidden = !open;
    document.body.classList.toggle('v47-menu-open', open);
    trigger.setAttribute('aria-expanded',String(open));
    trigger.setAttribute('aria-label',open?'Close menu':'Open menu');
    menu.setAttribute('aria-hidden',String(!open));
  }
  const closeMenu = () => {
    menu.classList.remove('is-open');
    syncMenu();
    trigger.focus();
  };
  trigger.addEventListener('click', syncMenu);
  menu.addEventListener('click', event => {
    if (event.target.closest('a,button')) syncMenu();
  });
  scrim?.addEventListener('click', closeMenu);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) {
      event.preventDefault();
      closeMenu();
    }
  });
  syncMenu();
  // Screen readers should hear correct singular/plural results after filtering.
  if (document.body.dataset.page === 'collections') {
    const counter = document.getElementById('look-count');
    if (counter && 'MutationObserver' in window) {
      const syncCount = () => {
        const number = parseInt(counter.textContent,10);
        if (Number.isFinite(number)) counter.setAttribute('aria-label', `${number} ${number===1?'look':'looks'} found`);
      };
      new MutationObserver(syncCount).observe(counter, {childList:true,characterData:true,subtree:true});
      syncCount();
    }
  }
  // Colour scheme should be accurately reflected by the browser chrome.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && 'MutationObserver' in window) {
    const updateTheme = () => meta.setAttribute('content',document.documentElement.dataset.colorMode==='inverse'?'#17131a':'#fdfbfc');
    new MutationObserver(updateTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-color-mode']});
    updateTheme();
  }
})();
