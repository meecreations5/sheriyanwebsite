/* Final 25 Nov 2026 client feedback: explicit, server-backed customer requests. */
(()=>{
 'use strict';
 const qs=(s,root=document)=>root.querySelector(s);
 const all=(s,root=document)=>[...root.querySelectorAll(s)];
 const param=new URLSearchParams(location.search);
 const appointment=qs('#v67-appointment-form');
 if(appointment){
  const service=qs('#v67-book-service',appointment),mode=qs('#v67-book-mode',appointment);
  const allowed=['Bespoke','Color Analysis','Personal Styling','Occasion Styling'];
  const setService=value=>{
   if(!service||!allowed.includes(value))return;
   service.value=value;
   all('[data-v119-service]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.v119Service===value)));
   const studioOnly=/colou?r analysis/i.test(value);
   if(mode){
    all('option',mode).forEach(option=>{
     const isRemote=/online|video|phone/i.test(option.value||option.textContent);
     option.disabled=studioOnly&&isRemote;
    });
    if(studioOnly){const studio=all('option',mode).find(o=>/studio/i.test(o.value||o.textContent));if(studio)mode.value=studio.value||studio.textContent.trim();}
   }
   const message=qs('#v119-service-mode-note');if(message)message.textContent=studioOnly?'Color Analysis is available by in-studio appointment only.':'Choose your preferred in-studio or online appointment format.';
  };
  const note=document.createElement('p');note.id='v119-service-mode-note';note.className='v119-small-note';note.textContent='Your requested time is subject to studio confirmation.';
  mode?.closest('label')?.after(note);
  all('[data-v119-service]').forEach(button=>button.addEventListener('click',()=>{
   setService(button.dataset.v119Service);
   const target=qs('#book-appointment');target?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
  }));
  service?.addEventListener('change',()=>setService(service.value));
  const preselected=param.get('service');if(preselected)setService(preselected);
  if(param.get('mode')==='studio'&&mode){const studio=all('option',mode).find(x=>/studio/i.test(x.textContent));if(studio)mode.value=studio.value||studio.textContent.trim();}
  if(param.get('look')){const ref=appointment.elements.namedItem('lookReference');if(ref)ref.value=param.get('look');}
 }
 // Bespoke: send supplied inches and contact details securely to the existing CMS enquiry store.
 const send=qs('#v119-bespoke-submit');
 if(send){
  send.addEventListener('click',async()=>{
   const status=qs('#v119-bespoke-status');
   const name=qs('#v119-bespoke-name')?.value.trim()||'';
   const email=qs('#v119-bespoke-email')?.value.trim()||'';
   const phone=qs('#v119-bespoke-phone')?.value.trim()||'';
   const requirement=qs('#v119-bespoke-requirements')?.value.trim()||'';
   const occasion=qs('#v119-bespoke-occasion')?.value.trim()||'';
   const reference=qs('#v119-bespoke-reference')?.value.trim()||'';
   const measurements=all('#cv3-measure-fields input[data-measure-key]').filter(x=>x.value.trim()&&x.checkValidity()).map(x=>x.dataset.measureKey.replace(/Shoulder width/gi,'Shoulder')+': '+x.value.trim()+' in');
   if(name.length<2){status.textContent='Please enter your name.';qs('#v119-bespoke-name')?.focus();return}
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){status.textContent='Please enter a valid email address.';qs('#v119-bespoke-email')?.focus();return}
   if(!measurements.length&&!requirement&&!occasion){status.textContent='Please add measurements or describe your bespoke requirements.';qs('#v119-bespoke-requirements')?.focus();return}
   if(send.disabled)return;send.disabled=true;status.textContent='Sending your bespoke request securely…';
   const mode=all('[data-measure-mode]').find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.measureMode||'garment';
   const chosen=qs('#measure-select')?.value||'';
   const message=['Bespoke request',`Garment / Look: ${chosen}`,...(occasion?['Occasion / silhouette: '+occasion]:[]),...(requirement?['Requirements: '+requirement]:[]),'Units: inches',...measurements].join('\n').slice(0,1600);
   try{
    const res=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:'enquiry',source:location.pathname,fields:{name,email,phone,look:chosen,garmentType:mode,lookReference:reference,requirements:requirement,occasionWear:occasion,measurementSummary:measurements.join(' | ').slice(0,1600),message}})});
    const result=await res.json();if(!res.ok||!result.ok)throw Error(result.error||'Unable to submit');
    status.textContent='Request received. Your reference is '+result.reference+'. SHANERYN will contact you.';
    document.dispatchEvent(new CustomEvent('shaneryn:request-sent',{detail:{kind:'enquiry'}}));
   }catch(error){status.textContent='Unable to send: '+error.message+'. Please try again.'}finally{send.disabled=false}
  });
 }
})();
