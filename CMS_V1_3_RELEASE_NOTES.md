# SHANERYN CMS V1.3 — Direct Firebase Authentication

**Purpose:** Remove the unnecessary gcloud/ADC and private-key setup for creating/administering the initial CMS account.

### Changed

- Replaced synthetic username email login with standard **Firebase Authentication email/password** login.
- The first Super Admin is created manually in **Firebase Authentication → Users** and authorised by a `cms_users/{uid}` Firestore document. No custom claims/bootstrap are required.
- Admin pages, products, sections, media records, forms, settings, enquiry management and appointments use the rules-protected Firestore browser SDK.
- Content rendered by Next.js uses public, rules-protected Firestore reads, with approved V6.9 seed fallback when a document is unavailable.
- Public enquiry/appointment submissions no longer depend on an Admin SDK. Requests remain private from public reads.
- Reworked Firestore/Storage security rules to check Firestore staff roles. Privileged Firebase Admin SDK dependency, setup command, admin API and gcloud references were removed from the runtime.
- Added an **EASY_SETUP.md** containing Firebase Console clicks rather than terminal setup commands. A simple password reset link uses Firebase Auth.
- Kept approved homepage mobile appearance and all V6.9 seed photos, product information and editor fields.

### QA performed (offline)

- 9 pages, 2,527 content controls, 34 sections, 8 baseline products found.
- Active JS/JSX source files passed parser checks.
- Mock Firestore/Auth integration checks passed: admin profile, 9-page listing, 8 product listing, 2 forms, initial content import, page editing, product editing, viewer write denial and unapproved-user denial.
- Public form source contract, rule file existence and Firebase configuration checked.

### Still required before launch

- **Actual Firebase Auth, Firestore and Storage integration testing on your project.** The environment cannot access the npm registry; a full Next.js `npm install` / production build was not possible here.
- Copy-paste and publish the included Firestore rules in Firebase Console. Publish Storage rules only when enabling uploads.
- Run live enquiry/form, storage upload and mobile/device regression tests.
- Add durable bot protection: the public form currently has a basic process-local hourly rate limit and a honeypot, not cloud-wide rate limiting. Deploying without additional App Check/rate limiting is not recommended.

This ZIP does not change Firebase remotely; it contains source code only. Do not share passwords or key files.
