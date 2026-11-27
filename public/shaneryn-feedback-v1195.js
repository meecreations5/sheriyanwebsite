/* V1.19.5: customer inspiration uploads and Other garment choice. */
(()=>{
 'use strict';
 const LIMIT=3*1024*1024;
 for(const widget of document.querySelectorAll('.v1195-reference-upload')){
  const input=widget.querySelector('input[type="file"]'),preview=widget.querySelector('.v1195-reference-preview'),img=preview?.querySelector('img'),remove=preview?.querySelector('button'),message=widget.querySelector('.v1195-file-error');
  let url='';
  const clear=()=>{if(url){URL.revokeObjectURL(url);url=''};if(input)input.value='';if(preview)preview.hidden=true;if(img)img.removeAttribute('src');};
  input?.addEventListener('change',()=>{
   if(url){URL.revokeObjectURL(url);url=''};
   const file=input.files?.[0];if(!file){clear();return;}
   if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>LIMIT||!file.size){clear();message.textContent='Choose a JPG, PNG or WebP image smaller than 3 MB.';return;}
   message.textContent='';url=URL.createObjectURL(file);img.src=url;preview.hidden=false;
  });
  remove?.addEventListener('click',()=>{clear();message.textContent='Reference image removed.'});
  widget.closest('form')?.addEventListener('reset',()=>{clear();message.textContent=''});
 }
 // Require phone whenever the visitor selects a Bespoke enquiry, including Contact.
 for(const form of document.querySelectorAll('#ep-contact-form,#v67-appointment-form')){
  const phone=form.querySelector('[name="phone"]');if(!phone)continue;
  const sync=()=>{
   const service=form.querySelector('[name="service"],#contact-interest')?.value||'';
   const url=new URLSearchParams(location.search);
   const requested=/bespoke/i.test(service)||/bespoke/i.test(url.get('interest')||'')||/bespoke/i.test(location.pathname)||/bespoke/i.test(url.get('service')||'');
   phone.required=requested;
   phone.placeholder=requested?'Required for Bespoke':'Optional';
  };
  form.addEventListener('change',sync);
  form.addEventListener('click',()=>requestAnimationFrame(sync));
  sync();
 }
 const select=document.getElementById('measure-select'),label=document.getElementById('v119-bespoke-other-label'),other=document.getElementById('v119-bespoke-other');
 if(select&&label&&other){
  const update=()=>{const isGarment=[...document.querySelectorAll('[data-measure-mode]')].find(x=>x.getAttribute('aria-pressed')==='true')?.dataset.measureMode==='garment';const visible=isGarment&&select.value==='Other';label.hidden=!visible;other.required=visible;if(!visible)other.value=''};
  select.addEventListener('change',update);document.querySelectorAll('[data-measure-mode]').forEach(btn=>btn.addEventListener('click',()=>requestAnimationFrame(update)));update();
 }
})();
