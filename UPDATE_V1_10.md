# SHANERYN CMS V1.10 — Super Admin password reset

## Why this update is needed

V1.9 allowed an administrator to **change only their own** password, which required knowing the current password. The Admin Users module had no way to reset a colleague's password. Firebase's browser SDK cannot change someone else's password. Username-only staff accounts use internal Firebase sign-in identifiers with no real email inbox, so email reset links cannot reach them.

## What's new

1. **Admin Users → Reset Password** for any other staff member, including username-only users. The Super Admin can enter a new password or select **Generate Strong Password** and **Copy Password** to share it privately. Staff do not need their old password.
2. A protected **Firebase callable Cloud Function** checks that the caller is an active Super Admin, signed in recently, before using Firebase Admin SDK to update the selected account. The handler never saves passwords in Firestore or logs.
3. Rate limit of five password reset attempts per ten minutes per Super Admin, password-reset audit records and refresh token revocation.
4. The existing **Change Password** option remains for changing your own password when you know the current password. Forgotten **Super Admin** passwords for accounts created with real email addresses should be recovered through Firebase Console → Authentication → Users → Reset password.
5. All public website pages, content, products, V6.9 design and previous CMS features are retained. No Firestore or Storage rules changes.

## One-time deployment — no gcloud or private key on your PC

Firebase Cloud Functions requires a **Blaze (pay-as-you-go)** Firebase project and an authorised Firebase CLI login. These functions run on Google's servers; the Firebase Admin SDK uses the managed service credentials, not a locally downloaded key.

Open PowerShell in the Next.js project folder (with `firebase.json`):

```powershell
npm install --prefix functions
firebase deploy --only functions:resetStaffPassword --project shanerynwesbite
```

If `firebase` is not recognised, install the official Firebase CLI (`npm install -g firebase-tools`). If the CLI asks you to log in, use `firebase login`. **You do not need gcloud.** Do not deploy a Cloud Function before reviewing billing implications in Firebase Console.

After the successful function deployment, open `/admin`, sign in as Super Admin, go to **Admin Users**, choose another user and click **Reset Password**. This works from your local Next.js site as well, because the client calls the deployed secure function in the `asia-south1` region.

For installing the website changes, copy the V1.10 changed-files patch over V1.9 and restart `npm run dev`. Deploying only the function is separate from restarting the Next.js website.

## Recovering your original Super Admin password NOW

If that account has a **real email address** in Firebase Authentication, open:
https://console.firebase.google.com/project/shanerynwesbite/authentication/users

Find the account → three-dot menu → **Reset password**. Open the email and set a new password. Use the real email at `/admin`, not `superadmin` unless the account was originally created using username-only mode.

If your **only** Super Admin is a username-only account with a fake internal email, there is no valid inbox for an email reset. Neither this patch nor the new callable function can bypass authentication to recover a locked-out owner account. Recover access through Firebase Console by provisioning a new authorised account and matching `cms_users` role, then rotate/disable the old account as appropriate. This action must be performed by an owner of the Firebase project.

## Security notes

- The reset function requires an active `super_admin` Firestore role, a Firebase Auth session from the last 15 minutes, and a different existing staff UID. Do not expose its privileged Admin SDK credentials to browser code.
- A password update invalidates refresh tokens for that user; some existing short-lived ID tokens may remain active temporarily.
- Do not post passwords or account credentials in chat. Share generated staff passwords privately.
- Firestore collections `cms_password_reset_limits` and `cms_password_reset_audit` are server-only. Existing catch-all security rules deny browser access.

## Verification scope

V1.10 includes static UI checks and mocked handler tests for role authorisation, password validation, recent authentication, maximum reset frequency, Firebase Auth update, token revocation and no Firestore password storage. A live deployment and real Firebase roundtrip must still be tested on the user's own project.
