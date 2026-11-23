# SHANERYN CMS V1.18.6 - Optional Product Descriptions

Based on V1.18.5. This update adds optional structured information to individual Look Details pages, without changing the homepage design, categories, collections, media uploads, SEO or admin authentication.

## What changes for a CMS editor

1. Open **Admin > Products & Looks**.
2. Select a dress, then open the **Descriptions** tab.
3. Enter a tagline, short description and price only if you want them shown.
4. Under **Fabric**, choose **+ Add garment** and enter a garment name and fabric description. Add a second row for a two-piece outfit.
5. Under **Design Description**, add garment-by-garment design descriptions as needed.
6. Add **Embroidery & Detailing** text if applicable.
7. Under **Occasion description**, add items such as Cocktail Parties or Gala Dinners individually.
8. Click **Save & Publish** and open **Preview Product** to check the public Look Details page.

Anything left blank is automatically omitted on the public product page. There is no extra Show/Hide switch.

## Important distinction

**More Options > Catalogue Occasion Filter** stays exactly as it was. It is used for filtering products on the Collections page. Adding or removing occasion-description entries does not change that filter.

## Data and compatibility

- New optional Firestore fields in `cms_products/<product-id>`: `price` and `productDetails` (`fabric`, `design`, `embroidery`, `occasions`).
- Existing `description`, `tagline`, `occasion`, category, measurements, imagery, SEO and media settings are retained.
- Older products without new fields continue to work. No database migration or bulk rewrite is required.
- Blank garment rows and occasion entries are removed server-side before saving.
- Public product information is HTML escaped before rendering; multiline text is preserved with line breaks.
- Desktop product-detail sections start expanded. On mobile they start collapsed and can be opened individually.
- Price is for display only; payment and checkout behavior are not added.

## Files changed

- `components/admin/CmsApp.jsx`
- `app/admin/admin.css`
- `lib/cms-server-api.js`
- `lib/product-details.mjs` (new)
- `lib/render-page.js`
- `components/LegacyPage.jsx`
- `public/look-detail-v45.css`
- `public/look-detail-v45.js`
- `tests/test-cms-server-mock.mjs`
- `tests/test-optional-product-descriptions-v1186.mjs` (new)
- `package.json`

## Verification

The existing `npm run check` suite passed, including login, CMS data operations, SEO, 100 MB uploads, product image publishing, home image layout and new optional-product-description logic. JavaScript/JSX syntax validation passed. A full production Next.js build and a live Firestore/Vercel publish are not verified in this environment; run both in staging before production rollout.

## Deployment

For projects running V1.18.5, apply the patch files at the project root, then build and deploy as usual. For earlier versions, use the full V1.18.6 package. No change to `cms_users` or to secret credentials is necessary for this feature.
