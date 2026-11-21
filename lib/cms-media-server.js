import 'server-only';
import {randomUUID} from 'node:crypto';
import {adminBucket,adminDb} from '@/lib/cms-admin-server';
import {FieldValue} from '@google-cloud/firestore';
import {MAX_MEDIA_BYTES, DIRECT_UPLOAD_BYTES, SUPPORTED_MEDIA_TYPES, mediaUploadError} from '@/lib/cms-media-policy.mjs';
// Backwards-compatible names for the existing direct and signed-upload routes.
export const MEDIA_TYPES = SUPPORTED_MEDIA_TYPES;
export const MAX_BYTES = MAX_MEDIA_BYTES;
export const DIRECT_MAX_BYTES = DIRECT_UPLOAD_BYTES;
export function mediaValidation(name, type, size) {
  const error = mediaUploadError({name, type, size});
  if (error) throw Object.assign(Error(error), {status: 400});
}
export function newMediaPath(filename){return `media/${Date.now()}-${randomUUID()}-${String(filename||'upload').replace(/[^a-zA-Z0-9._-]/g,'_').slice(0,80)}`}
export function publicMediaUrl(path,token){
 const bucket=process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET||'shanerynwesbite.firebasestorage.app';
 return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(path)}?alt=media&token=${encodeURIComponent(token)}`;
}
export async function recordMedia(path,token,user,extra={}){
 const url=publicMediaUrl(path,token),doc=adminDb().collection('cms_media').doc(randomUUID());
 const record={url,path,name:extra.name||path.split('/').at(-1),contentType:extra.contentType||'',bytes:extra.bytes||0,uploadedBy:user.id,createdAt:FieldValue.serverTimestamp()};
 await doc.create(record);
 return {id:doc.id,...record,createdAt:new Date().toISOString()};
}
export async function authorizeMedia(request){
 const {sessionUser}=await import('@/lib/cms-session');
 const user=await sessionUser(request);
 if(!user)return {error:'Please sign in again',status:401};
 if(!['super_admin','editor','products'].includes(user.role))return {error:'Not authorised to upload media',status:403};
 return {user};
}
