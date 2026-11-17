/* SHANERYN V4.9 editorial refinement layer.
   No new backend, no customer data collection, no payment or checkout. */
(() => {
 'use strict';
 const $ = q => document.querySelector(q);
 const page=document.body.dataset.page;
 if(page==='bespoke-page'){
   const help=$('#v49-measure-mode-help');
   const buttons=[...document.querySelectorAll('[data-measure-mode]')];
   const messages={
     garment:'A new design begins with the garment type. Enter only the measurements requested for that silhouette.',
     look:'Choose an existing SHANERYN look to discuss personalisation and individual fit.'
   };
   const refresh=()=>{
     if(!help)return;
     const active=buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.measureMode||'garment';
     help.textContent=messages[active];
   };
   buttons.forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(refresh)));
   refresh();
 }
 if(page==='contact-page'){
   const params=new URLSearchParams(location.search);
   const service=params.get('interest'),look=params.get('look');
   const context=$('#v49-contact-context');
   if(context && (service||look)){
     let text='Your enquiry is ready to personalise.';
     if(service && look)text=`You're enquiring about ${service}, regarding ${look}. You can edit every field before preparing an email.`;
     else if(service)text=`You're enquiring about ${service}. Please tell us what you have in mind.`;
     else if(look)text=`You're enquiring about ${look}. You can add any details or questions below.`;
     context.textContent=text;context.hidden=false;
   }
   // Let the user know exactly what the website will do before they type.
   const submit=$('#ep-contact-submit');
   if(submit){submit.setAttribute('aria-label','Open an email draft to SHANERYN (does not send automatically)');}
 }
})();
