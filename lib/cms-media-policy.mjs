// The one media upload policy shared by all SHANERYN CMS screens and server routes.
// 100 MB is the maximum size of one file, NOT the total Firebase Storage capacity.
export const MAX_MEDIA_MB = 100;
export const MAX_MEDIA_BYTES = MAX_MEDIA_MB * 1024 * 1024;
// Small files can be posted to Next.js; larger files must bypass Vercel via Storage.
export const DIRECT_UPLOAD_MB = 3;
export const DIRECT_UPLOAD_BYTES = DIRECT_UPLOAD_MB * 1024 * 1024;
export const IMAGE_MEDIA_TYPES = Object.freeze(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
export const VIDEO_MEDIA_TYPES = Object.freeze(['video/mp4', 'video/webm']);
export const SUPPORTED_MEDIA_TYPES = Object.freeze([...IMAGE_MEDIA_TYPES, ...VIDEO_MEDIA_TYPES]);

// Return a human-readable error so client and server enforce the same rules.
export function mediaUploadError({name, type, size}, kind = 'all') {
  if (!SUPPORTED_MEDIA_TYPES.includes(type)) return 'Use JPG, PNG, WebP, GIF, MP4 or WebM.';
  if (kind === 'image' && !IMAGE_MEDIA_TYPES.includes(type)) return 'Select a JPG, PNG, WebP or GIF photograph.';
  if (kind === 'video' && !VIDEO_MEDIA_TYPES.includes(type)) return 'Select an MP4 or WebM video.';
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_MEDIA_BYTES) {
    return `Maximum media size is ${MAX_MEDIA_MB} MB per file.`;
  }
  if (String(name || '').length > 200) return 'File name is too long (maximum 200 characters).';
  return '';
}
