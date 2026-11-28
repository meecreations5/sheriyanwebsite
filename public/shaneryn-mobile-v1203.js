/* Mobile-only editorial composition and dedicated gallery viewport. */
(()=>{
 const root=document.querySelector('.shaneryn-public-site');if(!root||root.dataset.mobile1203)return;root.dataset.mobile1203='1';
 const $=s=>root.querySelector(s), narrow=matchMedia('(max-width:767px)');
 const available=e=>e&&!e.closest('[hidden],[aria-hidden="true"]');
 if(root.dataset.cmsPage==='index'){
  const visual=$('.founder-v55-visual'),title=visual?.querySelector('h2'),photo=visual?.querySelector('.founder-photo-full'),signature=$('.founder-letter .founder-signature');
  if(available(visual)&&available(photo)&&available(title)){
   const cover=document.createElement('div');cover.className='sh1203-founder-cover';
   const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),text=document.createElementNS(ns,'text');
   svg.setAttribute('viewBox','0 0 320 480');svg.setAttribute('preserveAspectRatio','none');svg.setAttribute('aria-hidden','true');svg.classList.add('sh1203-founder-type');
   text.setAttribute('transform','translate(74 5) rotate(90)');text.setAttribute('font-size','100');text.setAttribute('textLength','470');text.setAttribute('lengthAdjust','spacingAndGlyphs');text.textContent=title.textContent.trim().toUpperCase();svg.style.color=getComputedStyle(title).color;svg.style.fontFamily=getComputedStyle(title).fontFamily;svg.append(text);cover.append(svg);
   const portrait=document.createElement('figure');portrait.className='sh1203-founder-portrait';const img=photo.cloneNode(false);img.className='sh1203-founder-image';img.removeAttribute('data-cms-visibility');portrait.append(img);cover.append(portrait);
   if(available(signature)){const copy=signature.cloneNode(false);copy.className='sh1203-founder-signature';copy.alt='';copy.setAttribute('aria-hidden','true');cover.append(copy);cover.classList.add('sh1203-has-signature');}
   // The mobile editorial composition intentionally omits the designer caption.
   visual.after(cover);visual.parentElement.classList.add('sh1203-founder-ready');
  }
 }
 if(root.dataset.cmsPage!=='look')return;
 const main=$('main'),header=$('#site-header'),cta=$('#ld-mobile-cta'),gallery=$('.ld-gallery-side'),detail=$('.ld-details');
 if(!main||!header||!cta||!available(gallery)||!available(detail))return;
 const scroll=document.createElement('div');scroll.className='sh1203-look-scroll';scroll.tabIndex=0;scroll.setAttribute('role','region');scroll.setAttribute('aria-label','Look photographs and details');
 const panel=document.createElement('div');panel.className='sh1203-look-panel';
 const anchor=document.createComment('original purchase panel');cta.before(anchor);
 const entries=[];let mounted=false,panelHeight=0,frame=0;
 const footer=$('.site-footer'),dock=document.querySelector('.v5-tabbar');
 let footerMarker=null,dockMarker=null;
 const measurePanel=$('#ld-measure-panel');
 const syncDock=hide=>{
  const formActive=available(measurePanel)&&measurePanel.getBoundingClientRect().top<scroll.getBoundingClientRect().bottom&&measurePanel.getBoundingClientRect().bottom>scroll.getBoundingClientRect().top;
  const blocked=formActive||document.body.matches('.modal-open,.v5-input-focus,.v47-menu-open')||!!document.querySelector('.sh-consent-banner,.sh-consent-scrim,dialog[open]');
  if(dock){dock.hidden=!hide||blocked;dock.inert=dock.hidden;}
  document.body.classList.toggle('sh1207-after-gallery',hide);
  document.body.classList.toggle('sh1207-overlay-active',blocked);
 };
 const detailsButton=document.createElement('button');detailsButton.type='button';detailsButton.className='sh1203-panel-details';detailsButton.textContent='View details & measurements';
 const nav=$('.sh120-nav');
 const go=(node)=>{if(!node)return;const y=node.getBoundingClientRect().top-scroll.getBoundingClientRect().top+scroll.scrollTop-(nav?.offsetHeight||0);scroll.scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 detailsButton.addEventListener('click',()=>go(detail));
 const purchase=cta.querySelector('#ld-mobile-request'),inlinePurchase=$('#detail-enquire');
 const openMeasurement=event=>{const toggle=$('#ld-measure-toggle'),measure=$('.ld-made');if(!mounted||!available(toggle)||!available(measure)||!$('#ld-measure-fields input[data-ld-measure]')||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();event.stopImmediatePropagation();if(toggle.getAttribute('aria-expanded')!=='true')toggle.click();go(measure);};
 purchase?.addEventListener('click',openMeasurement,{capture:true});
 inlinePurchase?.addEventListener('click',openMeasurement,{capture:true});
 const syncNav=()=>{if(!nav||!mounted)return;const top=scroll.getBoundingClientRect().top+(nav.offsetHeight||0)+20;const targets=[gallery,$('.v119-detail-photos,.ld-product-information'),$('.ld-made'),$('.ep-related')].filter(available);let active=0;targets.forEach((x,i)=>{if(x.getBoundingClientRect().top<=top)active=i});[...nav.children].forEach((b,i)=>i===active?b.setAttribute('aria-current','location'):b.removeAttribute('aria-current'))};
 // Use the same hypothetical gallery viewport height in both panel states.
 // This prevents the expanded viewport from repeatedly toggling the panel.
 const syncPanel=()=>{if(!mounted)return;
  if(!panel.hidden&&panel.offsetHeight>0)panelHeight=panel.offsetHeight;
  const boundary=main.getBoundingClientRect().bottom-panelHeight;
  const galleryEnd=gallery.getBoundingClientRect().bottom;
  const hide=galleryEnd<=boundary+1;
  if(panel.hidden!==hide){panel.hidden=hide;panel.inert=hide;}
  syncDock(hide);
 };
 const queue=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;syncPanel();syncNav();});};
 scroll.addEventListener('scroll',queue,{passive:true});
 const stateObserver=new MutationObserver(queue);stateObserver.observe(document.body,{attributes:true,attributeFilter:['class'],childList:true});
 if(measurePanel)stateObserver.observe(measurePanel,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('focusin',queue);document.addEventListener('focusout',queue);
 const galleryObserver=new ResizeObserver(queue);galleryObserver.observe(gallery);
 const panelObserver=new ResizeObserver(queue);panelObserver.observe(panel);
 const layout=()=>{if(!mounted)return;const rect=header.getBoundingClientRect();main.style.setProperty('--sh1203-header-bottom',Math.max(0,rect.bottom)+'px');const vv=window.visualViewport;main.style.setProperty('--sh1203-viewport-bottom',Math.max(0,innerHeight-(vv?vv.height+vv.offsetTop:innerHeight))+'px');queue();};
 function mount(){if(mounted)return;mounted=true;
  // Move, never clone, live gallery/form/related nodes so existing listeners and entered values survive.
  for(const child of [...main.children]){if(child===cta||child.tagName==='DIALOG')continue;const marker=document.createComment('original section');child.before(marker);entries.push([child,marker]);scroll.append(child);}
  if(footer&&!scroll.contains(footer)){footerMarker=document.createComment('original footer');footer.before(footerMarker);scroll.append(footer);}
  panel.hidden=false;panel.inert=false;panelHeight=0;panel.append(detailsButton,cta);main.append(scroll,panel);
  if(dock){dockMarker=document.createComment('original mobile dock');dock.before(dockMarker);main.append(dock);dock.hidden=true;dock.inert=true;}main.classList.add('sh1203-look-ready');document.body.classList.add('sh1203-look-active');layout();syncPanel();syncNav();
 }
 function unmount(){if(!mounted)return;mounted=false;panel.hidden=false;panel.inert=false;
  if(footerMarker){footerMarker.replaceWith(footer);footerMarker=null;}
  if(dockMarker){dockMarker.replaceWith(dock);dockMarker=null;dock.hidden=false;dock.inert=false;}
  document.body.classList.remove('sh1207-after-gallery','sh1207-overlay-active');for(const [child,marker] of entries.splice(0)){marker.replaceWith(child)}anchor.after(cta);scroll.remove();panel.remove();main.classList.remove('sh1203-look-ready');document.body.classList.remove('sh1203-look-active');main.style.removeProperty('--sh1203-header-bottom');main.style.removeProperty('--sh1203-viewport-bottom');}
 const sync=()=>narrow.matches?mount():unmount();narrow.addEventListener('change',sync);window.addEventListener('resize',layout,{passive:true});window.visualViewport?.addEventListener('resize',layout,{passive:true});const headerObserver=new ResizeObserver(layout);headerObserver.observe(header);sync();
 // The legacy script's window-scroll handler is not the gallery scroll owner.
 // On mobile Buy it now reveals the live measurement form when available.
 // The original enquiry link remains the fallback and desktop behavior.
 root.addEventListener('shaneryn:legacy-cleanup',()=>{unmount();narrow.removeEventListener('change',sync);window.removeEventListener('resize',layout);window.visualViewport?.removeEventListener('resize',layout);headerObserver.disconnect();stateObserver.disconnect();document.removeEventListener('focusin',queue);document.removeEventListener('focusout',queue);galleryObserver.disconnect();panelObserver.disconnect();cancelAnimationFrame(frame);purchase?.removeEventListener('click',openMeasurement,{capture:true});inlinePurchase?.removeEventListener('click',openMeasurement,{capture:true});},{once:true});
})();
