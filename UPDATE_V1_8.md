# SHANERYN CMS V1.8 — Independent Best Seller Section Image

This is an incremental patch on top of CMS V1.7, not a redesign.

## What changed

- Selecting a Best Seller product in **Global Settings → Homepage Highlights** controls the product destination **only**.
- The Homepage Best Seller photograph remains the uploaded image set in **Page Manager → Homepage → Best Seller**. Its alternative text and caption are managed with the page contents and are not overwritten by product metadata.
- A dedicated, easy-to-find **Homepage Best Seller** image picker is now shown in Page Manager when editing the Homepage; it edits the **existing page image field** rather than introducing a second copy of the image.
- The existing Best Seller section visibility switch remains available and is also shown in the new panel.
- The Product Gallery editor no longer shows a misleading **Best Seller Image** control. Historical product data is retained for compatibility, but it does not control the homepage photo.
- Global Settings identifies the selected product as the **linked product**, not the displayed section image.

## Usage

1. Open `/admin` → **Page Manager** → **Homepage**.
2. Under **Homepage Best Seller**, choose/upload the intended photograph and optionally edit its image description. Click **Save & Publish**.
3. Open **Global Settings** → **Homepage Highlights** → **Best Seller — Linked Product**; select the garment to open. Click **Save & Publish**.
4. Verify the homepage image stays the same but clicking the Best Seller picture and CTA opens the selected product at `/look/<slug>`.

### Existing installations

Apply the **V1.8 Changed Files ZIP over V1.7**. No Firestore schema changes, new collection, Firebase Rules updates, or additional authentication setup are required. Existing uploaded page-image patches are retained.

### Validation limits

Static checks and an isolated renderer regression test have been run. Live Firebase upload, Next.js production build and deployed-browser acceptance testing require the configured environment.
