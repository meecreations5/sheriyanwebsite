# SHANERYN CMS V1.6 - Simpler Editing and Separate Categories / Collections

This release updates the EXISTING Next.js + JavaScript + Firebase CMS. It does not replace the website design or the mobile homepage.

## Update an existing V1.5 installation

1. Back up your existing project folder. Use the `SHANERYN_CMS_V1_6_Simple_Editor_Patch.zip` archive over your V1.5 project where `package.json` lives; allow file replacement.
2. Open the Firebase Console for project `shanerynwesbite` > Firestore Database > Rules. Replace the rules with the included `firestore.rules` and click Publish. This is required for the new Categories and Collections databases. No gcloud or private key is required.
3. Stop the local development server with Ctrl+C, then run `npm run dev` and open `http://localhost:3000/admin`.
4. Use **Categories** for garment types and **Collections** for curated product edits.

Existing products, their images, product URLs, page content and the previous category records are preserved. Do not delete the legacy `cms_collections` collection in Firebase; V1.6 can read it to retain edits from V1.5. A later audited data cleanup could remove it, but this release does not.

## What changed

- **Page Manager**: the normal Simple editor uses human-readable names and a page destination picker for links. Selecting Bespoke Enquiry automatically uses its existing interest query. Advanced / All Fields is available for uncommon attributes.
- **Product Manager**: category dropdown, collection membership checkboxes, add/remove garment piece chips, editable measurement groups and photographed product selection. Gallery & Video retains upload or YouTube link options.
- **Categories**: Pant Sets, Cropped Pant Sets, Skirt Sets, Tunics, Dresses, Gowns and any previous custom garment categories; edit names, descriptions, cover images, visibility and order.
- **Collections**: create seasonal or themed edits (e.g. Festive Edit), choose constituent products with pictures, show/hide and link to `/collections/<collection-name-slug>`. These are separate from garment categories.
- **Global Settings**: Best Seller dropdown with a photo preview, up to four homepage featured products selected by photograph, and a separate Default SEO card. No product ID lists.
- **No approval queue**: Save & Publish remains direct.

## Firestore collections added

- `cms_categories/{categoryId}`: garment categories, with existing `cms_collections` records retained as a compatibility source.
- `cms_curated_collections/{collectionId}`: themed collections. Product memberships are saved as `collectionIds` on `cms_products/{productId}`.

### What happens to existing data?

The six V1.5 garment categories were saved to `cms_collections` despite the confusing name. V1.6 reads them under Categories, including prior edits and custom additions. When you save a category, it writes to `cms_categories`. The legacy records are not removed or overwritten. When you use the optional one-time Import Baseline action, the same records are copied into the new category storage when absent. Collections are a new, initially empty module until you create a curated group.

A category can be hidden from the category navigation/filter without deleting its products. A product can have one primary category and be included in multiple curated collections. Hiding a collection removes its public collection page and cards, but does not hide the individual products.

## Verification and limitations

`npm run check`, `npm run check:urls`, `npm run check:cms` and `npm run check:v16` perform source inventory, routing, legacy feature and in-memory Firestore migration tests. Actual Firebase permissions, Next.js production build, deployed responsive behaviour and browser end-to-end workflows MUST be verified in your environment before production. npm registry access was not available in the build environment used to prepare this ZIP.

No live Firebase data, staff users, homepage content or deployed website was altered when preparing this release.
