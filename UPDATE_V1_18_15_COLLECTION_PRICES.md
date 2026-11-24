# SHANERYN CMS V1.18.15 — Collection Listing Prices

## Change

Show each existing product price underneath its name on collection listings. The price comes directly from the product's current CMS `price` field; no new database field or pricing configuration was introduced.

## Included surfaces

- Main public `/collections` look grid (and curated collection pages that reuse it).
- Existing `/collection` category-specific listing grid.

Related-look suggestions on an individual Look Details page keep the previous presentation.

## Display rules

- Price is optional: if empty, no price line is rendered.
- Existing formatted prices such as `₹ 17,000` or `AED 950` are preserved.
- Numbers such as `17000` or `17,000` are formatted as `₹17,000` using Indian digit grouping.
- Price strings are escaped before entering the HTML.
- The styling is scoped to collection listings and adapts to dark/inverse display and mobile widths.

## CMS workflow

**Admin → Products & Looks → Edit Look → Price (optional) → Save & Publish.**

## Files changed

- `public/site.js`
- `public/editorial-pages.js`
- `components/LegacyPage.jsx`
- `public/shaneryn-v1815-collection-prices.css` (new)
- `tests/test-v1815-collection-prices.mjs` (new)
- `package.json` (version + test script)

## Verification

- `npm run check`: PASS (all checks, including price formatting, blank suppression, escaping, and existing CMS/SEO/media regressions)
- `node --check public/site.js`: PASS
- `node --check public/editorial-pages.js`: PASS
- Full Next.js production build: not run in this environment (dependencies not installed).
- Live Vercel rendering: not verified.

## Deployment

1. Apply the patch on top of V1.18.14 or replace with the full V1.18.15 source.
2. Build and deploy to Vercel.
3. Enter/update a price in the CMS and Save & Publish.
4. Confirm the price appears on `/collections` and the relevant category listing on desktop and mobile.
5. Confirm a product with no price displays no empty line and the individual Look Details price remains unchanged.

## Scope safety

No edits to `cms_users`, Firestore structure, service-account credentials, products, media files, homepage, Bespoke page or SEO configuration.
