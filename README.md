**V1.19.8.1 review hotfix:** Equal Reject/Accept cookie controls, restored iOS PWA help theme, keyboard accessibility, and desktop-agent iPadOS install guidance. See `UPDATE_V1_19_8_1_AUDIT_HOTFIX.md`.

**V1.19.8:** Mobile PWA, consent-gated Firebase Analytics, Privacy/Cookies/Terms and consent preferences. See `UPDATE_V1_19_8_PWA_MOBILE_PRIVACY.md`.

**V1.19.6 (27 November 2026):** Bespoke original three image-based service cards restored; Styling Services previous three selection boxes retained without Bespoke; Book Your Appointment uses Contact-style image/form composition; same five-icon social row on Contact/Footer (including configurable WhatsApp). See `UPDATE_V1_19_6_DESIGN_CONSISTENCY.md`.

> **V1.19.5:** verified client-feedback corrections; see [UPDATE_V1_19_5_VERIFIED_CLIENT_FEEDBACK.md](UPDATE_V1_19_5_VERIFIED_CLIENT_FEEDBACK.md).

**V1.19.4 update:** Restored the three original photograph-led Color Analysis / Personal Styling / Occasion Styling cards on the dedicated Styling Services page, with individually editable CMS images, descriptions and booking links. See [UPDATE_V1_19_4_STYLING_SERVICE_PHOTOS.md](UPDATE_V1_19_4_STYLING_SERVICE_PHOTOS.md).

> **V1.19.2** — The complete, approved “My Story” copy is now published by the Our Story page template and editable paragraph-by-paragraph via Page Manager. See `UPDATE_V1_19_2_MY_STORY.md`.

## V1.19.1 — Image presentation and appointment display (26 November 2026)

- Collections index and category galleries: photographs use their natural dimensions, not forced ratio / padded canvases. No crop, artificial background bands, or decorative frames.
- Quick Look remains clickable as a minimal action below each photograph, rather than a white overlay obstructing garments.
- Look Details: Front / Back / Profile photographs use their native aspect ratios; video retains a separate media tile, and detail/accessory strips are unboxed.
- Appointment and Styling Services: inherited hidden tab is removed for dedicated pages, revealing the booking form without a separate tab click.
- Appointment forms also receive the correct responsive styling outside the Contact page. Bespoke appointment form retains its dark styling.
- No Firestore data changes, CMS-user changes, payment changes, or image replacements.
- Test: `npm run check`. Standalone browser CSS previews are available separately from the code archive. Full Next.js production build and Vercel/Firebase verification remain required.

## V1.18.16 — Verified 14-Point Feedback Update

Audited all 14 client requirements against V1.18.15; removed the leftover Measurements introduction, corrected Look Details closing contrast in light mode, and removed obsolete Colour Story template HTML. Existing sections, data and CMS controls remain intact. See `UPDATE_V1_18_16_FEEDBACK_VERIFICATION.md` for a numbered audit and verification limits.

## V1.18.13 - Editable Collections Showcase

Page Manager > Collections now includes four editable fields for the dynamically inserted Our Collections showcase. Collection cards themselves remain controlled by the Collections module. See `UPDATE_V1_18_13_EDITABLE_COLLECTIONS_SHOWCASE.md`.

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

## V1.18.17 - Measurement units
All public measurement forms use inches only. The Bespoke centimetre toggle and conversion path have been removed, including a render-time safeguard for previously published CMS pages. Product Look Details measurements and studio submission remain inches-only. See `UPDATE_V1_18_17_INCHES_ONLY.md`.


## Final client feedback (V1.19.0)

See `UPDATE_V1_19_0_FINAL_CLIENT_FEEDBACK.md` for the exact 27-slide scope, features, limits, testing and deployment checklist.

## v1.19.3: clothing and accessories collections

See `UPDATE_V1_19_3_MULTI_COLLECTIONS_ACCESSORIES.md` for the new independent
Accessories / Accessory Categories CMS modules, clothing and accessory collection
assignment, example starter edits, customer-facing routes and deployment tests.


## V1.19.7 — Dynamic catalogue verification

New CMS categories support stable `/category/{id}` public pages, category
renaming, dynamic filters and sitemap entries. Visible clothing and accessory
collection pages require assigned visible items. Accessories now link back to
canonical look URLs. Refer to `UPDATE_V1_19_7_DYNAMIC_CATALOGUE.md` for the
publishing workflow, test coverage and remaining live checks.

## V1.20.3 — Mobile gallery and founder correction

See `UPDATE_V1_20_3_MOBILE_GALLERY_FOUNDER.md` for layout, behaviour and verification limits.

## V1.20.4 — Final mobile refinements

See `UPDATE_V1_20_4_FINAL_MOBILE.md`.
