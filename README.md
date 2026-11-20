# SHANERYN CMS V1.11 — Simple Admin Users

Start with [UPDATE_V1_11.md](./UPDATE_V1_11.md) for the latest admin-user improvements and installation steps.

**V1.10:** The Super Admin can securely reset other staff passwords after deploying the included Firebase Cloud Function. See [UPDATE_V1_10.md](./UPDATE_V1_10.md).

**V1.9:** For username-only staff creation and login, start with [UPDATE_V1_9.md](./UPDATE_V1_9.md).

# SHANERYN - Next.js JavaScript + Firebase CMS (V1.10)

> **Existing V1.9 users:** Apply the V1.10 patch using **[UPDATE_V1_10.md](./UPDATE_V1_10.md)**. **Earlier users:** See **[UPDATE_V1_9.md](./UPDATE_V1_9.md)**. **New installation:** Start with **[EASY_SETUP.md](./EASY_SETUP.md)**. You do not need `gcloud` or a service-account key to create the first Super Admin.

## Technology

- Next.js App Router, React, **plain JavaScript/JSX only**; no TypeScript.
- Firebase Authentication username/password staff login (with an internal generated email-like identifier). Existing email logins remain supported.
- Cloud Firestore and client-side Firebase SDK for editable CMS records and admin roles.
- Next.js server rendering reads public Firestore content using the **rules-protected Firebase Web SDK**, not the privileged Admin SDK.
- Firebase Cloud Storage for public fashion media; uploads require authorised CMS staff.
- Your existing Firebase project ID is exactly `shanerynwesbite`.

## V1.6 simple visual editing

- **Page Manager**: readable field labels and a page/link destination picker in Simple mode; advanced mode retains full content editability. All existing show/hide controls remain.
- **Products**: category dropdown, collection checkboxes, garments as add/remove chips, measurement-group editor, photographed gallery and optional video.
- **Categories**: garment types (Pant Sets, Skirt Sets, Gowns, etc.). Existing V1.5 category data is retained, including prior edits.
- **Collections**: new curated groupings, such as Festive Edit or Evening Edit, containing selected products from any category. Public pages are available at `/collections/<slug>` after publishing.
- **Global Settings**: photographed Best Seller and homepage featured-product selection instead of SKU lists. SEO is a separate card.
- **Homepage**: responsive desktop/mobile hero banner remains available; approved public homepage layout is not changed.
- **Staff**: new staff accounts require only username, password and role; Firebase uses a generated internal identifier. Existing administrator email accounts still work. No gcloud for day-to-day use.
- **Publish**: direct Save & Publish, no review or approval queue.

See [UPDATE_V1_6.md](./UPDATE_V1_6.md) for patch instructions and the one-time new Firestore rules.

## Clean product URLs

Product detail pages now use `/look/sunshine` (not `/look?id=SH-SUNSHINE`). Old SKU-query URLs redirect to the correct product. Product URL slugs can be edited in Admin → Products. See `CLEAN_PRODUCT_URLS_V1_4.md`.

## Content included

- The approved **SHANERYN V6.9** static website migrated to Next.js routes, including original artwork, approved responsive layout and mobile homepage.
- Nine seeded page templates with **2,527 editable content controls** and **34 toggleable sections**, with extra section templates.
- Eight initial products, separate Category and Curated Collection Managers, Form Manager, Content Studio, Media Library, global links, social settings and SEO metadata.
- Customer enquiry and appointment request recording to Firestore; **no actual payment or checkout integration**.
- Simple Save & Publish with section and element show/hide and page revision history; no approval queue.
- New staff can change their password after logging in; Super Admin can reset other staff passwords through a separately deployed secure Firebase Cloud Function. The first Super Admin should retain a real, reachable recovery email.
- Super Admin permissions are determined by a `cms_users/{FirebaseAuthUID}` Firestore document (not custom Auth claims); staff are created with the UID automatically in Admin Users.

## Start locally

```powershell
npm install
npm run dev
```

Go to http://localhost:3000/admin. First perform the five Firebase Console setup steps in `EASY_SETUP.md`.

For local source and in-memory migration checks:

```bash
npm run check
npm run check:urls
npm run check:cms
npm run check:v16
```

## Firebase database collections

| Collection | Use |
|---|---|
| `cms_users/{uid}` | Staff roles, active status. The first record is created in the Firebase Console. |
| `cms_pages/{slug}` | Editable page patches, visibility, section ordering and extra blocks, plus Homepage responsive hero media / Fashion Film source. |
| `cms_products/{id}` | Product details, image galleries, visibility, SEO. |
| `cms_categories/{id}` | Garment category metadata and visibility. |
| `cms_curated_collections/{id}` | Curated collection metadata and visibility. |
| `cms_collections/{id}` | Legacy V1.5 garment categories, read for compatibility and preservation. |
| `cms_forms/{kind}` | Enquiry and appointment form labels, options, visibility. |
| `cms_settings/site` | Global contact, social, branding, homepage and SEO settings. |
| `cms_media/{id}` | Image/video upload metadata. |
| `cms_requests/{id}` | Sensitive customer enquiries and appointment requests; staff read only. |
| `cms_revisions/{id}` | Prior published page versions. |

Public page content is readable, but only authorised staff can edit it. Sensitive customer requests, admin users and revisions are not publicly readable. Authentication alone never grants CMS rights without a matching staff record.

## Important operational limitations

- This ZIP is source code. It has **not** been deployed to your Firebase project and no live Firebase sign-in or Firestore test has been completed. The new staff-password-reset function requires **one-time deployment and Blaze billing**; no private key or gcloud on your computer is needed.
- The public form route uses field validation, honeypot and *basic instance-local rate limiting*, not robust distributed bot protection. Configure **App Check**, durable throttling and privacy controls before public launch.
- Firestore and Storage rules should be pasted/published through the Firebase Console. Media upload rules can require enabling Firebase Storage ↔ Firestore security-rule integration, with a prompt from Firebase.
- Public content now uses a rules-protected Firestore Web SDK. If Firestore is not configured, the site falls back to the bundled V6.9 page/product content.
- URLs from old `.html` pages redirect to clean routes; legacy scripts/styles remain for design parity.
- The original homepage **mobile design is unchanged**; the banner can now use a separate mobile image.
- The correct studio email and social URLs were not provided; verify them in Admin → Global Settings before launch.

## Verification

The deliverable has static checks for the seed inventory, JS syntax, Next route presence, Firebase Auth integration and rule file shape. The original site's visual QA was performed in prior revisions. A complete Next.js production build, live Firebase sign-in, new-staff creation, deployment and end-to-end form/upload tests are still required before going live.
