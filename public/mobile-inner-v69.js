/* SHANERYN V6.9 — Inner-page behaviours (no homepage hooks). */
(() => {
  'use strict';
  const contact=document.body?.dataset.page==='contact-page';
  if(contact){
    const buttons=[...document.querySelectorAll('[data-v69-contact-tab]')];
    const panels=[...document.querySelectorAll('[data-v69-contact-panel]')];
    const show=(mode,shouldScroll=false)=>{
      if(mode!=='enquiry' && mode!=='appointment')mode='enquiry';
      panels.forEach(panel=>{panel.hidden=panel.dataset.v69ContactPanel!==mode;});
      buttons.forEach(button=>{
        const active=button.dataset.v69ContactTab===mode;
        button.classList.toggle('is-selected',active);
        button.setAttribute('aria-pressed',String(active));
      });
      if(shouldScroll){
        const choices=document.querySelector('.v69-contact-choices');
        choices?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
      }
    };
    buttons.forEach(button=>button.addEventListener('click',()=>show(button.dataset.v69ContactTab,true)));
    const query=new URLSearchParams(window.location.search);
    const requested=query.get('mode')==='appointment' || window.location.hash==='#book-appointment';
    show(requested?'appointment':'enquiry');
    window.addEventListener('hashchange',()=>{
      if(location.hash==='#book-appointment')show('appointment');
      else if(location.hash==='#contact-request')show('enquiry');
    });
  }
  if(document.body?.dataset.page==='collections'){
    const control=document.getElementById('v69-filter-toggle');
    const panel=document.getElementById('v69-filter-tools');
    if(control && panel){
      control.addEventListener('click',()=>{
        const expanded=control.getAttribute('aria-expanded')==='true';
        control.setAttribute('aria-expanded',String(!expanded));
        panel.classList.toggle('v69-is-open',!expanded);
        const symbol=control.querySelector('.v69-filter-symbol');
        if(symbol) symbol.textContent=expanded?'+':'−';
        // Do not open the keyboard automatically; users can tap the search field.
      });
      // If browser restores a search/filter value on back navigation, reveal its controls.
      const search=panel.querySelector('#look-search');
      const occasion=panel.querySelector('#occasion-filter');
      if((search?.value||'').trim()||(occasion?.value&&occasion.value!=='all')){
        panel.classList.add('v69-is-open');control.setAttribute('aria-expanded','true');
        const symbol=control.querySelector('.v69-filter-symbol');if(symbol)symbol.textContent='−';
      }
    }
  }
})();
