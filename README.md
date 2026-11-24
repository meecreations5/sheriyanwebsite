# SHANERYN CMS V1.18.11 - Bespoke Page Recovery

See `UPDATE_V1_18_11_BESPOKE_RECOVERY.md` for safe deployment and diagnosis of the Bespoke page server error.

**Latest update: V1.18.10 — Add More Past Work photos in CMS and remove Homepage image borders/slanted pink label.** See `UPDATE_V1_18_10_PAST_WORK_AND_HOME.md`.

## Latest update: V1.18.9 - Look Details editorial and measurement flow

See `UPDATE_V1_18_9_LOOK_DETAILS_EDITORIAL.md` for the revised product hierarchy, optional garment information, inch-only measurements and secure direct submission, and the three-line SHANERYN closing statement.

## Latest update: V1.18.6 - optional, structured product descriptions

Admin > Products & Looks > Descriptions now supports optional tagline, short introduction, display-only price, repeatable garment-level Fabric and Design descriptions, Embroidery & Detailing and a detailed Occasion list. Only non-empty sections appear on the public Look Details page. The existing catalogue Occasion filter remains independent. See `UPDATE_V1_18_6_OPTIONAL_PRODUCT_DETAILS.md` and `docs/PRODUCT_DESCRIPTION_QUICK_GUIDE.md`.

**V1.18.4 product image publishing fix:** See `UPDATE_V1_18_4_PRODUCT_IMAGE_SYNC.md` for CMS photo selection and public Firestore read reliability.

# SHANERYN — Next.js (JavaScript) + Firestore CMS — V1.18.3 (global 100 MB per-file media limit)

V1.18 adds canonical URLs, sitemap.xml, robots.txt, social SEO metadata and baseline description refinements. See `UPDATE_V1_18_SEO.md`. Set `NEXT_PUBLIC_SITE_URL` to the **verified live website origin** before deploying. The public website preserves the V6.9 editorial design. `/admin` is a simple username/password CMS: content, categories, collections, products, media, forms, enquiries, appointments and Admin Users.

**Authentication**: Usernames, salted scrypt password hashes, roles and active status are stored **only** in Firestore `cms_users/{username}`. No Firebase Authentication, Firebase Admin SDK, email or UID entry is used for admin login. Password hashes cannot be viewed or decrypted, including by Super Admin. Admin can create accounts and set a new password for other staff.

**Important server requirement:** A secure Next.js server requires **authorised private access to Firestore**. The Google Cloud Firestore/Storage *server SDKs* use Google Cloud IAM, not Firebase Authentication or Firebase Admin SDK. Vercel needs a Google Cloud service identity or private server credential; it is not possible to secure `cms_users` with only the public Firebase API key. Do not make `cms_users` public or weaken its Firestore rules.

**V1.18.3 global media limit:** All admin media upload controls (homepage, pages, looks, products, category/collection images, founder/bespoke, branding, social previews, videos and the Media Library) use one `lib/cms-media-policy.mjs` setting: 100 MB per file. Files above 3 MB bypass the Vercel Function through Cloud Storage. This was already a 100 MB limit in V1.18.2; the new version centralises validation on both browser and server. See `UPDATE_V1_18_3_GLOBAL_100MB.md`.

**V1.18.2 media note:** When a server can read Firestore but cannot sign Cloud Storage URLs, the large-file upload route now falls back to a server-authorized Cloud Storage resumable session. Grant the server identity Storage Object Admin on the media bucket as documented in `UPDATE_V1_18_2_MEDIA_UPLOAD_FIX.md`.

## Use the CMS

1. Run Node 22+ and `npm install`, then `npm run dev`.
2. Make sure the server has authorised Google Cloud access to project `shanerynwesbite`: `CMS_GOOGLE_CREDENTIALS_JSON` as a **private server environment variable** OR Google Cloud Application Default Credentials; never upload JSON into the public website. If using ADC, also set `CMS_SESSION_SECRET` (32+ random characters). Refer to `.env.example`.
3. **First Super Admin is created in Firestore `cms_users` only**, not from environment variables or a setup endpoint. Generate a compatible one-way hash by running `node scripts/generate-super-admin-record.mjs shanerynadmin` in an interactive terminal. Type a secure password twice; the script will display the Firestore field names/types and a salted password hash, never the plaintext password.
4. In Firebase Console > Firestore Database > `cms_users`, choose **Add document** and use document ID `shanerynadmin`. Add exactly the generated fields (including `passwordHash`, `active: true`, `sessionVersion: 1`, and `role: super_admin`). The browser security rules remain deny-all for `cms_users`; you need console access to create the initial document.
5. Sign in at `/admin` using `shanerynadmin` and the password you just entered into the local generator. Only existing `cms_users/{username}` records are eligible to log in; missing accounts return 401.
6. Admin > Admin Users subsequently creates, resets, enables/disables and assigns roles to other accounts, all within `cms_users`. Admin > Change Password lets you change your own password.

Your previous `cms_users` documents from the Firebase Authentication era may use Firebase UIDs and cannot authenticate here without a `passwordHash`. V1.14/V1.15 username-and-hash accounts continue working. Back up Firestore before deployment; do not delete content collections during migration.

For Vercel use the Next.js Framework Preset and the folder that contains `package.json`. Set private server credentials under Vercel Settings → Environment Variables and redeploy. **Never commit `.env.local`, passwords or credential JSON.**

Media controls show recommended image/video dimensions and formats. The public design is unchanged. **Maximum CMS media upload size is now 100 MB per file.** Files above 3 MB upload directly to Cloud Storage using a signed URL or resumable Storage upload session instead of passing through the Vercel Function. Apply `storage-cors.json` to the Cloud Storage bucket, with all existing authorised origins preserved; merely redeploying the ZIP does not change bucket CORS. The signed URL uploader also requires an authorised server identity capable of signing Cloud Storage URLs. See `UPDATE_V1_18_1_MEDIA.md`.

**Verification:** The code includes structural checks and database mocks. Run `npm run check`, `npm run build` and end-to-end tests against staging before production; these cannot substitute for a live Firestore test. No Firebase rules are relaxed.

## V1.18.5 homepage collection image sizing
Homepage four-look cards now display studio photographs at their natural ratio without white letterbox bars. See `UPDATE_V1_18_5_IMAGE_BAND_FIX.md`.

## V1.18.12 - Bespoke section ordering correction

Fixes the V1.18.11 server render error `TypeError: $(...).detach is not a function` by using Cheerio-compatible section removal and reinsertion. See `UPDATE_V1_18_12_SECTION_REORDER_FIX.md`.
