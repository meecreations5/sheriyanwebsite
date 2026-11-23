# SHANERYN CMS V1.18.4 - Product Image Publishing Reliability

## Problem addressed
A product's collection-card photograph could be saved successfully in the CMS but remain unchanged on the public website. The public website previously read Firestore with the public Firebase SDK and silently loaded the original seed images when Firestore reads failed (for example, if the rules had not been deployed). This caused old product photos to appear even when CMS publishing worked.

## Changes
1. Public server-rendered CMS content now first reads from Firestore using the same private Google Cloud connection already used for working admin publishing. If that read fails, it tries the existing rules-protected public Firestore SDK. If both methods fail, it reports a real error instead of quietly showing old seed imagery.
2. After uploading an image through a product/page field, the image is automatically selected in that field. You must still click Save & Publish. The standalone Media Library continues to support uploading files for later use.
3. The Products & Looks editor clearly labels the collection-card photograph as the image used in the homepage four-look grid, distinct from the editorial photograph and Photo 1 of the look-detail gallery.
4. Added regression tests simulating the Fire & Heart product image changing in Firestore, including recovery from a public-read permission failure.

## Updating Fire & Heart
- Admin > Products & Looks > Fire & Heart.
- Under Main Photographs, change **Homepage four-look grid / collection card (studio photograph)**. If you have just uploaded a file, check that the chosen picture appears in the field.
- Click Save & Publish. Confirm the new thumbnail shows in the product list.
- Open the homepage in a new browser tab and do a hard refresh (Ctrl + Shift + R). The third card should use the new studio photograph.
- If you also want to change the first photograph on the Look Detail page, open Gallery & Video and replace Photo 1, then Save & Publish again.

## Production prerequisites
- Working `CMS_GOOGLE_CREDENTIALS_JSON` or application-default credentials with Firestore access to project `shanerynwesbite` (same server connection used by CMS login and publishing).
- Keep the existing `cms_users` login, collections, and media configuration unchanged.
- Deploy the new source to Vercel; the fix is a source-code change.

## Verification
- Existing `npm run check` suite passed, including admin login/session mock, SEO, CMS editing and 100 MB media upload policy.
- New product-image sync mock tests passed.
- Full Next.js production build was not completed because package installation was unavailable in this environment; no live Firestore/production write test was performed.
