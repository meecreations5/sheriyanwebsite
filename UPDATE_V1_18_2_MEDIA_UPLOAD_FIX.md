# SHANERYN CMS V1.18.2 - Homepage Media Upload Repair

## The symptom

A signed-in editor selects an image larger than 3 MB in the Homepage Hero or another media field. The browser shows `POST /api/admin/media/sign 503 (Service Unavailable)` and says it cannot prepare the upload.

The code was attempting a V4 Cloud Storage signed PUT URL. A localhost user authenticated to Firestore via Google Cloud Application Default Credentials (ADC) may not have signing capability even though login and reading CMS records work. The same error can also mean missing Storage permissions.

## The targeted change

- Preserve the existing signed URL upload path whenever the server can sign.
- If signing fails, use the existing server's OAuth identity to create a Google Cloud Storage resumable session URL; the browser still uploads directly to Storage and the CMS still validates and records the uploaded file.
- Keep the 100 MB maximum file size, 3 MB small-file route, Firestore media library, role checks, HTTPS / same-origin restrictions, and all public website/SEO functionality intact.
- Provide a clearer server-side error and more useful response when Cloud Storage credentials, bucket, or access permissions are unavailable.
- No change to `cms_users`, passwords, authentication, or Firestore collections.

## Important prerequisites

1. The Next.js server must have working Google Cloud identity in production and locally. Use ADC or a valid service-account JSON supplied only to server-side environment variables. Never paste private keys into client code, GitHub, or chats.
2. This identity must have Cloud Storage permission to create and update objects in the bucket `shanerynwesbite.firebasestorage.app`. The `Storage Object Admin` role scoped to this bucket is a straightforward choice. `Cloud Datastore User` alone does not grant Storage permissions.
3. If uploads fail in the browser during the subsequent Storage PUT, verify bucket CORS allows `http://localhost:3000` and `https://shanerynwebsite.vercel.app` (see `storage-cors.json`). The CMS cannot configure bucket CORS automatically.

## How to test

1. Restart `npm run dev` after updating the changed files.
2. Sign into the existing CMS. Open Page Manager > Homepage > Desktop/Mobile Hero > Choose/Upload Image.
3. Test a 2 MB image (small upload path) and a 4-8 MB image (large upload path).
4. Select the uploaded image from Media Library, click Save & Publish, and check the public website.
5. If the CMS reports `Storage permission denied` or `Storage bucket was not found`, correct the Google Cloud bucket identity/configuration rather than changing CMS users.
6. Deploy to Vercel only after local verification; test the production upload after redeploy.

## Photo aspect ratios

The user-supplied `001_1080 X 1920.png` is 1080x1920 (portrait), approximately 4.3 MiB. It is suitable for the **mobile** hero's 9:16 guideline, not the **desktop** hero's 1920x1080 (16:9) guideline. Aspect ratio does not cause the `/api/admin/media/sign` HTTP 503 error.

## Verification and limitations

Automated CMS, SEO, login/session, upload routing and fallback tests run with `npm run check`. No live Cloud Storage permissions or real upload could be verified in this environment. A deployment must still supply functioning server credentials and Storage bucket permissions.
