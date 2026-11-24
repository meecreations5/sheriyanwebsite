# SHANERYN CMS V1.18.10 — Past Work and Homepage Refinements

## What changed

### Bespoke: add more Past Work photographs

The existing **17 Past Work photographs** stay untouched. The CMS now provides a repeatable **Additional Past Work Gallery** editor within:

**Admin → Page Manager → Bespoke → Past Work Gallery**

1. Choose **+ Add Photograph**.
2. Use **Choose / Upload Image** to select a file from the Media Library or upload a new one (existing global upload policy applies).
3. Optionally enter a photo description for accessibility.
4. Leave **Show photograph on website** enabled, or switch it off to hide the photo without deleting it.
5. Use **Up**, **Down** or **Remove** to manage additional photos.
6. Select **Save & Publish** at the top, then visit **/bespoke#past-work**.

Additional photos appear after the original set, inside the **same masonry gallery and full-screen viewer**. The viewer count updates automatically. The server stores them in the existing `cms_pages/bespoke` document under `pastWorkExtras`; there is no new Firebase collection, new login system or migration. Empty photo slots are not shown. Up to 100 additional photos can be stored in one page document.

### Homepage: closing label

The pink label in the final section (including when edited to **COLLECT CELEBRATIONS**) is now upright, non-italic and readable. Its copy remains fully editable in Page Manager. No heading or CTA wording is changed by this release.

### Homepage: Bespoke photographs

The two overlapping editorial photographs in the **Bespoke** section no longer have the white/light frame borders or shadow. They retain the existing size, positioning and layout on desktop and mobile. Other photographs are untouched.

## Upgrading

- From V1.18.9: apply the **V1.18.10 patch ZIP** over your project root, keeping the relative folders (`lib`, `components`, `public`, `tests`).
- From older releases: use the **full V1.18.10 ZIP**.
- Run `npm install`, `npm run check`, then `npm run build`; deploy with Vercel and verify both desktop and mobile.
- Log in to CMS, edit Bespoke Past Work and confirm the images are visible on `/bespoke#past-work`.
- No new Firestore permissions, credentials or rules are needed for this change, assuming existing uploads and CMS writes are working.

## Verification

The existing V1.18 checks and new V1.18.10 gallery/CSS checks passed. A browser-computed-style test confirmed that both image borders become `0px` and the label becomes `font-style:normal`. A full Next.js production build was **not** completed in this environment because dependencies could not be installed; Vercel deployment and a live Firebase upload have not been tested.
