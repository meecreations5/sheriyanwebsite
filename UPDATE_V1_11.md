# SHANERYN CMS V1.11 — Simple Admin Users

## What changed

- Admin Users now opens with a compact staff list. There are three primary actions: **Create User**, **Reset Password**, **Disable/Enable User**.
- The **Create User** form is hidden until needed. Staff require only username, password and role. Existing Firebase Authentication and Firestore account creation remain unchanged.
- Existing email-based staff can receive **Send Reset Email** directly using Firebase Authentication; no Cloud Function is needed for this email-link method. The email must be real and accessible to its owner.
- Username-only staff (no real email inbox) can be reset with **Set New Password**, using the secure callable `resetStaffPassword` Cloud Function included since V1.10. **The function must be deployed once**, and Firebase Blaze billing is required for deployment. This update does not remove that requirement.
- **Disable/Enable User** is a single action with confirmation before disabling. The current Super Admin cannot disable or demote themselves.
- Role changes remain available but are hidden under **Access Role**, to reduce clutter.
- The login screen explains the crucial difference between original email-based Super Admin accounts and newer username-based staff accounts. It does **not** automatically convert a legacy real-email Firebase Auth account to a username-only account.
- No passwords are displayed or written to `cms_users`. Firebase Authentication remains the authority for passwords.
- Public website pages and V6.9 design are unchanged.

## Install

If already using **V1.10**, extract the V1.11 changed-files ZIP directly over the directory containing `package.json`, replacing matching files. Restart with `npm run dev`. If updating from an older version, install the full V1.11 project instead.

**No new Firestore Rules or Firebase Functions changes are part of this patch.**

## Password reset service already in V1.10

If **Set New Password** reports the secure reset service missing, your Firebase Cloud Function was not deployed. An authorised developer must complete the one-time Firebase Functions deployment described in `UPDATE_V1_10.md`. A Firestore `password` field will not work and should never be created.

If you need to recover the **original Super Admin** login, use its **real email** shown under Firebase Console → Authentication → Users, then use **Forgot password?** on the login screen. Your Firestore `cms_users.username` field is a display name, not an Auth login alias for older accounts.

## Important limitations

- The ZIP is **not deployed** to your Firebase project. Staff creation, secure password-reset and email delivery require local/live acceptance tests.
- Existing real-email accounts need an accessible mailbox for reset links. Username-only staff need the callable backend for administrator-set passwords.
- We cannot access or reveal existing passwords in Firebase Authentication.
- The first locked-out Super Admin cannot reset themselves from an unauthenticated website screen. Use the real-email recovery flow or your project's authorised owner recovery process.

## QA

Static JSX source structure, existing V1.10 callable permission tests, package integrity, and previous CMS regression suites were checked locally. A complete Next.js build is unavailable in this environment because npm registry DNS resolution failed.
