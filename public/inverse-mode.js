/* SHANERYN V6.4 | Client-approved inverse palette only. */
(() => {
  'use strict';
  document.documentElement.dataset.colorMode = 'inverse';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', '#121016');
})();
