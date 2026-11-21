// Authorized, temporary browser upload targets. No admin credentials are sent to browsers.
// Prefer signed URLs when the server identity can sign. Local ADC user identities often
// cannot sign URLs, so an authenticated GCS resumable session is a compatible fallback.
export async function createBrowserUploadUrl(file, {origin, contentType}) {
  try {
    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 30 * 60 * 1000,
      contentType
    });
    return {url, mode: 'signed-url'};
  } catch (signError) {
    // The server uses its existing OAuth credentials to initiate a resumable session.
    // The resulting URL grants write access only to this random, newly created object.
    // Do not log the session URL: possession of it is authorization to upload.
    console.warn('Media signing unavailable, trying resumable upload:', signError?.code || signError?.message || 'unknown');
    const [url] = await file.createResumableUpload({
      origin,
      metadata: {contentType},
      preconditionOpts: {ifGenerationMatch: 0}
    });
    return {url, mode: 'resumable'};
  }
}
