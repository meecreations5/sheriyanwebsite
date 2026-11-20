/* SHANERYN V6.7 Contact Us: a request form, not an unverified live booking. */
(() => {
  'use strict';
  const form=document.getElementById('v67-appointment-form');
  if (!form) return;
  const $=(selector)=>form.querySelector(selector);
  const submit=$('#v67-book-submit');
  const status=$('#v67-appointment-status');
  const copyButton=$('#v67-book-copy');
  const date=$('#v67-book-date');
  const zone=$('#v67-book-zone');
  const email=String(window.SHANERYN_CONTACT?.email||'').trim();
  const emailReady=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (submit) submit.innerHTML='SEND APPOINTMENT REQUEST'+' <span aria-hidden="true">↗</span>';
  if(!emailReady && copyButton){copyButton.hidden=true;copyButton.style.display='none';}
  try {
    zone.value=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
  } catch { /* User can enter their timezone. */ }
  const localToday=()=>{
    const d=new Date();
    const pad=n=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  };
  date.min=localToday();

  const value=(name)=>String(new FormData(form).get(name)||'').trim();
  const summary=()=>[
    'SHANERYN / PRIVATE APPOINTMENT REQUEST',
    'Name: '+value('name'),
    'Email: '+value('email'),
    'Phone: '+(value('phone')||'Not supplied'),
    'Service: '+value('service'),
    'Preferred date: '+value('date'),
    'Preferred time: '+value('time'),
    'Time zone: '+value('timezone'),
    'Appointment type: '+value('mode'),
    '',
    'Additional details:',
    value('notes')||'None provided',
    '',
    'This is a preferred appointment request, subject to studio availability and confirmation.'
  ].join('\n');
  const valid=()=>{
    const today=localToday();
    if (date.value && date.value<today){
      date.setCustomValidity('Please choose today or a future date.');
    } else date.setCustomValidity('');
    if (!form.reportValidity()){
      status.textContent='Please complete all required fields and select a valid preferred date.';
      return false;
    }
    status.textContent='';return true;
  };
  date.addEventListener('change',()=>date.setCustomValidity(''));

  async function copyRequest(){
    const message=summary();
    try {
      if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(message);}
      else {
        const buffer=document.createElement('textarea');
        buffer.value=message;
        buffer.setAttribute('aria-hidden','true');
        buffer.style.position='fixed';buffer.style.left='-9999px';
        document.body.appendChild(buffer);buffer.select();
        const copied=document.execCommand('copy');buffer.remove();
        if(!copied) throw new Error('Clipboard unavailable');
      }
      status.textContent='Appointment request copied. Share it with the studio through its confirmed contact channel. No appointment has been booked.';
    } catch {
      status.textContent='Your request could not be copied automatically. Please use your browser to copy the details from the completed form.';
    }
  }
  $('#v67-book-copy').addEventListener('click',async()=>{if(valid())await copyRequest();});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!valid())return;
    if(emailReady){
      const subject='SHANERYN | Private appointment request — '+value('service');
      status.textContent='Opening an email draft. Review and SEND it to request an appointment. This is not a confirmed booking.';
      window.location.href=`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(summary())}`;
    } else await copyRequest();
  });
})();
