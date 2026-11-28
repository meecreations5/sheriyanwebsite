/* Native document scrolling and reusable measurement guide viewer. */
(()=>{
 const root=document.querySelector('.shaneryn-public-site');if(!root||root.dataset.mobile1202)return;root.dataset.mobile1202='1';
 const $=s=>root.querySelector(s), narrow=matchMedia('(max-width:767px)');
 const guides=[...root.querySelectorAll('.v119-measuring-guide')];if(!guides.length)return;
 const dialog=document.createElement('dialog');dialog.className='sh1202-guide-dialog';dialog.setAttribute('aria-label','How to measure yourself');dialog.innerHTML='<div class="sh1202-guide-toolbar"><strong>How to Measure Yourself</strong><div><button type="button" data-zoom="-1" aria-label="Zoom out">−</button> <button type="button" data-zoom="1" aria-label="Zoom in">+</button> <button type="button" data-close aria-label="Close guide">×</button></div></div><div class="sh1202-guide-scroll"><img alt="Measurement guide"/></div>';document.body.append(dialog);
 const img=dialog.querySelector('img');let zoom=1,trigger=null,previousOverflow='';
 const apply=()=>{img.style.width=(zoom*100)+'%'};
 dialog.querySelectorAll('[data-zoom]').forEach(b=>b.addEventListener('click',()=>{zoom=Math.max(1,Math.min(3,zoom+Number(b.dataset.zoom)*.5));apply()}));
 dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;trigger?.focus()});
 guides.forEach(g=>{const b=g.querySelector('.sh1202-guide-open'),source=g.querySelector('img');if(!b||!source)return;b.addEventListener('click',()=>{trigger=b;img.src=source.currentSrc||source.src;img.alt=source.alt;zoom=1;apply();previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.sh1202-guide-scroll').scrollLeft=0;dialog.querySelector('[data-close]').focus()})});
})();
