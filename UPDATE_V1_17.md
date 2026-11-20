# SHANERYN V1.17 — Admin login from Firestore cms_users only

## Correction to V1.16

V1.16 had a one-time environment-variable Super Admin bootstrap (`CMS_INITIAL_ADMIN_*`) that created `cms_internal/first_super_admin`. This was not the requested account creation flow. V1.17 removes that bootstrap and `lib/cms-initial-admin.js` completely.

- `POST /api/admin/auth/login` authenticates ONLY an existing Firestore `cms_users/{username}` account with `active:true`, a valid salted scrypt `passwordHash`, and `sessionVersion:1` (or its current numeric version).
- Missing username or wrong password returns 401. No account is ever created during login.
- Existing `cms_users` accounts retain their credentials, role, user-management functionality, lockout protections and session behavior.
- The disabled legacy setup endpoint continues to return 410.
- No Firebase Authentication, Firebase Admin SDK, setup token, bootstrap environment credentials, or new account collection is introduced.
- `cms_login_attempts` is retained ONLY for login throttling and is not a user store.
- The previous `cms_internal` Firestore deny rule remains in place to protect any historical documents; no new `cms_internal` records are created by admin authentication.

## Create the first Super Admin (once)

1. From the Next.js project directory, run `node scripts/generate-super-admin-record.mjs shanerynadmin` in an interactive terminal. Type your new password twice while hidden. No username/password bootstrap environment variables are required.
2. Open Firebase Console > Firestore Database > `cms_users` > Add document. Set document ID `shanerynadmin`. Use the **exact field types** output by the script (all fields except `active` and `sessionVersion` are strings). The script produces a unique one-way scrypt hash; never use plaintext in the document.
3. Visit `http://localhost:3000/admin`. Log in with username `shanerynadmin` and the password used in step 1.
4. Manage future accounts inside CMS > Admin Users. All account records remain in `cms_users`.

The CMS server still needs private, read/write Firestore database access, and a session-signing secret/credential. These are necessary backend runtime permissions, **not account creation methods**. Keep existing working server settings; the patch does not change the database connection.

## Apply and verify

Copy the files over V1.16 (full ZIP replaces V1.16), run `npm install`, `npm run check`, and restart `npm run dev`. No Firestore security rules should be relaxed. No existing CMS collections are deleted or migrated by this update.
