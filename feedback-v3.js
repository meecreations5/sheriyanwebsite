/* Collective feedback v3: verified founder, collection detail gallery, bespoke measurement demo,
   pending contact links and film autoplay-ready behavior live in site.js. */
(() => {
 'use strict';
 const $=(s,el=document)=>el.querySelector(s), all=(s,el=document)=>[...el.querySelectorAll(s)];
 const cfg=window.SHANERYN_SITE_CONFIG||{}, looks=window.SHANERYN_LOOKS||[];
 const itemById=id=>looks.find(x=>x.id===id);
 const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const card=p=>`<article class="ep-card"><a href="look.html?id=${encodeURIComponent(p.id)}" aria-label="View ${esc(p.title)}"><img loading="lazy" src="assets/${esc(p.img)}" alt="${esc(p.title)} SHANERYN look"></a><div class="ep-card-caption"><div><small>${esc(p.cat)}</small><h3><a href="look.html?id=${encodeURIComponent(p.id)}">${esc(p.title)}</a></h3><p>${esc(p.tagline||'')}</p></div><a href="look.html?id=${encodeURIComponent(p.id)}" aria-label="View look details">↗</a></div></article>`;
 // Exact supplied look names and taglines on the redesigned detail page.
 if(document.body.dataset.page==='look'){
    const param=new URLSearchParams(location.search).get('id');
    const p=itemById(param)||looks[0];
    if(p){
      const set=(id,v)=>{const el=$(id);if(el)el.textContent=v;};
      set('#detail-title',p.title);set('#detail-breadcrumb',p.title.toUpperCase());
      set('#detail-code',p.id);set('#detail-tone',p.tone);set('#detail-category',p.cat);
      set('#detail-tagline',p.tagline);set('#detail-description',p.description);
      set('#detail-story',p.description+' The final fabric composition and care information will be confirmed by the studio.');
      set('#detail-pieces','Garment components: '+p.pieces.join(' + ')+'.');
      const hero=$('#detail-image'),crop=$('#detail-crop'),full=$('#detail-thumb-full'),detail=$('#detail-thumb-crop');
      for(const img of [hero,crop,full,detail]){if(img){img.src='assets/'+p.img;img.alt=p.title+' — SHANERYN outfit photograph';}}
      if(hero){hero.classList.toggle('photo-pending',!!p.photoPending)}
      const detailLink='bespoke.html?look='+encodeURIComponent(p.id)+'#measurement-studio';
      for(const id of ['#detail-bespoke','#detail-measure-link']){const e=$(id);if(e)e.href=detailLink;}
      const enquiry='contact.html?interest=Look%20Details&look='+encodeURIComponent(p.id);
      for(const id of ['#detail-enquire','#detail-details-request']){const e=$(id);if(e)e.href=enquiry;}
      const related=$('#detail-related');if(related)related.innerHTML=looks.filter(x=>x.id!==p.id).sort((a,b)=>Number(b.cat===p.cat)-Number(a.cat===p.cat)).slice(0,3).map(card).join('');
      all('[data-photo]').forEach(b=>b.addEventListener('click',()=>{
        const isDetail=b.dataset.photo==='detail';hero.classList.toggle('is-detail',isDetail);
        all('[data-photo]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        set('.cv3-image-note',isDetail?'Detail crop / image 02':'Full view / image 01');
      }));
      document.title='SHANERYN | '+p.title;
    }
 }
 // Original contact panel is retained until enquiry API/CMS exists.
 if(document.body.dataset.page==='contact-page'){
   const address=cfg.studioAddress?.trim();const map=$('.cv3-map-placeholder');
   if(address){
     const el=$('.cv3-contact-detail p');if(el)el.textContent=address;
     if(map){map.innerHTML='';const iframe=document.createElement('iframe');iframe.title='SHANERYN studio location';iframe.loading='lazy';iframe.referrerPolicy='no-referrer-when-downgrade';iframe.src='https://maps.google.com/maps?q='+encodeURIComponent(address)+'&output=embed';iframe.setAttribute('allowfullscreen','');map.append(iframe)}
   }
   const socials=Object.entries(cfg.social||{}).filter(([,url])=>/^https:\/\//.test(url||''));
   const holder=$('.cv3-contact-detail:last-child');
   if(holder&&socials.length){holder.querySelector('p').remove();for(const [name,url] of socials){const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent=name[0].toUpperCase()+name.slice(1)+' ↗';holder.append(a)}}
 }
 // Founder LinkedIn link: no fabricated link until profile is supplied.
 if(cfg.founder?.linkedin && /^https:\/\//.test(cfg.founder.linkedin)){
   all('.pending-link').forEach(span=>{if(!span.textContent.includes('LinkedIn'))return;const a=document.createElement('a');a.className='ep-text-link';a.href=cfg.founder.linkedin;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Connect on LinkedIn ↗';span.replaceWith(a)});
 }
 // Measurements: two data-driven paths. Review only, no network requests/storage.
 const measures={
  'Full-length dress':{'Dress':['Length','Chest','Shoulder','Armhole','Waist','Hip','Sleeve length','Neck length']},
  'Capri pant':{'Capri Pant':['Waist','Hip','Thigh','Bottom round']},
  'Jacket':{'Jacket':['Chest','Armhole','Waist','Hip','Sleeve','Shoulder length']},
  'Pant':{'Pant':['Length','Waist','Hip','Thigh','Bottom round']},
  'Skirt':{'Skirt':['Skirt length','Waist','Hip']}
 };
 const select=$('#measure-select');
 if(select){
   const params=new URLSearchParams(location.search);
   let mode=params.has('look')?'look':'garment';
   const fieldRoot=$('#cv3-measure-fields'),form=$('#cv3-measure-form'),review=$('#cv3-measure-review');
   const selectedByMode={garment:'Full-length dress',look:itemById(params.get('look'))?.title||looks[0]?.title};
   const valueStore=new Map(); // values in inches, per garment/SHANERYN look
   const options=()=>mode==='garment'?Object.keys(measures):looks.map(x=>x.title);
   const currentGroups=()=>mode==='garment'?measures[select.value]:looks.find(x=>x.title===select.value)?.measurementGroups;
   const unit=()=>document.querySelector('input[name="measure-unit"]:checked')?.value||'in';
   const round1=n=>Math.round((n+Number.EPSILON)*10)/10;
   const scope=()=>mode+'::'+select.value+'::';
   function fields(){
     review.hidden=true;
     const groups=currentGroups()||{};
     fieldRoot.innerHTML=Object.entries(groups).map(([group,names])=>`<fieldset class="cv3-measure-group"><legend>${esc(group)}</legend><div class="cv3-measure-fields">${names.map(name=>{
       const key=group+' / '+name,stored=valueStore.get(scope()+key);
       const value=stored==null?'':round1(unit()==='cm'?stored*2.54:stored);
       const htmlId='meas-'+(mode+'-'+select.value+'-'+key).replace(/[^a-zA-Z0-9]+/g,'-').toLowerCase();
       return `<label for="${htmlId}">${esc(name)} <span>(${unit()})</span><input id="${htmlId}" name="${esc(key)}" data-measure-key="${esc(key)}" type="number" step="0.1" min="0.1" max="${unit()==='cm'?350:140}" inputmode="decimal" placeholder="Optional" value="${esc(value)}"></label>`;
     }).join('')}</div></fieldset>`).join('');
     const status=$('#cv3-unit-hint');if(status)status.textContent='Enter measurements in '+(unit()==='cm'?'centimetres':'inches')+'. Values are converted when you switch units.';
   }
   fieldRoot.addEventListener('input',event=>{
     const input=event.target.closest('input[data-measure-key]');if(!input)return;
     const key=scope()+input.dataset.measureKey;
     if(!input.value.trim()){valueStore.delete(key);return;}
     if(!input.checkValidity())return;
     const n=Number(input.value);if(Number.isFinite(n)&&n>0)valueStore.set(key,unit()==='cm'?n/2.54:n);
   });
   function buildOptions(){
     const current=selectedByMode[mode];
     select.innerHTML=options().map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
     if(options().includes(current))select.value=current;
     selectedByMode[mode]=select.value;
     all('[data-measure-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.measureMode===mode)));
     fields();
   }
   all('[data-measure-mode]').forEach(b=>b.addEventListener('click',()=>{
     if(mode===b.dataset.measureMode)return;
     selectedByMode[mode]=select.value;mode=b.dataset.measureMode;buildOptions();
   }));
   select.addEventListener('change',()=>{selectedByMode[mode]=select.value;fields()});
   all('input[name="measure-unit"]').forEach(b=>b.addEventListener('change',fields));
   form.addEventListener('submit',e=>{
     e.preventDefault();
     const inputs=all('input[data-measure-key]',fieldRoot);
     if(!form.checkValidity()){inputs.find(x=>!x.checkValidity())?.reportValidity();return;}
     const lines=inputs.filter(x=>x.value.trim()).map(x=>`${x.dataset.measureKey}: ${x.value} ${unit()}`);
     if(!lines.length){inputs[0]?.focus();const hint=$('#cv3-unit-hint');if(hint)hint.textContent='Enter at least one measurement before reviewing.';return;}
     const title=mode==='garment'?'Custom garment: ':'SHANERYN look: ';
     $('#cv3-measure-summary').textContent=[title+select.value,'Measurements in '+(unit()==='in'?'inches':'centimetres'),'',...lines].join('\n');
     review.hidden=false;
     review.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'});
   });
   $('#cv3-measure-copy').addEventListener('click',async()=>{
     const text=$('#cv3-measure-summary').textContent;
     try{await navigator.clipboard.writeText(text);$('#cv3-measure-status').textContent='Summary copied to clipboard.'}
     catch{$('#cv3-measure-status').textContent='Copy is unavailable here. Select the summary text above.'}
   });
   buildOptions();
 }
})();
