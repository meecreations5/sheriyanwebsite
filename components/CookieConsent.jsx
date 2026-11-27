'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {usePathname} from 'next/navigation';
import {applyAnalyticsConsent} from '@/lib/analytics-client';
import {buildConsent, CONSENT_KEY, readConsent} from '@/lib/consent-preferences';
export default function CookieConsent() {
  const pathname = usePathname() || '/';
  const admin = pathname.startsWith('/admin');
  const preview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('cmsPreview');
  const [ready,setReady] = useState(false);
  const [consent,setConsent] = useState(null);
  const [settingsOpen,setSettingsOpen] = useState(false);
  const [analyticsChoice,setAnalyticsChoice] = useState(false);
  const preferenceButton = useRef(null);
  const closeButton = useRef(null);
  const save = useCallback((approved) => {
    const choice = buildConsent(approved);
    try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify(choice)); } catch {}
    setConsent(choice);
    setAnalyticsChoice(choice.analytics);
    setSettingsOpen(false);
    window.dispatchEvent(new CustomEvent('shaneryn:consent-updated',{detail:choice}));
    applyAnalyticsConsent(choice.analytics);
    preferenceButton.current?.focus();
  },[]);
  useEffect(() => {
    if(admin || preview) return;
    const initial = readConsent(window.localStorage);
    setConsent(initial);
    setAnalyticsChoice(initial?.analytics || false);
    setReady(true);
    const open = () => { setAnalyticsChoice(readConsent(window.localStorage)?.analytics || false); setSettingsOpen(true); };
    const onLink = (e) => {
      const link = e.target.closest('[data-sh-cookie-preferences]');
      if(!link) return;
      e.preventDefault();
      open();
    };
    document.addEventListener('click',onLink);
    window.addEventListener('shaneryn:open-cookie-preferences',open);
    if(location.hash === '#cookie-preferences') open();
    return () => {
      document.removeEventListener('click',onLink);
      window.removeEventListener('shaneryn:open-cookie-preferences',open);
    };
  },[pathname,admin,preview]);
  useEffect(() => { if(settingsOpen) closeButton.current?.focus(); },[settingsOpen]);
  useEffect(() => {
    if(admin || preview) return;
    // The legacy page footer is CMS-generated. Append links without altering
    // any editable CMS text/element. The Contact and Story pages share this footer.
    const footer=document.querySelector('.site-footer .footer-bottom, footer .footer-bottom');
    if(!footer) return;
    let group=footer.querySelector('[data-sh-legal-links]');
    if(!group){
      group=document.createElement('span'); group.className='sh-legal-footer'; group.dataset.shLegalLinks='true';
      group.innerHTML='<a href="/privacy">Privacy</a><a href="/cookies">Cookies</a><a href="/terms">Terms</a><button type="button" data-sh-cookie-preferences>Cookie preferences</button>';
      footer.appendChild(group);
    }
    return () => { if(group?.parentElement) group.remove(); };
  },[pathname,admin,preview,ready]);
  if(admin || preview || !ready) return null;
  return <div className="sh-consent-root">
    {!consent && !settingsOpen && <section className="sh-consent-banner" aria-label="Cookie choices" role="region">
      <div className="sh-consent-copy"><span className="sh-consent-kicker">YOUR PRIVACY, YOUR CHOICE</span>
        <h2>Cookies & privacy</h2>
        <p>We use essential storage for site features such as Saved Looks. With your permission, Firebase Analytics helps us understand site visits. Optional analytics is off until you choose to accept it.</p>
        <p className="sh-consent-links"><a href="/privacy">Privacy policy</a><a href="/cookies">Cookie details</a></p>
      </div>
      <div className="sh-consent-actions">
        <button type="button" onClick={()=>save(false)} className="sh-consent-btn sh-consent-filled">Reject optional</button>
        <button type="button" onClick={()=>save(true)} className="sh-consent-btn sh-consent-filled">Accept analytics</button>
        <button type="button" onClick={()=>setSettingsOpen(true)} className="sh-consent-btn sh-consent-outline">Preferences</button>
      </div>
    </section>}
    {settingsOpen && <div className="sh-consent-scrim" role="presentation">
      <section className="sh-consent-panel" role="dialog" aria-modal="true" aria-labelledby="sh-consent-title" onKeyDown={event=>{
        if(event.key==='Escape'){event.preventDefault();setSettingsOpen(false)}
        if(event.key!=='Tab')return;
        const focusables=[...event.currentTarget.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')];
        if(!focusables.length)return;
        const first=focusables[0],last=focusables[focusables.length-1];
        if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
      }}>
        <button ref={closeButton} type="button" className="sh-consent-close" aria-label="Close cookie preferences" onClick={()=>setSettingsOpen(false)}>×</button>
        <span className="sh-consent-kicker">SHANERYN / PRIVACY</span>
        <h2 id="sh-consent-title">Cookie preferences</h2>
        <p>Choose whether to allow optional analytics. You can change this choice at any time from the page footer.</p>
        <div className="sh-consent-option"><div><strong>Essential site storage</strong><small>Saved Looks, remembering your choice and secure admin access. Always active.</small></div><span className="sh-consent-required">Always on</span></div>
        <label className="sh-consent-option" htmlFor="sh-consent-analytics"><span><strong>Site usage analytics</strong><small>Firebase Analytics may store first-party analytics cookies and send visit information to Google.</small></span><input id="sh-consent-analytics" type="checkbox" checked={analyticsChoice} onChange={e=>setAnalyticsChoice(e.target.checked)}/></label>
        <p className="sh-consent-links"><a href="/privacy">Privacy policy</a> · <a href="/cookies">Cookie details</a></p>
        <div className="sh-consent-panel-actions"><button type="button" className="sh-consent-btn sh-consent-outline" onClick={()=>save(false)}>Reject optional</button><button type="button" className="sh-consent-btn sh-consent-filled" onClick={()=>save(analyticsChoice)}>Save choices</button></div>
      </section>
    </div>}
  </div>;
}
