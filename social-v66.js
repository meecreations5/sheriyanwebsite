/* V6.6 / Footer social links. Official profiles are configured in site-config.js.
 * Unconfigured platforms appear as non-clickable icons instead of invented links. */
(() => {
  'use strict';
  const masthead = document.querySelector('.site-footer .footer-masthead');
  if (!masthead || masthead.querySelector('.v66-social')) return;
  const icons = {
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none"/>',
    facebook: '<path d="M14.5 21v-8h2.7l.4-3.3h-3.1V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3-.1-1.4-.2-2.6-.2-2.7 0-4.5 1.6-4.5 4.6v2.2H8V13h2.7v8z" fill="currentColor" stroke="none"/>',
    youtube: '<rect x="2.6" y="5.6" width="18.8" height="12.8" rx="3.6"/><path d="m10 8.8 5.6 3.2-5.6 3.2z" fill="currentColor" stroke="none"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="2.5"/><circle cx="7.4" cy="8" r=".8" fill="currentColor" stroke="none"/><path d="M7.4 11v6M11.7 17v-6M11.7 13.1c0-3.2 5.1-3.3 5.1.3V17"/>'
  };
  const hosts = {
    instagram: ['instagram.com'],
    facebook: ['facebook.com','fb.com'],
    youtube: ['youtube.com','youtu.be'],
    linkedin: ['linkedin.com']
  };
  const profiles = window.SHANERYN_SITE_CONFIG?.social || {};
  const nav = document.createElement('nav');
  nav.className = 'v66-social';
  nav.setAttribute('aria-label','SHANERYN social media');
  for (const name of ['instagram','facebook','youtube','linkedin']) {
    const label = {instagram:'Instagram',facebook:'Facebook',youtube:'YouTube',linkedin:'LinkedIn'}[name];
    const svg = `<svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">${icons[name]}</svg>`;
    let href = '';
    try {
      const raw = String(profiles[name] || '').trim();
      if (raw) {
        const url = new URL(raw);
        const domain = url.hostname.toLowerCase();
        if (url.protocol === 'https:' && hosts[name].some(host => domain === host || domain.endsWith('.' + host)) && url.pathname !== '/') {
          href = url.href;
        }
      }
    } catch { /* Invalid or empty configuration stays visibly pending. */ }
    const element = document.createElement(href ? 'a' : 'span');
    element.className = 'v66-social-icon' + (href ? '' : ' is-pending');
    if (href) {
      element.href = href;
      element.target = '_blank';
      element.rel = 'noopener noreferrer';
      element.setAttribute('aria-label', 'SHANERYN on ' + label + ' (opens in new tab)');
      element.title = 'SHANERYN on ' + label;
    } else {
      element.setAttribute('role','img');
      element.setAttribute('aria-label', label + ' profile link pending');
      element.title = 'Official ' + label + ' profile link to be added';
    }
    element.innerHTML = svg;
    nav.appendChild(element);
  }
  const divider = masthead.querySelector('.footer-rule');
  if (divider) masthead.insertBefore(nav, divider);
  else masthead.appendChild(nav);
})();
