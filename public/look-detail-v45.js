/* SHANERYN Look Detail V4.5: five verified images + a muted motion-preview video per look.
   No checkout, network form submission or persisted body measurements. */
(() => {
  'use strict';
  if (document.body.dataset.page !== 'look') return;
  const $ = (s,root=document) => root.querySelector(s);
  const $$ = (s,root=document) => [...root.querySelectorAll(s)];
  const looks = window.SHANERYN_LOOKS || [];
  const id = (window.SHANERYN_ACTIVE_LOOK_ID || new URLSearchParams(window.location.search).get('id'));
  const look = looks.find(x => x.id === id) || looks[0];
  const media = window.SHANERYN_DETAIL_GALLERIES?.[look?.id];
  const gallery = $('#ld-gallery');
  if (!look || !media || !gallery) return;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  // Structured garment information is server rendered, so it remains visible
  // without JavaScript. On mobile, start the optional sections collapsed.
  const details = $$('details.ld-product-detail-block');
  if(details.length){
    const mediaQuery=window.matchMedia('(max-width: 850px)');
    const setDisclosureMode=()=>details.forEach(section=>{section.open=!mediaQuery.matches;});
    setDisclosureMode();
    mediaQuery.addEventListener?.('change',setDisclosureMode);
  }
  const colour = {
    'SH-SUNSHINE':'#b8ab19','SH-STARLIGHT':'#f0eae2','SH-FIREHEART':'#af9172',
    'SH-DAWNDUSK':'#4f211f','SH-URASHIMA':'#17151a','SH-LOZEN':'#322fb0',
    'SH-BELLONA':'#b87f91','SH-BLAZE':'#af006a'
  };
  $('#ld-colour-dot').style.background = colour[look.id] || '#bcaabb';
  const images = media.images;
  const extractYoutube = input=>{
    try{const u=new URL(input);if(u.protocol!=='https:')return '';
      const host=u.hostname.toLowerCase();let id='';
      if(['youtu.be','www.youtu.be'].includes(host))id=u.pathname.split('/')[1];
      else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/)?.[1];
      return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?id:'';
    }catch{return ''}
  };
  const ytId=extractYoutube(media.video||'');
  const videoMedia=media.video?(ytId?`<iframe title="${esc(look.title)} film" src="https://www.youtube-nocookie.com/embed/${esc(ytId)}?rel=0" allow="encrypted-media; picture-in-picture" allowfullscreen loading="lazy" style="width:100%;aspect-ratio:9/16;border:0"></iframe>`:`<video id="ld-motion-video" src="${esc(media.video)}" poster="${esc(images[1]?.src||images[0]?.src||'')}" muted playsinline loop controls preload="metadata" aria-label="Film for ${esc(look.title)}"></video>`):'';
  gallery.innerHTML = images.map((item,i) => `<figure class="ld-media-tile" data-ld-index="${i}">
    <button type="button" class="ld-photo-open" data-ld-open="${i}" aria-label="Enlarge ${esc(look.title)}: ${esc(item.alt)}">
      <img src="${esc(item.src)}" alt="${esc(look.title)} — ${esc(item.alt)}" loading="eager" decoding="async" ${i===0?'fetchpriority="high"':''}/>
    </button><figcaption class="ld-photo-label">${String(i+1).padStart(2,'0')} / ${esc(item.alt)}</figcaption>
  </figure>`).join('') + (videoMedia ? `<figure class="ld-media-tile ld-film-tile" data-ld-index="${images.length}">
    <span class="ld-film-kicker">SHANERYN FILM / ${esc(look.title)}</span>
    ${videoMedia}
  </figure>` : '');
  $('#ld-gallery-total').textContent = String(images.length).padStart(2,'0') + ' PHOTOGRAPHS' + (videoMedia?' + 01 VIDEO':'');
  const tiles = $$('[data-ld-index]',gallery), counter = $('#ld-gallery-position');
  function moveTo(i){
    const count=tiles.length;
    i=Math.max(0,Math.min(count-1,i));
    gallery.scrollTo({left:tiles[i].offsetLeft - tiles[0].offsetLeft,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    counter.textContent=String(i+1).padStart(2,'0')+' / '+String(count).padStart(2,'0');
  }
  let active=0;
  const updateMobile=()=>{
    if (window.innerWidth>850) return;
    const idx=Math.max(0,Math.min(tiles.length-1,Math.round(gallery.scrollLeft/Math.max(1,gallery.clientWidth))));
    active=idx;counter.textContent=String(idx+1).padStart(2,'0')+' / '+String(tiles.length).padStart(2,'0');
  };
  $('#ld-gallery-prev')?.addEventListener('click',()=>moveTo(active-1));
  $('#ld-gallery-next')?.addEventListener('click',()=>moveTo(active+1));
  gallery.addEventListener('scroll',updateMobile,{passive:true});
  window.addEventListener('resize',updateMobile,{passive:true});
  updateMobile();
  // Local MP4/WebM files can play muted in view; YouTube remains a user-initiated embed.
  const video = $('#ld-motion-video');
  if(video){
    video.muted=true;
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const visible = entry.isIntersecting && entry.intersectionRatio>=0.5 && !document.hidden;
        if (visible) video.play().catch(()=>{});
        else video.pause();
      });
    },{threshold:[0,.5,.75]});
    observer.observe(video);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();});
  }
  // Image enlargement independent of the site's existing Saved Looks / lookbook modal.
  const dialog=$('#ld-zoom'),zoomImg=$('#ld-zoom-image');let zoomIndex=0;
  function zoomTo(i){
    zoomIndex=(i+images.length)%images.length;
    zoomImg.src=images[zoomIndex].src;
    zoomImg.alt=look.title+' — '+images[zoomIndex].alt;
    $('#ld-zoom-count').textContent=String(zoomIndex+1).padStart(2,'0')+' / '+String(images.length).padStart(2,'0');
  }
  $$('[data-ld-open]',gallery).forEach(btn=>btn.addEventListener('click',()=>{
    zoomTo(Number(btn.dataset.ldOpen));
    dialog.showModal();
  }));
  $('#ld-zoom-title').textContent=look.title+' / SHANERYN';
  $('#ld-zoom-close').addEventListener('click',()=>dialog.close());
  $('#ld-zoom-prev').addEventListener('click',()=>zoomTo(zoomIndex-1));
  $('#ld-zoom-next').addEventListener('click',()=>zoomTo(zoomIndex+1));
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'){e.preventDefault();zoomTo(zoomIndex-1)}
    if(e.key==='ArrowRight'){e.preventDefault();zoomTo(zoomIndex+1)}
  });
  // Keep related photos ready when the user reaches the next-look section.
  document.querySelectorAll('#detail-related img').forEach(img=>{img.loading='eager';});
  const measurePanel=$('#ld-measure-panel'), measureToggle=$('#ld-measure-toggle');
  measureToggle.addEventListener('click',()=>{
    const expanded=measureToggle.getAttribute('aria-expanded')==='true';
    measureToggle.setAttribute('aria-expanded',String(!expanded));measurePanel.hidden=expanded;
  });
  const groups=look.measurementGroups||{},fields=$('#ld-measure-fields');
  // Values are held in memory only, in inches. Changing the displayed unit does
  // not change a measurement's physical meaning or create rounding drift.
  const canonicalInches=new Map();
  const unit=()=>document.querySelector('input[name="ld-unit"]:checked')?.value||'in';
  const unitName=()=>unit()==='in'?'in':'cm';
  const round1=n=>Math.round((n+Number.EPSILON)*10)/10;
  function renderMeasures(){
    fields.innerHTML=Object.entries(groups).map(([group,names])=>`<fieldset class="ld-measure-fields-group"><legend>${esc(group)}</legend><div class="ld-measure-fields-grid">${names.map(name=>{
      const key=group+' / '+name;
      const base=canonicalInches.get(key);
      const value=base==null?'':round1(unit()==='cm'?base*2.54:base);
      return `<label>${esc(name)} (${unitName()}) <input type="number" inputmode="decimal" min="0.1" max="${unit()==='cm'?350:140}" step="0.1" data-ld-measure="${esc(key)}" value="${esc(value)}" placeholder="Optional" /></label>`;
    }).join('')}</div></fieldset>`).join('');
    $('#ld-measure-status').textContent=canonicalInches.size?'Values converted to '+(unit()==='cm'?'centimetres':'inches')+'.':'';
  }
  fields.addEventListener('input',event=>{
    const input=event.target.closest('[data-ld-measure]');
    if(!input)return;
    if(!input.value.trim()){canonicalInches.delete(input.dataset.ldMeasure);return;}
    if(!input.checkValidity())return;
    const value=Number(input.value);if(!Number.isFinite(value)||value<=0)return;
    canonicalInches.set(input.dataset.ldMeasure,unit()==='cm'?value/2.54:value);
  });
  renderMeasures();
  $$('input[name="ld-unit"]').forEach(r=>r.addEventListener('change',renderMeasures));
  // A temporary, one-use enquiry handoff is handled by ux-v48.js; no
  // body measurements are placed in a URL or permanently saved.
  window.SHANERYN_V48_LOOK_MEASUREMENTS=()=>{
    const values=[];
    $$('input[data-ld-measure]',fields).forEach(input=>{
      if(!input.value.trim()||!input.checkValidity())return;
      values.push(input.dataset.ldMeasure+': '+input.value+' '+unitName());
    });
    return values;
  };
  $('#ld-enquire-measures')?.addEventListener('click',()=>{
    const values=window.SHANERYN_V48_LOOK_MEASUREMENTS?.()||[];
    const status=$('#ld-measure-status');
    if(!values.length){
      if(status)status.textContent='Add at least one valid measurement to prepare an enquiry.';
      fields.querySelector('input[data-ld-measure]')?.focus();
      return;
    }
    const summary=['SHANERYN / '+look.title+' ('+look.id+')','Personal measurements ('+unitName()+'):',...values].join('\n');
    try{sessionStorage.setItem('shaneryn_v51_bespoke_once',JSON.stringify({time:Date.now(),summary}));}
    catch{if(status)status.textContent='Your browser could not carry the notes. Copy them first to include in your enquiry.';return;}
    window.location.href='contact.html?'+new URLSearchParams({interest:'Bespoke / Customisation',look:look.id}).toString();
  });
  $('#ld-copy-measures').addEventListener('click',async()=>{
    const values=$$('input[data-ld-measure]',fields).filter(x=>x.value.trim()).map(x=>x.dataset.ldMeasure+': '+x.value+' '+unitName());
    const status=$('#ld-measure-status');
    if(!values.length){status.textContent='Enter at least one measurement to copy.';return;}
    const text=['SHANERYN / '+look.title+' ('+look.id+')','Personal measurements ('+unitName()+'):',...values].join('\n');
    try{
      await navigator.clipboard.writeText(text);
      status.textContent='Measurement notes copied. Share them during your consultation.';
    }catch{
      status.textContent='Copy is unavailable here; please select and copy the measurements manually.';
    }
  });
})();
