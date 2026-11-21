import {randomUUID} from 'node:crypto';
import {adminBucket,adminDb,assertOrigin,json} from '@/lib/cms-admin-server';
import {mediaValidation,newMediaPath,authorizeMedia} from '@/lib/cms-media-server';
import {createBrowserUploadUrl} from '@/lib/cms-upload-url.mjs';
import {FieldValue} from '@google-cloud/firestore';

export const runtime = 'nodejs';

function safeUploadError(error) {
  if (error?.status && error.status < 500) return {status:error.status, error:error.message};
  const message = String(error?.message || '');
  const code = Number(error?.code || error?.status || error?.response?.statusCode);
  if (code === 403 || /storage\.objects\.(create|update)|permission denied|insufficient permissions/i.test(message)) {
    return {status:503, error:'Storage permission denied. Ask your administrator to give the CMS service account Storage Object Admin access to its media bucket.'};
  }
  if (code === 404 || /bucket.*(not found|does not exist)/i.test(message)) {
    return {status:503, error:'Storage bucket was not found. Check the configured Firebase Storage bucket.'};
  }
  if (/could not load.*default credentials|invalid.*credential|unauthenticated|no.*credential/i.test(message)) {
    return {status:503, error:'CMS server Storage credentials are unavailable. Check your local or Vercel server configuration.'};
  }
  return {status:503, error:'Unable to prepare image upload. Check the Next.js terminal or Vercel Function Logs for the Storage error.'};
}

export async function POST(request) {
  try {
    assertOrigin(request);
    const auth = await authorizeMedia(request);
    if (auth.error) return json({error:auth.error}, auth.status);
    const input = await request.json();
    mediaValidation(input.name, input.contentType, Number(input.size));
    const path = newMediaPath(input.name);
    const uploadId = randomUUID();
    const {url,mode} = await createBrowserUploadUrl(adminBucket().file(path), {
      origin: new URL(request.url).origin,
      contentType: input.contentType
    });
    await adminDb().collection('cms_pending_uploads').doc(uploadId).create({
      path, name:input.name, contentType:input.contentType, size:Number(input.size),
      userId:auth.user.id, expiresAt:Date.now()+40*60*1000,
      createdAt:FieldValue.serverTimestamp()
    });
    return json({url,uploadId,mode});
  } catch (error) {
    console.error('Large media upload preparation failed:',error?.code || '', error?.message || error);
    const response = safeUploadError(error);
    return json({error:response.error},response.status);
  }
}
