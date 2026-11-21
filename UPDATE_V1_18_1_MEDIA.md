# SHANERYN CMS V1.18.1: Media uploads up to 100 MB

This targeted update changes **CMS media uploads only**. Existing `cms_users` login, products, pages, SEO and public website UI are unchanged.

## What changed

- Maximum image/video file size is **100 MB**, formerly 50 MB.
- Media up to 3 MB continues to use the Next.js direct uploader.
- Larger files are uploaded **directly from the browser to Google Cloud Storage** using a temporary signed URL; the large binary is not sent through a Vercel Function.
- Signed URLs now expire after 30 minutes; CMS upload tickets last 40 minutes, to accommodate slower large-file uploads.
- The CMS displays the 100 MB limit and a clearer uploading message.
- `storage-cors.json` includes the confirmed Vercel origin `https://shanerynwebsite.vercel.app` and localhost.

## Critical deployment step: Cloud Storage bucket CORS

**Deploying the ZIP alone cannot update Google Cloud bucket CORS**. A Google Cloud admin must apply the configuration to bucket `shanerynwesbite.firebasestorage.app` using:

```bash
gcloud storage buckets update gs://shanerynwesbite.firebasestorage.app --cors-file=storage-cors.json
```

Or use Google Cloud Console > Cloud Storage > Buckets > bucket > Configuration > CORS.
The file supplied here is an example for the known localhost and Vercel origin; **merge other existing allowed origins before applying**, if your bucket serves any more domains. Do not enable wildcard origins unnecessarily.

## Prerequisites

The Next.js backend needs valid Firestore/Storage server credentials; the service account must be able to create signed Cloud Storage URLs (and access the bucket), in addition to writing `cms_media` Firestore entries. Keep all private credentials in Vercel environment variables; never place them in public client code.

## Verification

Run `npm run check:media`, then `npm run check` and `npm run build` in a configured environment. Upload 2 MB, 12 MB, and 70 MB media files using the production CMS. Verify each upload completes and appears in the Media Library. If large uploads fail, inspect the browser Network tab for failed Storage `OPTIONS`/`PUT` and Vercel logs for failed `sign` or `complete` requests.

Maximum 100 MB **per file**, not combined storage space or number of files. Large videos may still be best hosted on an external video platform for smooth visitor playback.
