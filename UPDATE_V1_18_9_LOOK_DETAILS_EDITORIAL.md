# SHANERYN CMS V1.18.9 - Look Detail Editorial Review

## Requested wording and hierarchy
- Small pink line above the closing statement: **clothes to empower**.
- Large white headline: **effortless moments**.
- Small white supporting line: **for fun celebrations**.
- Applied to the closing editorial section on every Look Details page; all three remain editable through Page Manager > Look Details.
- Existing default CMS patches from earlier releases are safely upgraded in memory when they still contain the old unedited wording. A custom replacement entered by the client is not overwritten.

## Look Details changes from annotated screenshots
- Move product tagline from below the product name to the small pink line above the name, using the existing Products & Looks > Tagline field.
- Display the product category (e.g. Skirt Sets) directly below the product name in a light tone; remove the duplicate Category column from Style No.
- Increase price prominence while keeping price optional and managed in the product CMS.
- Remove the Colour Story label, swatch and tone; show non-empty Fabric, Design Description, Embroidery & Detailing, and Occasion details before Buy It Now and Save Look.
- Do not display duplicate static Fabric/Occasion accordion content.
- Preserve all existing product media, category filters, purchase enquiry links, data, and responsive layout.

## Measurements
- Rename the section to **MEASUREMENTS REQUIRED**.
- Remove the old 'Considered around you' subtitle and introductory paragraph.
- Show inches only for the Look Details measurement fields.
- Update button label to **SUBMIT YOUR MEASUREMENTS**.
- The user enters at least one valid measurement plus their name and email; optional phone number is supported.
- Submission sends an authenticated-by-origin POST to the existing public `/api/requests` route, which saves an enquiry in `cms_requests` for the studio team. Body measurements are never placed into URL parameters or browser storage.
- The existing **Copy Measurements** action remains available as a secondary option.
- Display a confirmation reference only when the server confirms success.
- The server has existing rate limiting, request validation and Firestore permissions. Live end-to-end submission must still be tested after deploy.

## Install
- If currently using V1.18.8, merge the patch ZIP into the repository root and redeploy.
- If using an earlier version, deploy the complete V1.18.9 ZIP to preserve all prior fixes.
- No changes to `cms_users`, admin sessions, Firebase Authentication (still unused), Firestore rules or media size policy.
- Existing product details already entered in Firestore remain intact; no migration required.

## Checks
- Run `npm run check`. All included tests pass in the supplied source tree.
- Run `npm install`, `npm run build` and inspect the live desktop/mobile look detail pages in your deployment environment. The build was not completed in the isolated authoring environment because dependency installation timed out.
- Confirm a real measurement request appears in the CMS Enquiries list and verify all 3 closing lines on the public page.
