# SHANERYN CMS V1.18.14 - Bespoke Image Borders

## Change

The two overlapping editorial photographs in the **Bespoke page introduction** now have no image border, outline or drop shadow, matching the earlier homepage refinement.

The approved Bespoke page order and all other content are unchanged. The new stylesheet is intentionally linked **only on `/bespoke`**, after other CMS styles, so earlier rules applying 5-8 px borders (including mobile styling) cannot override it.

## Unchanged

- All section sequencing, show/hide controls, text, gallery images and image positions
- Home, Collections, Look Details and all other public pages
- `cms_users` authentication and roles
- Firestore content and Media Library, 100 MB upload settings, SEO

## Deployment

From V1.18.13, extract the patch ZIP over the project root, keeping folder paths intact. Deploy and visually check the two overlapping Bespoke photographs on desktop and mobile. No database migrations, data updates or environment variable changes are required.

Run `npm run check` to include the new regression test. The stylesheet test cannot establish a live Vercel visual result, which must be checked after deployment.
