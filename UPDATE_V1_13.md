# SHANERYN CMS V1.13 — Public Menu / Password Reset Diagnostics

## Fix 1: Menu navigation not opening

V1.12 fixed serializing Firestore timestamps but the menu was still wired through a sequence of legacy JavaScript files. V1.13 attaches a small independent, delegated menu controller in the Next.js root layout, using `next/script` with `beforeInteractive`. It handles both `#menu-toggle` in the header and the mobile bottom `Menu` tab. The controller prevents double toggling by stopping conflicting legacy bubble handlers, sets `is-open` and accessible `aria-expanded`/`aria-hidden` attributes, handles scrim, Escape and link click closes. Original visuals and page content are unchanged.

## Fix 2: Password reset failures explained

Staff password resets are **Firebase Authentication** operations; `cms_users` stores only identity, roles and status. When a Super Admin clicks **Set New Password**, the current CMS calls `resetStaffPassword` Firebase Cloud Function in `asia-south1`. A source-code update alone cannot deploy this external Cloud Function.

V1.13 makes the error explicit and never claims the password changed on a failed request. It differentiates service-not-deployed, unavailable, unauthenticated, permission-denied, expired sign-in and internal errors.

- For admin accounts with a **real email address**, use **Send Reset Email**. This uses Firebase Authentication directly; no Cloud Function is needed.
- For **username-only** staff, the secure `resetStaffPassword` Function must be deployed **once** before Super Admin can directly set another user's new password. There is no secure way to view or edit the original password in Firestore.
- To deploy the existing function, run `firebase deploy --only functions:resetStaffPassword --project shanerynwesbite` using a Firebase account authorised for that project. Firebase Functions v2 deployments require billing enabled.
- If Cloud Functions deployment is not possible right now, create a replacement staff username via **Admin Users → Create User**, then disable the old account after transferring any assignments. This changes the username and should be treated as a fallback, not a password reset.
- For **your own account**, use **Change My Password** (requires current password) or email recovery when a real mailbox exists. The callable Function expressly blocks resetting your own account.

## Install locally

1. Apply the V1.13 changed-files ZIP over V1.12 (where `package.json` is).
2. Stop `npm run dev` with Ctrl+C.
3. Restart `npm run dev` and refresh the page. If you still see the previous script, delete `.next` and restart the dev server.
4. Test both the header menu and mobile bottom Menu tab.
5. Run `npm run check:v113` for the source checks.

No Firebase rules, database migrations, admin login changes, new service-account credentials or Cloud Functions deployment are required for **the menu fix**. **Password reset remains dependent on the remote function for username-only staff.**

## QA limits

The menu was tested with offline Chromium using the original page markup and CSS, with site.js / desktop-v47.js / mobile-v5.js loaded to simulate conflicting handlers. Live Next.js build and Firebase remote function deployment have not been verified.
