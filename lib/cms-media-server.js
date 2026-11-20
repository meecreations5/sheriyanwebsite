import 'server-only';
import {randomUUID} from 'node:crypto';
import {adminBucket,adminDb} from '@/lib/cms-admin-server';
import {FieldValue} from '@google-cloud/firestore';
export const MEDIA_TYPES=['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'];
export const MAX_BYTES=50*1024*1024;
export const DIRECT_MAX_BYTES=3*1024*1024;
export function mediaValidation(name,type,size){
 if(!MEDIA_TYPES.includes(type))throw Object.assign(Error('Use JPG, PNG, WebP, GIF, MP4 or WebM.'),{status:400});
 if(!Number.isFinite(size)||size<1||size>MAX_BYTES)throw Object.assign(Error('Maximum media size is 50 MB.'),{status:400});
 if(String(name||'').length>200)throw Object.assign(Error('File name is too long'),{status:400});
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
