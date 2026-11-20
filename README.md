# SHANERYN — Next.js (JavaScript) + Firestore CMS — V1.17

The public website preserves the V6.9 editorial design. `/admin` is a simple username/password CMS: content, categories, collections, products, media, forms, enquiries, appointments and Admin Users.

**Authentication**: Usernames, salted scrypt password hashes, roles and active status are stored **only** in Firestore `cms_users/{username}`. No Firebase Authentication, Firebase Admin SDK, email or UID entry is used for admin login. Password hashes cannot be viewed or decrypted, including by Super Admin. Admin can create accounts and set a new password for other staff.

**Important server requirement:** A secure Next.js server requires **authorised private access to Firestore**. The Google Cloud Firestore/Storage *server SDKs* use Google Cloud IAM, not Firebase Authentication or Firebase Admin SDK. Vercel needs a Google Cloud service identity or private server credential; it is not possible to secure `cms_users` with only the public Firebase API key. Do not make `cms_users` public or weaken its Firestore rules.

## Use the CMS

1. Run Node 22+ and `npm install`, then `npm run dev`.
2. Make sure the server has authorised Google Cloud access to project `shanerynwesbite`: `CMS_GOOGLE_CREDENTIALS_JSON` as a **private server environment variable** OR Google Cloud Application Default Credentials; never upload JSON into the public website. If using ADC, also set `CMS_SESSION_SECRET` (32+ random characters). Refer to `.env.example`.
3. **First Super Admin is created in Firestore `cms_users` only**, not from environment variables or a setup endpoint. Generate a compatible one-way hash by running `node scripts/generate-super-admin-record.mjs shanerynadmin` in an interactive terminal. Type a secure password twice; the script will display the Firestore field names/types and a salted password hash, never the plaintext password.
4. In Firebase Console > Firestore Database > `cms_users`, choose **Add document** and use document ID `shanerynadmin`. Add exactly the generated fields (including `passwordHash`, `active: true`, `sessionVersion: 1`, and `role: super_admin`). The browser security rules remain deny-all for `cms_users`; you need console access to create the initial document.
5. Sign in at `/admin` using `shanerynadmin` and the password you just entered into the local generator. Only existing `cms_users/{username}` records are eligible to log in; missing accounts return 401.
6. Admin > Admin Users subsequently creates, resets, enables/disables and assigns roles to other accounts, all within `cms_users`. Admin > Change Password lets you change your own password.

Your previous `cms_users` documents from the Firebase Authentication era may use Firebase UIDs and cannot authenticate here without a `passwordHash`. V1.14/V1.15 username-and-hash accounts continue working. Back up Firestore before deployment; do not delete content collections during migration.

For Vercel use the Next.js Framework Preset and the folder that contains `package.json`. Set private server credentials under Vercel Settings → Environment Variables and redeploy. **Never commit `.env.local`, passwords or credential JSON.**

Media controls show recommended image/video dimensions and formats. The public design is unchanged. For hosted video uploads over 3 MB, configure the Storage bucket's allowed CORS origins using `storage-cors.json` (and set your live domain). The signed URL uploader also requires an authorised server identity capable of signing Cloud Storage URLs.

**Verification:** The code includes structural checks and database mocks. Run `npm run check`, `npm run build` and end-to-end tests against staging before production; these cannot substitute for a live Firestore test. No Firebase rules are relaxed.
