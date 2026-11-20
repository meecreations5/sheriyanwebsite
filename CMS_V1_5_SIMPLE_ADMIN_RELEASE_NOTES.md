# SHANERYN CMS V1.5 — Simple Admin, Responsive Banners, Video & Staff Accounts

**Foundation:** V1.4 Next.js 16 / plain JavaScript (JSX) / Firebase project `shanerynwesbite`.

## Changes

### Homepage Banner (Page Manager → Homepage)
- Separate **Desktop Banner** and **Mobile Banner** image controls, with independent uploads from Media Library.
- Recommended wide desktop 1920 × 1080; portrait mobile 900 × 1200. Existing approved image remains the fallback until changed.
- Publishing saves values as `cms_pages/index.heroImages.desktop`, `.mobile`, `.alt`; public hero resolves mobile at viewport <= 720px, and desktop above 720px.
- The public homepage structure, mobile typography, hero text, CTA and layout remain unchanged. These are **two image versions of one Homepage**, not two separately indexed URLs.
- CMS preview also receives the unsaved responsive banner settings.

### Less cluttered Product Editor
- **Basic Details** (default): product name, category, short description, catalogue photo, look-detail photo, visible/featured/bestseller switches.
- **Photos & Video**: studio and editorial images, gallery, optional Best Seller image, video source.
- **Advanced**: read-only internal SKU, public slug, occasion, colour, garment pieces, sorting, editable measurement groups and SEO.
- New products receive a generated internal ID; no manually entered SKU required. Existing `/look/<slug>` links are preserved.
- Preview images now resolve local `/assets/` URLs correctly in the `/admin` interface.

### Video sources
- Choose **Upload Video** (MP4/WebM up to 50 MB via Firebase Storage) **or YouTube Link**.
- Product video source stored in `cms_products/{id}.video`. Look Detail renders a native video player for uploaded files, or an allowlisted privacy-enhanced `youtube-nocookie.com` embed for YouTube.
- Page Manager → **Fashion Film** offers the same selector (`cms_pages/film.filmMedia.url`).
- File and URL values are validated; arbitrary HTML embeds are not accepted.
- Homepage's previously approved static fashion image is not turned into autoplay video.

### Simpler staff creation
- Admin → Users now has **Username + Email + Password + Access Role → Create User**.
- Creates a Firebase Authentication account from an isolated secondary Firebase App (in-memory session), then writes its UID/role to `cms_users`. The current Super Admin stays signed in.
- No copied UID, Google Cloud CLI, service-account key or bootstrap script for **additional** staff accounts.
- Staff sign in with **email and password**; username is their display name. An actual email is required for password recovery.
- First-ever Super Admin still needs one-time initial authorisation according to `EASY_SETUP.md`; it cannot safely be auto-granted to an unverified visitor.
- If role assignment fails after Auth account creation, the UI attempts to delete the temporary account; an administrator may need to reconcile it if rollback fails.
- Firebase Auth API can create an account without CMS access, but Firestore rules only grant CMS access once an existing Super Admin creates the role document. Production should add signup abuse prevention and monitor Authentication quotas.

### Page Manager simplicity
- Default **Simple** view prioritises visible text, links and photos.
- **All Fields** reveals every existing granular editable field, including technical display attributes and visibility controls.
- Existing section show/hide, create/reorder and **direct Save & Publish** remain available; no review workflow is introduced.

## How to apply

1. **Patch route:** Extract `SHANERYN_CMS_V1_5_Simple_Admin_Patch.zip` directly over the existing V1.4 project (the folder containing `package.json`). Replace matching files. Or use the complete V1.5 ZIP if starting fresh.
2. Restart the Next.js dev server (`npm run dev`). No new npm dependency was introduced.
3. Ensure Firebase Authentication Email/Password is enabled; existing Super Admin can now create other staff directly in `/admin`.
4. For updated self-demotion protection, publish the included `firestore.rules` through Firebase Console. To upload media, publish `storage.rules` and enable Firebase Storage.
5. Use Homepage → desktop/mobile banner controls; Products → Basic Details; Fashion Film → video selector.

## Verification performed

- Node static tests: `npm run check`, `npm run check:urls`, `npm run check:cms` passed.
- Parsed all JS/JSX project files using a standards-aware JSX parser; no parse errors.
- Validated YouTube URL parsing, disallowed lookalike hosts, media-file recognition and critical CMS security wiring.
- ZIP integrity and patch-file diff verified.

**Not tested here:** `npm install` / Next.js production build (npm registry DNS unavailable in this environment); live Firebase Authentication, Firestore rules, Storage uploads, responsive browser rendering, and deployment. Treat this as a development build until those acceptance tests pass on the developer's machine.
