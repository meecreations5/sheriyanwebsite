> Historical V1.16 notes. **Superseded for first-admin setup by `UPDATE_V1_17.md`.** Do NOT use `CMS_INITIAL_ADMIN_*` variables on V1.17.

# SHANERYN CMS V1.16 — cms_users-only authentication, no Firebase Admin SDK

- The admin login screen is **Username + Password only**. There is no First-time Setup screen, token or email field.
- Admin authentication, roles, password changes and resets read/write `cms_users` only through secure Next.js server APIs. Passwords are salted one-way scrypt hashes.
- Direct Google Cloud Firestore and Storage server SDKs replace **all** Firebase Admin SDK imports. Firebase Authentication is not used by the CMS.
- The old `/api/admin/auth/setup` endpoint returns 410 Gone, including when the patch is applied to an older release.
- First Super Admin can be provisioned on their **first normal login** via two temporary private server environment values (`CMS_INITIAL_ADMIN_USERNAME`, `CMS_INITIAL_ADMIN_PASSWORD`), with no setup page. Remove these after the first login.
- Session validation, login attempt throttling, cookies, and Admin Users remain server-only. Firestore security rules still deny browser reads/writes of `cms_users`.
- Media guidelines, product editing, website layouts and existing content remain unchanged.

## Apply update

**Full ZIP**: put the contents directly in your Next.js project root. **Patch**: copy updated files over V1.15, then remove old obsolete `SETUP_LOCAL_FIREBASE.cmd` if it is still present. In either case, run `npm install` (new server packages) and restart `npm run dev`.

**Required server permission:** To access Firestore securely, your Next.js server must have Google Cloud IAM credentials. The SDK change does not eliminate this unavoidable database permission. Use private `CMS_GOOGLE_CREDENTIALS_JSON` in Vercel or an already configured Google service identity. The browser Firebase API key cannot access private `cms_users`. If you had previously configured `FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON` on Vercel, the new Google Cloud clients accept that existing secret **without loading Firebase Admin SDK** as a temporary compatibility fallback; you can migrate to the new env name later.

For brand new installations, set two temporary server-only environment variables for first login: `CMS_INITIAL_ADMIN_USERNAME` and `CMS_INITIAL_ADMIN_PASSWORD`. Do not leave the temporary password in deployment settings after the account exists. No `CMS_SETUP_TOKEN`, Firebase Auth, admin SDK or password reset cloud functions are used. Existing hashed cms_users accounts need no first-login provisioning.

## Testing constraints
The V1.16 package has static/source tests and mocked CMS operations. A real Firestore connection, Vercel deployment and full Next.js build require deployment environment validation.
