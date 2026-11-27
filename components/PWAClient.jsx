'use client';
import {useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {readConsent} from '@/lib/consent-preferences';
export default function PWAClient() {
  const pathname=usePathname()||'/';
  const admin=pathname.startsWith('/admin');
  const preview=typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('cmsPreview');
  const [installEvent,setInstallEvent]=useState(null);
  const [ios,setIos]=useState(false);
  const [installed,setInstalled]=useState(false);
  const [showHelp,setShowHelp]=useState(false);
  const [choiceMade,setChoiceMade]=useState(false);
  const helpCloseRef=useRef(null);
  useEffect(()=>{
    if(admin||preview)return;
    setChoiceMade(Boolean(readConsent(window.localStorage)));
    const onConsent=()=>setChoiceMade(Boolean(readConsent(window.localStorage)));
    const isStandalone=window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
    setInstalled(isStandalone);
    // iPadOS can report a desktop Mac user agent while retaining iOS home-screen install.
    const isIos=(/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1)) && !isStandalone;
    setIos(isIos);
    const onPrompt=event=>{event.preventDefault();setInstallEvent(event);};
    const onInstalled=()=>{setInstalled(true);setInstallEvent(null);setShowHelp(false);};
    const onVideoClick=event=>{
      const button=event.target.closest('[data-sh-load-video]');
      if(!button)return;
      const id=button.getAttribute('data-sh-load-video')||'';
      if(!/^[a-zA-Z0-9_-]{11}$/.test(id))return;
      const shell=button.closest('.sh-external-video');
      if(!shell)return;
      const frame=document.createElement('iframe');frame.title='SHANERYN video';frame.allow='encrypted-media; picture-in-picture; autoplay';frame.allowFullscreen=true;frame.loading='lazy';
      frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(id)+'?rel=0';
      shell.replaceChildren(frame);
    };
    document.addEventListener('click',onVideoClick);
    window.addEventListener('beforeinstallprompt',onPrompt);
    window.addEventListener('appinstalled',onInstalled);
    window.addEventListener('shaneryn:consent-updated',onConsent);
    if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){
      navigator.serviceWorker.register('/sw.js',{scope:'/',updateViaCache:'none'}).catch(err=>console.warn('PWA installation unavailable:',err.message));
    }
    return()=>{document.removeEventListener('click',onVideoClick);window.removeEventListener('beforeinstallprompt',onPrompt);window.removeEventListener('appinstalled',onInstalled);window.removeEventListener('shaneryn:consent-updated',onConsent);};
  },[pathname,admin,preview]);
  useEffect(()=>{if(showHelp) helpCloseRef.current?.focus();},[showHelp]);
  const closeHelp=()=>setShowHelp(false);
  const onHelpKeyDown=event=>{
    if(event.key==='Escape'){event.preventDefault();closeHelp();return;}
    if(event.key!=='Tab')return;
    const items=[...event.currentTarget.querySelectorAll('button:not([disabled]),a[href]')];
    if(!items.length)return;
    if(event.shiftKey && document.activeElement===items[0]){event.preventDefault();items[items.length-1].focus();}
    else if(!event.shiftKey && document.activeElement===items[items.length-1]){event.preventDefault();items[0].focus();}
  };
  const install=async()=>{
    if(installEvent){
      try {await installEvent.prompt(); await installEvent.userChoice;}catch{}
      setInstallEvent(null);
    }else setShowHelp(true);
  };
  if(admin || preview || installed || !choiceMade || (!installEvent&&!ios)) return null;
  return <div className="sh-consent-root">
    <button type="button" className="sh-pwa-install" onClick={install} aria-label="Install SHANERYN on your device" aria-expanded={showHelp}>＋ <span>Install app</span></button>
    {showHelp&&<div className="sh-consent-scrim"><section className="sh-pwa-help" role="dialog" aria-modal="true" aria-label="Install SHANERYN" onKeyDown={onHelpKeyDown}>
      <button ref={helpCloseRef} className="sh-consent-close" type="button" onClick={closeHelp} aria-label="Close">×</button>
      <h2>Make SHANERYN your app</h2><p>Open this website in Safari, tap the Share icon, then choose <strong>Add to Home Screen</strong>.</p>
      <button className="sh-consent-btn sh-consent-filled" type="button" onClick={closeHelp}>Got it</button>
    </section></div>}
  </div>;
}
