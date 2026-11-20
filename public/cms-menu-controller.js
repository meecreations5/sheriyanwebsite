/* SHANERYN V1.13: independent public-site menu controller.
   Loaded before React hydration. It intentionally owns the menu toggle so the
   menu remains usable even if another legacy CMS/portfolio script fails.
   Do not use this controller for the separate /admin navigation. */
(() => {
  'use strict';
  if (window.__SHANERYN_MENU_CONTROLLER_V113__) return;
  window.__SHANERYN_MENU_CONTROLLER_V113__ = true;

  const getMenu = () => document.getElementById('mobile-menu');
  const getTrigger = () => document.getElementById('menu-toggle');
  const getScrim = () => document.getElementById('v47-menu-scrim');
  const getDock = () => document.querySelector('.v5-tabbar [data-v5-tab="menu"]');
  const isOpen = () => Boolean(getMenu()?.classList.contains('is-open'));

  function updateMenu(open, focusTrigger = false) {
    const menu = getMenu();
    const trigger = getTrigger();
    if (!menu || !trigger) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    trigger.setAttribute('aria-expanded', String(open));
    trigger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    const dock = getDock();
    if (dock) {
      dock.classList.toggle('is-active', open);
      dock.setAttribute('aria-expanded', String(open));
    }
    const scrim = getScrim();
    if (scrim) scrim.hidden = !open;
    document.body.classList.toggle('v47-menu-open', open);
    if (!open && focusTrigger) trigger.focus();
  }

  // Capture before site.js / desktop-v47.js / mobile-v5.js bubble handlers.
  // Otherwise two handlers toggle the menu twice, leaving it closed.
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('#menu-toggle, .v5-tabbar [data-v5-tab="menu"]')) {
      if (!getMenu() || !getTrigger()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      updateMenu(!isOpen());
      return;
    }
    if (target.closest('#v47-menu-scrim')) {
      if (!isOpen()) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      updateMenu(false, true);
      return;
    }
    if (isOpen() && target.closest('#mobile-menu a[href]')) {
      // Allow normal link navigation; only close the drawer.
      updateMenu(false);
      return;
    }
    if (isOpen() && !target.closest('#mobile-menu, #site-header, .v5-tabbar')) {
      updateMenu(false);
    }
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      event.preventDefault();
      updateMenu(false, true);
    }
  }, true);

  // The Next.js App Router may swap the legacy DOM without reloading the layout.
  // Reset any stale body scroll lock after history navigation.
  window.addEventListener('popstate', () => updateMenu(false));
  window.addEventListener('pageshow', () => {
    if (getMenu() && getTrigger()) updateMenu(false);
    else document.body.classList.remove('v47-menu-open');
  });
})();
