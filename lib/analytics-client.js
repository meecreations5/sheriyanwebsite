'use client';
import {firebaseApp} from '@/lib/firebase-client';
import {readConsent} from '@/lib/consent-preferences';
let instancePromise = null;
let analyticsSDKPromise = null;
function permitted() {
  if (typeof window === 'undefined') return false;
  return readConsent(window.localStorage)?.analytics === true;
}
function sdk() { return analyticsSDKPromise ||= import('firebase/analytics'); }
export async function analytics() {
  // Absolutely no Firebase Analytics initialization until explicit opt-in.
  if (!permitted()) return null;
  if (!instancePromise) instancePromise = sdk().then(async module => {
    if (!(await module.isSupported()) || !permitted()) return null;
    const instance = module.getAnalytics(firebaseApp);
    module.setAnalyticsCollectionEnabled(instance, permitted());
    return instance;
  }).catch(() => null);
  const instance = await instancePromise;
  return permitted() ? instance : null;
}
export async function recordEvent(name, params={}) {
  if (!permitted()) return;
  const instance = await analytics();
  if (!instance || !permitted()) return;
  const module = await sdk();
  if (permitted()) module.logEvent(instance, name, params);
}
export async function applyAnalyticsConsent(approved) {
  if (typeof window === 'undefined') return;
  // If Firebase Analytics was already initialized, immediately stop collection.
  if (instancePromise) {
    const instance = await instancePromise;
    if (instance) (await sdk()).setAnalyticsCollectionEnabled(instance, Boolean(approved) && permitted());
  } else if (approved && permitted()) await analytics();
  if (!approved) {
    // Remove accessible first-party Analytics cookies, not the admin session.
    try {
      for (const piece of document.cookie.split(';')) {
        const name = piece.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name) && name !== '_gid' && name !== '_gat') continue;
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax';
      }
    } catch {}
  }
}
