# SHANERYN CMS V1.18.13 - Editable Collections Showcase

## Fixed
- The Collections-page showcase (CURATED BY SHANERYN / Our Collections. / Explore considered edits for every occasion. / Explore edit) was previously hardcoded in `lib/render-page.js`, so the CMS could not edit it.
- Added four text fields to `data/seed/pages/collections.json` and a clear editing panel in **Page Manager > Collections**.
- Text is saved as normal `cms_pages/collections.patches` through the existing secure CMS API, using the currently installed `cms_users` authentication system.
- Existing saved CMS pages automatically receive the new seed fields when loaded; no Firestore migration or manual record insertion is required.
- The dynamic generated showcase now renders escaped, CMS-published text with the same `cms:` markers used by Page Manager's live preview. Clicking its text in the preview focuses the relevant editing field.
- Cards remain managed by **CMS > Collections**, where each card's title, description, cover image, visibility, product links and order can be updated independently.

## How to use
1. Sign in to **CMS > Page Manager**.
2. Select **Collections** in the Page dropdown.
3. In the new **Our Collections - Website Showcase** panel, edit small heading, main heading, description, or card link caption.
4. Click **Save & Publish**. Check the public **/collections** page.
5. To edit **THE CURVE EDIT** card, open the **Collections** module separately and save that collection.

## Not changed
No changes to homepage layout, Bespoke, user authentication, SEO, 100 MB upload policy, product data, or the public collection-card layout.

## Verification
`npm run check` includes a new test for the server renderer, safe HTML escaping, admin edit fields, and existing collection card behavior. Live Vercel testing is still required.
