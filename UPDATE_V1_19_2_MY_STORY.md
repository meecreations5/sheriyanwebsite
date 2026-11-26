# SHANERYN V1.19.2 — My Story (approved founder narrative)

Base: V1.19.1. Updated the **Our Story** page with the complete client-provided “My Story” narrative.

- Replaced the previous all-caps founder letter, without changing the founder photograph, LinkedIn link, Vision & Mission or Words & Impressions.
- Retained every sentence of the approved copy, including the design career achievements, 2025 founding date, Santacruz studio, closing quote and signature.
- Added individually editable CMS fields for the heading, nine narrative paragraphs, motto and founder signoff.
- Existing published Firestore fields and settings remain intact. Old founder-letter field IDs are no longer used; new IDs prevent stale text patches from overriding the approved text.
- Added an Our Story-only stylesheet loaded last for editorial readable text, comfortable mobile proportions and no shouty letter-spacing.
- SEO description uses the client-provided facts.

## Editing

Admin → Page Manager → Our Story → My Story / Designer. Edit any paragraph and Save & Publish. The existing page's `cms_pages/story` record requires no migration.

## Verification

`npm run check` includes `tests/test-v1192-my-story.mjs`. Offline visual checks do not verify production Firestore or Vercel; check the live page after deployment.
