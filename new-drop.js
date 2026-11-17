/* Approved two-column New Drop layout: real supplied looks, same carousel interaction. */
(() => {
 'use strict';
 const section=document.querySelector('[data-new-drop]'); if(!section)return;
 const slides=(window.SHANERYN_LOOKS||[]).filter(p=>p.newDrop && !p.photoPending);
 if(!slides.length)return;
 const image=section.querySelector('#new-drop-look-image'), name=section.querySelector('[data-new-drop-name]'),
 count=section.querySelector('[data-new-drop-count]'), enquire=section.querySelector('[data-open-inquiry]'),
 viewer=section.querySelector('.new-drop-viewer');
 if(!image || !viewer)return;
 let current=0,timer=null,start=null;
 const render=i=>{current=(i+slides.length)%slides.length;const p=slides[current];
 image.classList.add('is-changing');clearTimeout(timer);timer=setTimeout(()=>{
 image.src='assets/'+p.img;image.alt='SHANERYN '+p.title+' outfit photograph';name.textContent=p.title.toUpperCase();
 count.textContent=String(current+1).padStart(2,'0')+' / '+String(slides.length).padStart(2,'0');
 if(enquire)enquire.dataset.product=p.id;image.classList.remove('is-changing');
 },window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:150)};
 section.querySelector('[data-new-drop-prev]')?.addEventListener('click',()=>render(current-1));
 section.querySelector('[data-new-drop-next]')?.addEventListener('click',()=>render(current+1));
 viewer.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();render(current+(e.key==='ArrowRight'?1:-1))}});
 viewer.addEventListener('touchstart',e=>{start=e.touches[0]?.clientX??null},{passive:true});
 viewer.addEventListener('touchend',e=>{if(start===null)return;const d=e.changedTouches[0].clientX-start;if(Math.abs(d)>50)render(current+(d<0?1:-1));start=null},{passive:true});
 render(0);
})();
