/* Optional safe preview channel; only listens to same-origin parent frames. */
(()=>{if(window.parent===window)return;
 window.addEventListener('message',ev=>{
  if(ev.origin!==location.origin||ev.data?.type!=='shaneryn-cms-preview')return;
  const {patches={},sectionSettings={},heroImages={}}=ev.data;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_COMMENT);
  while(walker.nextNode()){const comment=walker.currentNode,id=String(comment.data||'');if(!id.startsWith('cms:'))continue;const patch=patches[id.slice(4)];if(patch&&comment.nextSibling?.nodeType===Node.TEXT_NODE)comment.nextSibling.textContent=patch.visible===false?'':String(patch.value??'')}
  for(const [id,patch] of Object.entries(patches)){const el=document.querySelector(`[data-cms-src="${id}"],[data-cms-href="${id}"],[data-cms-background="${id}"],[data-cms-visibility="${id}"]`);if(!el||!patch)continue;if(el.hasAttribute('data-cms-src'))el.setAttribute('src',patch.value||'');else if(el.hasAttribute('data-cms-href'))el.setAttribute('href',patch.value||'#');else if(el.hasAttribute('data-cms-background'))el.style.backgroundImage=`url(${JSON.stringify(patch.value||'')})`;else el.style.display=patch.visible===false||patch.value===false?'none':''}
  if(heroImages.mobile||heroImages.desktop){const banner=document.querySelector('#hero-image');const src=(window.matchMedia('(max-width:720px)').matches?heroImages.mobile||heroImages.desktop:heroImages.desktop||heroImages.mobile);if(banner&&src)banner.style.backgroundImage='url('+JSON.stringify(src)+')'}
  for(const [id,p] of Object.entries(sectionSettings)){const section=document.querySelector(`[data-cms-section="${id}"]`);if(section)section.style.setProperty('display',p.visible===false?'none':'','important')}
 });
 document.addEventListener('click',e=>{
  if(!window.frameElement)return;
  const target=e.target.closest('[data-cms-src],[data-cms-background],[data-cms-text-refs],[data-cms-href]');
  if(!target)return;
  e.preventDefault();e.stopPropagation();
  const id=target.getAttribute('data-cms-src')||target.getAttribute('data-cms-background')||target.getAttribute('data-cms-text-refs')?.split(' ')[0]||target.getAttribute('data-cms-href');
  if(id)window.parent.postMessage({type:'shaneryn-cms-select',id},location.origin);
 },true);
})();
