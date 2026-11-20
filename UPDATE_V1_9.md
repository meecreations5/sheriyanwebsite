# SHANERYN CMS V1.9 - Username and password without compulsory email

## What has changed

- Super Admin > Admin Users > Create Staff Account requires **Username**, **Password** and **Access Role** only.
- Firebase Authentication still uses its Email/Password provider, but the app generates a private internal login identifier (`staff.<username>@shanerynwesbite.firebaseapp.com`). **This is not a real mailbox.** Staff never enter it.
- New staff sign in at `/admin` with their chosen username and password.
- Existing administrators created with real email addresses retain their existing email/password login; their Firebase Auth account and Firestore UID do not change.
- Password changes are available via **Change Password** in the admin menu once logged in.
- The main admin session is preserved while the Super Admin creates another account through a secondary Firebase Auth instance.
- Admin permissions continue to be enforced by the existing `cms_users/{uid}` role documents and Firestore rules.

## Upgrade from V1.8

1. Extract the V1.9 changed-files ZIP over the root of your existing V1.8 project (the folder containing `package.json`).
2. Replace matching files and restart `npm run dev`.
3. Sign in using your existing admin credentials, then open **Admin Users** to create a new username/password staff account.
4. Sign out and sign in as the new staff account using only the username and password. Verify its assigned access role.

No new Firebase service, gcloud, key file, rules deployment, or manual UID entry is needed for this V1.9 patch. Firebase Authentication Email/Password must remain enabled. These updates do not change public website files or the mobile homepage.

## Security and limitations

- Username accounts have **no usable email inbox**: Firebase email/password reset links cannot be delivered to them. Staff can change their password while signed in. For forgotten passwords, a secure privileged reset process or account replacement must be arranged; this release does not silently promise password recovery.
- Creating new staff users from a browser SDK requires Firebase Authentication client sign-up to be enabled. A guessed/registered internal alias can prevent that username from being created, but cannot grant CMS access without an authorised Firestore role document. For production, consider a protected server-side staff creation endpoint to prevent username squatting and support admin password resets.
- Do not use the generated internal login identifier for notifications, contact details or customer correspondence.
- Do not share passwords over public chat or commit them to source code.
- The first Super Admin record remains the existing authorised Firebase account. Do not delete or disable it during migration.

## Verification

The included `npm run check:v19` checks username normalisation, deterministic identity mapping, invalid-name handling, account creation, staff login, legacy email compatibility and password-change wiring. Static checks cannot confirm a live Firebase Authentication operation; test on your connected project before deployment.
