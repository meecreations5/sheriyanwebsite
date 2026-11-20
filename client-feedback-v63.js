/* SHANERYN V6.3 – archival image viewer and optional measurements deep link. */
(()=>{
  'use strict';
  const fromLook=new URLSearchParams(location.search).has('look')||new URLSearchParams(location.search).has('category');
  function scrollToMeasurements(){
    document.getElementById('measurement-studio')?.scrollIntoView({block:'start',behavior:'instant'});
  }
  if(location.hash==='#measurement-studio'||location.hash==='#measurement-guide'||fromLook){
    window.addEventListener('load',scrollToMeasurements,{once:true});
  }
  window.addEventListener('hashchange',()=>{
    if(location.hash==='#measurement-studio'||location.hash==='#measurement-guide')scrollToMeasurements();
  });
  const viewer=document.getElementById('v63-work-dialog');
  const image=document.getElementById('v63-work-expanded');
  const count=document.getElementById('v63-work-count');
  const buttons=Array.from(document.querySelectorAll('[data-work-index]'));
  if(!viewer||!image||!count||!buttons.length)return;
  let current=0,lastFocus=null;
  function show(index){
    current=(index+buttons.length)%buttons.length;
    const target=buttons[current].querySelector('img');
    if(!target)return;
    image.src=target.currentSrc||target.src;image.alt=target.alt;
    count.textContent=String(current+1).padStart(2,'0')+' / '+String(buttons.length).padStart(2,'0');
  }
  buttons.forEach((button,index)=>button.addEventListener('click',()=>{
    lastFocus=button;show(index);if(typeof viewer.showModal==='function')viewer.showModal();
  }));
  viewer.querySelector('[data-work-close]')?.addEventListener('click',()=>viewer.close());
  viewer.querySelector('[data-work-prev]')?.addEventListener('click',()=>show(current-1));
  viewer.querySelector('[data-work-next]')?.addEventListener('click',()=>show(current+1));
  viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close();});
  viewer.addEventListener('close',()=>lastFocus?.focus());
  viewer.addEventListener('keydown',event=>{
    if(event.key==='ArrowLeft'){event.preventDefault();show(current-1);}
    else if(event.key==='ArrowRight'){event.preventDefault();show(current+1);}
  });
})();
