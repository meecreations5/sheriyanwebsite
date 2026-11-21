# SHANERYN CMS V1.18.3 — Global 100 MB Media Upload Policy

## What changed
- One shared policy (`lib/cms-media-policy.mjs`) applies to all CMS media selectors: homepage desktop/mobile hero, Best Seller, product/looks, categories, collections, editorial/gallery photographs, founder/bespoke, logo, favicon, SEO social preview and video uploads, and standalone Media Library.
- Maximum is **100 MiB (104,857,600 bytes) for EACH file**, not 100 MB for the combined Media Library. Images and videos use the same file-size limit.
- Client and server now validate against exactly the same limit and allowed formats: JPG, PNG, WebP, GIF, MP4 and WebM.
- Media guidance in the CMS clearly says 100 MB maximum. Image recommendations of around 3 MB remain performance advice only.
- Uploading the same file again after an error now triggers the chooser normally.
- 3 MB is only the routing threshold: files above that use Google Cloud Storage signed/resumable upload, not the Vercel API request body.

## Preserved
- V1.18.2 signed URL + resumable Storage fallback, auth with Firestore cms_users, session cookies, all CMS modules, SEO, page design, and all existing content.
- No Firebase Authentication, new collections, or new Firestore indexes were introduced.

## Important: Upload preparation 503
Increasing the maximum size does not resolve a POST /api/admin/media/sign HTTP 503. To upload any file larger than 3 MB, the backend still needs Storage access (e.g. Storage Object Admin to the correct bucket), and the bucket must allow the admin origin in its CORS configuration (`storage-cors.json`). Existing V1.18.2 fallback logic is preserved.

## How to apply
1. If running V1.18.2, apply the patch ZIP to the project root, replacing matching files. Or deploy the flat FULL ZIP contents as your project root.
2. Run `npm run check`, then `npm run build` on a machine with dependencies installed.
3. Confirm the correct server credentials and Storage bucket permissions, then redeploy.
4. Test a small image (2 MB), medium portrait image (5 MB), an image/video over 10 MB and a large media file around 70 MB. Repeat from both the homepage picker and the Media Library.
5. Verify the uploaded file appears in the Media Library, can be selected and saved, and displays correctly on the public website.

Security: Never include Cloud service account JSON, private keys, or CMS admin passwords in source code or the ZIP. Replace any previously shared credentials with a newly generated secret/key.

This update has automated policy tests, but live Cloud Storage uploads and the production build still require verification in your own environment.
