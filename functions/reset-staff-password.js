// Privileged staff password reset. This file only runs inside Firebase Cloud Functions.
// The Firebase Web SDK cannot change another user's password.
const VALID_UID = /^[A-Za-z0-9_-]{5,128}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RESETS_PER_WINDOW = 5;
const MAX_AUTH_AGE_SECONDS = 15 * 60;

function createResetStaffPasswordHandler({db, auth, HttpsError, now = Date.now}) {
  return async function resetStaffPassword(request) {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Please sign in as a Super Admin.');
    }
    const actorUid = request.auth.uid;
    const authTime = Number(request.auth.token?.auth_time);
    const nowMs = now();
    if (!Number.isFinite(authTime) || authTime <= 0 ||
        nowMs / 1000 - authTime > MAX_AUTH_AGE_SECONDS ||
        authTime - nowMs / 1000 > 60) {
      throw new HttpsError('failed-precondition', 'For security, sign out and sign in again before resetting a staff password.');
    }

    const actor = await db.doc(`cms_users/${actorUid}`).get();
    if (!actor.exists || actor.data()?.active !== true || actor.data()?.role !== 'super_admin') {
      throw new HttpsError('permission-denied', 'Only an active Super Admin can reset staff passwords.');
    }

    const targetUid = String(request.data?.uid ?? '').trim();
    const newPassword = request.data?.newPassword;
    if (!VALID_UID.test(targetUid) || typeof newPassword !== 'string' ||
        newPassword.length < 12 || newPassword.length > 128) {
      throw new HttpsError('invalid-argument', 'Choose a staff account and a password between 12 and 128 characters.');
    }
    if (targetUid === actorUid) {
      throw new HttpsError('failed-precondition', 'Use Change My Password or your real-email recovery link for your own account.');
    }

    const target = await db.doc(`cms_users/${targetUid}`).get();
    if (!target.exists || !['super_admin', 'editor', 'products', 'enquiries', 'viewer'].includes(target.data()?.role)) {
      throw new HttpsError('not-found', 'The selected staff account no longer exists in the CMS.');
    }
    try {
      await auth.getUser(targetUid);
    } catch (error) {
      if (error?.code === 'auth/user-not-found') throw new HttpsError('not-found', 'The staff account was not found in Firebase Authentication.');
      throw error;
    }

    // Rate limit privileged resets per actor, in a server-only Firestore collection.
    const quotaRef = db.doc(`cms_password_reset_limits/${actorUid}`);
    await db.runTransaction(async transaction => {
      const current = await transaction.get(quotaRef);
      const previous = current.exists ? current.data() : {};
      const start = Number(previous?.windowStartedMs) || 0;
      const insideWindow = start > 0 && nowMs - start < WINDOW_MS;
      const count = insideWindow ? Number(previous?.count || 0) : 0;
      if (count >= MAX_RESETS_PER_WINDOW) {
        throw new HttpsError('resource-exhausted', 'Too many password resets. Try again later.');
      }
      transaction.set(quotaRef, {
        windowStartedMs: insideWindow ? start : nowMs,
        count: count + 1,
        lastAttemptMs: nowMs,
      });
    });

    // The new password is sent only to Firebase Authentication, never to Firestore or logs.
    await auth.updateUser(targetUid, {password: newPassword});
    await auth.revokeRefreshTokens(targetUid);
    try {
      await db.collection('cms_password_reset_audit').add({
        actorUid, targetUid, action: 'reset_password', performedAtMs: nowMs,
      });
    } catch (error) {
      // A logging outage must not make an already-applied password reset look like a failure.
      console.error('Password reset completed, but audit write failed:', error?.code || 'unknown');
    }
    return {ok: true};
  };
}

module.exports = {createResetStaffPasswordHandler};
