/* SHANERYN Look Detail V4.5: five verified images + a muted motion-preview video per look.
   No online checkout. Measurements reach the studio only after explicit submission;
   they are not persisted to browser storage. */
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
  const colourDot=$('#ld-colour-dot');if(colourDot)colourDot.style.background = colour[look.id] || '#bcaabb';
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
  const videoMedia=media.video?(ytId?`<div class="sh-external-video"><button type="button" data-sh-load-video="${esc(ytId)}" aria-label="Load ${esc(look.title)} video from YouTube">Play video on YouTube ↗</button></div>`:`<video id="ld-motion-video" src="${esc(media.video)}" poster="${esc(images[1]?.src||images[0]?.src||'')}" muted playsinline loop controls preload="metadata" aria-label="Film for ${esc(look.title)}"></video>`):'';
  // Final client sequence: three principal views, followed by video in equal
  // square frames. Remaining photographs appear in a separate detail strip.
  const mainViews=images.slice(0,3);
  const detailViews=images.slice(3);
  const mainLabels=['Front','Back','Profile'];
  gallery.innerHTML = mainViews.map((item,i) => `<figure class="ld-media-tile v119-primary-tile" data-ld-index="${i}">
    <button type="button" class="ld-photo-open" data-ld-open="${i}" aria-label="Enlarge ${esc(look.title)}: ${esc(item.alt||mainLabels[i])}">
      <img src="${esc(item.src)}" alt="${esc(look.title)} — ${esc(item.alt||mainLabels[i])}" loading="${i===0?'eager':'lazy'}" decoding="async" ${i===0?'fetchpriority="high"':''}/>
    </button><figcaption class="ld-photo-label">${String(i+1).padStart(2,'0')} / ${mainLabels[i]}</figcaption>
  </figure>`).join('') + (videoMedia ? `<figure class="ld-media-tile ld-film-tile v119-primary-tile" data-ld-index="${mainViews.length}">
    <span class="ld-film-kicker">04 / VIDEO</span>${videoMedia}
  </figure>` : '');
  const oldExtras=$('.v119-extra-media');if(oldExtras)oldExtras.remove();
  if(detailViews.length||Array.isArray(look.accessories)&&look.accessories.some(a=>a.visible!==false&&a.image)){
    const strips=document.createElement('div');strips.className='v119-extra-media';
    if(detailViews.length){strips.innerHTML='<section class="v119-detail-photos" aria-label="Detail photographs"><h2 class="v1195-details-heading">Details</h2><div class="v119-horizontal-media">'+detailViews.map((item,i)=>`<button type="button" class="v119-detail-tile" data-ld-open="${i+3}"><img loading="lazy" src="${esc(item.src)}" alt="${esc(item.alt||'Product detail')}"/><span>DETAIL ${String(i+1).padStart(2,'0')}</span></button>`).join('')+'</div></section>'}
    const accessories=Array.isArray(look.accessories)?look.accessories.filter(a=>a.visible!==false&&a.image):[];
    if(accessories.length){const fmt=raw=>{const t=String(raw||'').trim();return /^\d+(?:\.\d{1,2})?$/.test(t)?'₹'+Number(t).toLocaleString('en-IN'):t};
      strips.innerHTML+='<section class="v119-look-accessories" aria-label="Accessories"><p class="v119-eyebrow">ACCESSORIES</p><div class="v119-horizontal-media">'+accessories.map(a=>`<article class="v119-accessory-tile">${a.publicPath?`<a class="v1193-look-accessory-link" href="${esc(a.publicPath)}">`: ''}<img loading="lazy" src="${esc(a.image)}" alt="${esc(a.name||'Accessory')}"/>${a.publicPath?'</a>':''}<h3>${esc(a.name||'Accessory')}</h3>${a.price?`<p>${esc(fmt(a.price))}</p>`:''}${a.publicPath?`<a class="v1193-look-accessory-cta" href="${esc(a.publicPath)}">VIEW ACCESSORY ↗</a>`:''}</article>`).join('')+'</div></section>';
    }
    gallery.parentElement?.appendChild(strips);
  }
  $('#ld-gallery-total').textContent = String(mainViews.length).padStart(2,'0') + ' MAIN VIEWS' + (videoMedia?' + 01 VIDEO':'') + (detailViews.length?' · '+detailViews.length+' DETAILS':'');
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
  $$('[data-ld-open]').forEach(btn=>btn.addEventListener('click',()=>{
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
  document.querySelectorAll('#detail-related img').forEach(img=>{img.loading='lazy';});
  const measurePanel=$('#ld-measure-panel'), measureToggle=$('#ld-measure-toggle');
  measureToggle.addEventListener('click',()=>{
    const expanded=measureToggle.getAttribute('aria-expanded')==='true';
    measureToggle.setAttribute('aria-expanded',String(!expanded));measurePanel.hidden=expanded;
  });
  const groups=look.measurementGroups||{},fields=$('#ld-measure-fields');
  // Measurements remain in inches only. Never store values in browser storage.
  const canonicalInches=new Map();
  const unitName=()=> 'in';
  const round1=n=>Math.round((n+Number.EPSILON)*10)/10;
  function renderMeasures(){
    fields.innerHTML=Object.entries(groups).map(([group,names])=>`<fieldset class="ld-measure-fields-group"><legend>${esc(group)}</legend><div class="ld-measure-fields-grid">${names.map(name=>{
      const key=group+' / '+name;
      const base=canonicalInches.get(key);
      return `<label>${esc(name)} (in) <input type="number" inputmode="decimal" min="0.1" max="140" step="0.1" data-ld-measure="${esc(key)}" value="${esc(base==null?'':round1(base))}" placeholder="Optional" /></label>`;
    }).join('')}</div></fieldset>`).join('');
    $('#ld-measure-status').textContent='';
  }
  fields.addEventListener('input',event=>{
    const input=event.target.closest('[data-ld-measure]');
    if(!input)return;
    if(!input.value.trim()){canonicalInches.delete(input.dataset.ldMeasure);return;}
    if(!input.checkValidity())return;
    const value=Number(input.value);if(!Number.isFinite(value)||value<=0)return;
    canonicalInches.set(input.dataset.ldMeasure,value);
  });
  renderMeasures();
  window.SHANERYN_V48_LOOK_MEASUREMENTS=()=>{
    const values=[];
    $$('input[data-ld-measure]',fields).forEach(input=>{
      if(!input.value.trim()||!input.checkValidity())return;
      values.push(input.dataset.ldMeasure+': '+input.value+' in');
    });
    return values;
  };
  $('#ld-enquire-measures')?.addEventListener('click',async()=>{
    const values=window.SHANERYN_V48_LOOK_MEASUREMENTS?.()||[];
    const status=$('#ld-measure-status');
    const name=$('#ld-customer-name')?.value.trim()||'';
    const email=$('#ld-customer-email')?.value.trim()||'';
    const phone=$('#ld-customer-phone')?.value.trim()||'';
    if(!values.length){status.textContent='Please enter at least one valid measurement in inches.';fields.querySelector('input[data-ld-measure]')?.focus();return;}
    if(name.length<2){status.textContent='Please enter your name.';$('#ld-customer-name')?.focus();return;}
    if(!$('#ld-customer-email')?.checkValidity()||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){
      status.textContent='Please enter a valid email address.';$('#ld-customer-email')?.focus();return;
    }
    const button=$('#ld-enquire-measures');
    if(button.disabled)return;
    button.disabled=true;
    status.textContent='Submitting your measurements securely...';
    try{
      const message=['Measurements for '+look.title+' ('+(look.styleNumber||look.id)+')','Units: inches',...values].join('\n').slice(0,1600);
      const response=await fetch('/api/requests',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({kind:'enquiry',source:location.pathname,fields:{name,email,phone,look:look.id,message,measurementSummary:values.join(' | ').slice(0,1600)}})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.ok)throw Error(data.error||'Unable to submit measurements. Please try again.');
      status.textContent='Measurements submitted. Reference: '+data.reference+'. SHANERYN will contact you.';
      document.dispatchEvent(new CustomEvent('shaneryn:request-sent',{detail:{kind:'enquiry'}}));
    }catch(error){button.disabled=false;status.textContent=error.message||'Unable to submit measurements. Please try again.';}
  });
  $('#ld-copy-measures').addEventListener('click',async()=>{
    const values=$$('input[data-ld-measure]',fields).filter(x=>x.value.trim()).map(x=>x.dataset.ldMeasure+': '+x.value+' '+unitName());
    const status=$('#ld-measure-status');
    if(!values.length){status.textContent='Enter at least one measurement to copy.';return;}
    const text=['SHANERYN / '+look.title+' ('+(look.styleNumber||look.id)+')','Personal measurements ('+unitName()+'):',...values].join('\n');
    try{
      await navigator.clipboard.writeText(text);
      status.textContent='Measurement notes copied. Share them during your consultation.';
    }catch{
      status.textContent='Copy is unavailable here; please select and copy the measurements manually.';
    }
  });
})();
