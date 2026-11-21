# SHANERYN CMS V1.18.1 - Clear image upload guidance

The CMS previously displayed '3 MB recommended' for photographs even though V1.18.1 already permits up to 100 MB per file. Users could mistake the performance recommendation for a restriction.

**This patch changes display text only.** On every image or video media guidance panel, the upload allowance is shown explicitly as 'Maximum upload: 100 MB per file'. For photographs, 'For faster website loading: 3 MB recommended' appears separately. Original image dimensions, aspect-ratio recommendations, Firestore login, uploader behavior, CMS forms, frontend and SEO are unchanged.

## Update procedure
- For the small patch: copy `components/admin/CmsApp.jsx` and `tests/test-upload-v1181.mjs` into the existing V1.18.1 source, keeping their relative paths.
- For the complete package: replace the corresponding project source from the FULL ZIP, keeping your private environment variables in Vercel.
- Run `npm run check:media` and redeploy. No database migration is needed.

**Important:** Large uploads still require correctly configured Google Cloud Storage signed URL permissions and CORS. A displayed 100 MB limit does not confirm that a live large-file upload has succeeded.
