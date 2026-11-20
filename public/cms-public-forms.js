/* SHANERYN CMS: attach actual Firestore-backed submissions to the approved V6.9 forms. */
(()=>{
 const selectors={'ep-contact-form':'enquiry','inquiry-form':'enquiry','v67-appointment-form':'appointment'};
 function clean(value){return String(value==null?'':value).slice(0,1600)}
 document.addEventListener('submit',async event=>{
  const form=event.target;if(!form||!selectors[form.id])return;
  event.preventDefault();event.stopImmediatePropagation();
  const kind=selectors[form.id];const fields=Object.fromEntries([...new FormData(form)].map(([k,v])=>[k,clean(v)]));
  const status=form.querySelector('#ep-contact-status,#v67-appointment-status,.modal-info,[role=status]');
  if(!form.checkValidity()){form.reportValidity();if(status)status.textContent='Please complete the required fields.';return}
  const button=form.querySelector('button[type="submit"]');if(button){button.disabled=true;button.dataset.cmsSending='1'}
  if(status)status.textContent='Sending your request securely…';
  try{
   const reply=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,fields,source:location.pathname+location.search})});
   const data=await reply.json();if(!reply.ok)throw new Error(data.error||'Could not submit your request');
   if(status)status.textContent=`Request received. Your reference is ${data.reference}. ${kind==='appointment'?'The studio will confirm availability.':'Our team will be in touch.'}`;
   document.dispatchEvent(new CustomEvent('shaneryn:request-sent',{detail:{kind}}));
   form.reset();
  }catch(err){if(status)status.textContent='Unable to send: '+err.message+'. Please try again.'}
  finally{if(button){button.disabled=false;delete button.dataset.cmsSending}}
 },true);
})();
