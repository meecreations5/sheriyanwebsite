/* SHANERYN inverse/original palette, persisted across Home and Collections. */
(() => {
  'use strict';
  const STORAGE_KEY = 'shaneryn_color_mode_v1';
  const root = document.documentElement;
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  function currentMode() { return root.dataset.colorMode === 'original' ? 'original' : 'inverse'; }
  function updateControls() {
    const inverse = currentMode() === 'inverse';
    document.querySelectorAll('[data-color-mode-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(inverse));
      button.setAttribute('aria-label', inverse ? 'Switch to original light palette' : 'Switch to inverse dark palette');
      button.title = inverse ? 'Original light colours' : 'Inverse dark colours';
      const label = button.querySelector('[data-color-mode-label]');
      if (label) label.textContent = inverse ? 'Light mode' : 'Dark mode';
    });
    if (metaTheme) metaTheme.content = inverse ? '#121016' : (document.body.classList.contains('theme-blush') ? '#fcf0f9' : '#ffffff');
  }
  function setMode(mode, persist = true) {
    root.dataset.colorMode = mode === 'original' ? 'original' : 'inverse';
    if (persist) { try { localStorage.setItem(STORAGE_KEY, currentMode()); } catch (_) {} }
    updateControls();
  }
  document.querySelectorAll('[data-color-mode-toggle]').forEach(button => {
    button.addEventListener('click', () => setMode(currentMode() === 'inverse' ? 'original' : 'inverse'));
  });
  window.addEventListener('storage', event => {
    if (event.key === STORAGE_KEY) setMode(event.newValue === 'original' ? 'original' : 'inverse', false);
  });
  updateControls();
})();
