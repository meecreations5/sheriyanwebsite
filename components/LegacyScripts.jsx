'use client';
import {useEffect} from 'react';
import {recordEvent} from '@/lib/analytics-client';
import {getYoutubeVideoId} from '@/lib/video-url';
const SKIP=new Set(['look-data.js','look-gallery-data.js','site-config.js','contact-config.js','new-drop.js']);
export default function LegacyScripts({scripts,products,settings,collections,curatedCollections=[],page,activeProductId,activeClothingCategoryId=null}){
 useEffect(()=>{
  let cancelled=false;const loaded=[];const legacyRoot=document.querySelector('.shaneryn-public-site');
  // Match the V6.9 browser data structures, without exposing Firestore credentials.
  document.body.dataset.page=page.bodyAttrs?.['data-page']||page.slug;
  document.body.classList.add(...String(page.bodyAttrs?.class||'theme-white').split(/\s+/).filter(Boolean));
  window.SHANERYN_LOOKS=products.filter(p=>p.visible!==false).map(p=>({...p,cat:p.cat==='Gowns'?'Statement Outfits':p.cat}));
  window.SHANERYN_CURATED_COLLECTIONS=curatedCollections.filter(c=>c.visible!==false).map(c=>({id:c.id,name:c.name}));
  window.SHANERYN_ACTIVE_LOOK_ID=activeProductId||null;
  window.SHANERYN_ACTIVE_CATEGORY_ID=activeClothingCategoryId||null;
  window.SHANERYN_CATEGORY_DEFINITIONS=collections.map(c=>({id:c.id,name:c.name,copy:c.copy||'',image:c.image||''}));
  window.SHANERYN_DETAIL_GALLERIES=Object.fromEntries(products.map(p=>[p.id,{images:(p.gallery?.length?p.gallery:[{src:p.catalogueImg||p.img,alt:'Front view'},{src:p.img||p.catalogueImg,alt:'Alternate view'}]).map(i=>({src:i.src,alt:i.alt||'Product photograph'})),video:p.video||''}]));
  window.SHANERYN_CATEGORIES=Object.fromEntries(collections.map(c=>[c.name==='Gowns'?'Statement Outfits':c.name,{copy:c.copy||'',image:(c.image||'').replace(/^assets\//,''),title:c.name==='Gowns'?'Statement Outfits':c.name}]));
  window.SHANERYN_VISIBLE_CATEGORIES=collections.map(c=>c.name==='Gowns'?'Statement Outfits':c.name);
  const heroField=page.fields?.find(f=>f.kind==='background'&&f.section==='s-000');
  const heroImage=(page.patches?.[heroField?.id]?.value||heroField?.value||'assets/hero-client-shaneryn7231.jpg').replace(/^assets\//,'');
  const heroDesktop=page.heroImages?.desktop||heroImage;
  const heroMobile=page.heroImages?.mobile||heroDesktop;
  const filmUrl=page.slug==='film'?(page.filmMedia?.url||''):'';
  window.SHANERYN_SITE_CONFIG={hero:{mode:'single',slides:[{desktop:heroDesktop,mobile:heroMobile,alt:page.heroImages?.alt||'SHANERYN fashion campaign'}]},fashionFilm:{youtubeId:getYoutubeVideoId(filmUrl),autoplayOnView:false},founder:{linkedin:settings.founderLinkedin||''},social:settings.social||{},studioAddress:settings.contact?.address||''};
  window.SHANERYN_CONTACT={email:settings.contact?.email||'',whatsapp:settings.contact?.whatsapp||''};
  const files=[...new Set((scripts||[]).filter(src=>src&&!SKIP.has(src)))];
  if(page.slug==='bespoke'&&!files.includes('contact-v67.js'))files.push('contact-v67.js');
  files.push('cms-public-forms.js','cms-preview.js','shaneryn-final-v119.js','shaneryn-feedback-v1195.js','shaneryn-mobile-v120.js','shaneryn-mobile-v1202.js','shaneryn-mobile-v1203.js');
  async function run(){for(const src of files){if(cancelled)break;await new Promise(resolve=>{const el=document.createElement('script');el.src='/'+src+(src==='shaneryn-mobile-v1203.js'?'?v=1207':'');el.dataset.cmsLegacy='true';el.async=false;el.onload=resolve;el.onerror=()=>{console.warn('Legacy script failed:',src);resolve()};document.body.appendChild(el);loaded.push(el)})}}
  run();
  const cmsPreview = new URLSearchParams(location.search).has('cmsPreview');
  if(!cmsPreview)recordEvent('page_view',{page_title:page.title,page_location:location.href});
  const onConsentChange=(event)=>{if(!cmsPreview&&event.detail?.analytics)recordEvent('page_view',{page_title:page.title,page_location:location.href});};
  window.addEventListener('shaneryn:consent-updated',onConsentChange);
  const onRequest=(e)=>!cmsPreview&&recordEvent('generate_lead',{method:e.detail?.kind||'enquiry'});
  const onProduct=(e)=>{const link=e.target.closest('a[href^="/look/"]');if(link&&!cmsPreview)recordEvent('select_item',{item_list_name:page.name})};
  document.addEventListener('shaneryn:request-sent',onRequest);
  document.addEventListener('click',onProduct);
  return()=>{cancelled=true;legacyRoot?.dispatchEvent(new Event('shaneryn:legacy-cleanup'));window.removeEventListener('shaneryn:consent-updated',onConsentChange);loaded.forEach(el=>el.remove());document.removeEventListener('shaneryn:request-sent',onRequest);document.removeEventListener('click',onProduct)};
 },[scripts,products,settings,collections,curatedCollections=[],page,activeProductId,activeClothingCategoryId]);
 return null;
}
