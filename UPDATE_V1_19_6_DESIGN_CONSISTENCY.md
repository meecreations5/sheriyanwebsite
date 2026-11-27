# SHANERYN CMS V1.19.6 — Bespoke, Styling, Appointment & Social Consistency

Base: **V1.19.5**. Scope: targeted restoration of four client-approved page treatments. Next.js 16 / JavaScript / Firestore CMS. **No data migration, login change or new collection model.**

## Changes

1. **Bespoke (`/bespoke`):** The original `#services` section is once again rendered. It has the three photo-led cards (Color Analysis, Personal Style Consultation and Occasion Styling) and keeps their original editable CMS photo/text/link fields. The separate Styling Services page still exists. The Bespoke internal shortcut points to `#services`.
2. **Styling Services (`/styling-services`):** Restore the earlier three rectangular selectable service boxes, their text descriptions and appointment links. Only the Bespoke box is removed. Old Firestore-published V1.19.4 page markup is normalised at render time, with existing editable service heading/description patches respected. Client-specific visibility settings for the three services are retained. The page keeps its booking form and previous selection script.
3. **Book Your Appointment (`/appointment`):** Match Contact's image-and-form editorial composition: appointment photograph on the left and the existing request fields on the right, with the Contact palette and responsive stacked mobile layout. Appointment image remains editable from Page Manager. This is still a *request* subject to studio confirmation, not a confirmed slot.
4. **Contact & Footer social:** Use one shared five-icon row—WhatsApp, Instagram, Facebook, YouTube and LinkedIn—with consistent size and visual styling. Remove the duplicate textual WhatsApp/Instagram links formerly appended on Contact. The WhatsApp icon becomes clickable only when an authentic official studio number is configured in **Global Settings → Contact**; no number is hard-coded. Existing social URLs are still sourced from Global Settings.

## Code locations

- `lib/final-feedback-v119.mjs` — Bespoke restore, Styling Services layout restore (also for already published CMS pages), deduplicate social links.
- `data/seed/pages/styling-services.json` — original three-selector layout and description section.
- `public/social-v66.js` — five-platform social icons, phone validation and HTTPS WhatsApp URL.
- `public/shaneryn-v1196-page-consistency.css` — page-specific Bespoke, Styling, Appointment and social layout overrides.
- `components/LegacyPage.jsx` — load the scoped stylesheet after existing styles.
- `tests/test-v1194-styling-cards.mjs`, `tests/test-v1196-page-consistency.mjs`, `package.json` — updated regression tests and version.

## Verification

`npm run check`: **passed** including the existing CMS, authentication, customer-reference-image and appointment mock tests, plus V1.19.6 source checks. `node --check` passed on modified browser/server JS. The full Next.js production build **was not run** because project dependencies are not installed here. The headless browser **timed out**, so do not treat the design as visually signed off. Real Firebase submissions, Vercel and mobile-device presentation remain to be tested after deployment.

## Deployment and final QA

- Apply the **V1.19.6 small patch only over V1.19.5** (or use the full ZIP).
- Run `npm install`, `npm run check` and `npm run build`, then deploy to Vercel.
- Open `/bespoke`: three original photographs/cards must appear; test service links and Page Manager edits.
- Open `/styling-services`: three rectangular selection buttons, no Bespoke option, three descriptions; test pre-selected appointment service and Color Analysis studio restriction.
- Open `/appointment`: image + request form side by side on desktop, stacked on mobile; submit a request to the live CMS and verify it is *requested*, not confirmed.
- Open `/contact` and inspect footer: the same five icons, no duplicate text links; test WhatsApp only after setting the approved official number.
- Confirm My Story, product galleries, multi-collections, Accessories, and private reference-image upload remain functional.

**Note:** The V1.19.4 styling-page image fields may still exist in existing Firestore pages, but the original Bespoke service cards are managed through the Bespoke page's image fields. This update does not delete those old saved fields or images.
