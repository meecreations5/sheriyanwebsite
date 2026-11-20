import {randomUUID} from 'node:crypto';
import {adminBucket,adminDb,assertOrigin,json} from '@/lib/cms-admin-server';
import {recordMedia,authorizeMedia} from '@/lib/cms-media-server';
export const runtime='nodejs';
export async function POST(request){
 try{
  assertOrigin(request);const auth=await authorizeMedia(request);if(auth.error)return json({error:auth.error},auth.status);
  const {uploadId}=await request.json();
  if(!/^[a-f0-9-]{36}$/.test(String(uploadId||'')))return json({error:'Invalid upload'},400);
  const ref=adminDb().collection('cms_pending_uploads').doc(uploadId),snap=await ref.get();
  if(!snap.exists)return json({error:'Upload not found'},404);
  const job=snap.data();
  if(job.userId!==auth.user.id||job.expiresAt<Date.now())return json({error:'This upload has expired or is not yours'},403);
  const file=adminBucket().file(job.path),[info]=await file.getMetadata();
  if(Number(info.size)!==job.size||info.contentType!==job.contentType)return json({error:'Uploaded file does not match selected file'},400);
  const token=randomUUID();
  await file.setMetadata({metadata:{...(info.metadata||{}),firebaseStorageDownloadTokens:token},cacheControl:'public,max-age=3600'});
  const result=await recordMedia(job.path,token,auth.user,{name:job.name,contentType:job.contentType,bytes:job.size});
  await ref.delete();return json({ok:true,item:result});
 }catch(error){console.error('Large media upload finalization:',error.message);return json({error:error.status?error.message:'Could not finish the upload. Check Storage upload settings.'},error.status||503)}
}
