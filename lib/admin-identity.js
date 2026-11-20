// Username/password UX backed by Firebase Authentication's Email/Password provider.
// Firebase requires an email-like identifier internally, but staff never enter one.
// This address is NOT a real mailbox and MUST NOT be used for password recovery.
const INTERNAL_DOMAIN = 'shanerynwesbite.firebaseapp.com';
const USERNAME_RE = /^[a-z0-9](?:[a-z0-9._-]{1,30})[a-z0-9]$/;

export function normalizeAdminUsername(value) {
  return String(value ?? '').trim().toLowerCase();
}

export function validAdminUsername(value) {
  const name = normalizeAdminUsername(value);
  return USERNAME_RE.test(name) && !name.includes('..');
}

export function usernameToAuthEmail(username) {
  const name = normalizeAdminUsername(username);
  if (!validAdminUsername(name)) {
    throw new Error('Use 3-32 characters: letters, numbers, dots, hyphens or underscores. Start and end with a letter or number; no consecutive dots.');
  }
  return `staff.${name}@${INTERNAL_DOMAIN}`;
}

export function isInternalStaffEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase();
  const suffix = '@' + INTERNAL_DOMAIN;
  if (!normalized.startsWith('staff.') || !normalized.endsWith(suffix)) return false;
  try { return normalized === usernameToAuthEmail(normalized.slice(6, -suffix.length)); } catch { return false; }
}

export function resolveAdminLogin(identifier) {
  const login = String(identifier ?? '').trim();
  // Keep the original email-password sign-in working for existing V1.8 staff.
  if (login.includes('@')) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login)) throw new Error('Enter a valid username or email address.');
    return login.toLowerCase();
  }
  return usernameToAuthEmail(login);
}
