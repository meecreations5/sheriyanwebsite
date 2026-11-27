// Browser-only preference helpers. Do not import this file from server pages.
export const CONSENT_KEY = 'shaneryn_consent_v1';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
export function readConsent(storage) {
  try {
    const raw = storage?.getItem(CONSENT_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (value?.version !== CONSENT_VERSION || typeof value.analytics !== 'boolean' || !Number.isFinite(value.decidedAt)) return null;
    if (Date.now() - value.decidedAt > CONSENT_MAX_AGE_MS || value.decidedAt > Date.now() + 60000) return null;
    return {version: CONSENT_VERSION, necessary: true, analytics: value.analytics, decidedAt: value.decidedAt};
  } catch { return null; }
}
export function buildConsent(analytics) {
  return {version: CONSENT_VERSION, necessary: true, analytics: Boolean(analytics), decidedAt: Date.now()};
}
