# SHANERYN CMS V1.18.17 - Inches-only measurement forms

## Request
All public SHANERYN measurement forms must use **inches (in)**, never centimetres (cm).

## Changes
- **Bespoke page:** Removed the Inches / Centimetres radio selector. The visible label now reads `Measurements in INCHES (in)` and its individual inputs are consistently marked `(in)`.
- **Bespoke calculations and review:** Removed conversion logic, conversion prompts, and change-of-unit event handlers. Form data is entered, retained and reviewed in inches; copied summaries say `Measurements in inches` and use `in` on each value.
- **Look Details:** Verified its individual product-specific measurement fields and their secure enquiry submissions already use inches. No change to the existing submission flow was necessary.
- **Previously published CMS pages:** A targeted server-rendering safeguard removes any older Bespoke unit choices from Firestore-backed pages, even when those pages have a saved text patch. It preserves the editable `Measurements in` prefix.
- **CMS Page Manager:** Retired the two obsolete unit-choice editing fields for Bespoke; all other measurement questions, headings and content editing controls remain available. No Firestore migration or data deletion.
- **Desktop and mobile:** The change is applied in the shared HTML and script, so both layouts use the same unit.

## Preservation and limits
- No layout redesign, measurement question changes, or changes to Firebase authentication, gallery, pricing, SEO, media upload, or other pages.
- Existing published CMS records and client enquiries are **not modified**. The inches-only policy applies to the website as rendered after deployment; it does not relabel or convert historical submissions.
- The Bespoke form's existing **review/copy** workflow remains unchanged. Product Look Details' **submit to studio** workflow remains unchanged.

## Verification
`npm run check` passes, including `tests/test-v1817-inches-only.mjs` covering seed markup, older published page normalisation, Bespoke dynamic garment/look measurement fields and review summary, and Look Details inches-only submission code. Production Next.js build and the deployed Vercel pages have not been verified here.

## Deployment
- Apply `SHANERYN_CMS_V1_18_17_INCHES_ONLY_PATCH.zip` on top of V1.18.16, replacing paths.
- Or deploy the full V1.18.17 code ZIP.
- Redeploy to Vercel; open `/bespoke` and a `/look/<slug>` page on desktop and mobile and confirm each visible measurement is in inches and no centimetre option appears.
