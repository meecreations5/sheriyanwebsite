import {randomUUID} from 'node:crypto';
import {adminBucket,adminDb,assertOrigin,json} from '@/lib/cms-admin-server';
import {mediaValidation,newMediaPath,authorizeMedia} from '@/lib/cms-media-server';
import {FieldValue} from '@google-cloud/firestore';
export const runtime='nodejs';
export async function POST(request){
 try{
  assertOrigin(request);const auth=await authorizeMedia(request);if(auth.error)return json({error:auth.error},auth.status);
  const input=await request.json();mediaValidation(input.name,input.contentType,Number(input.size));
  const path=newMediaPath(input.name),uploadId=randomUUID();
  const [url]=await adminBucket().file(path).getSignedUrl({version:'v4',action:'write',expires:Date.now()+10*60*1000,contentType:input.contentType});
  await adminDb().collection('cms_pending_uploads').doc(uploadId).create({path,name:input.name,contentType:input.contentType,size:Number(input.size),userId:auth.user.id,expiresAt:Date.now()+15*60*1000,createdAt:FieldValue.serverTimestamp()});
  return json({url,uploadId});
 }catch(error){console.error('Large media upload sign:',error.message);return json({error:error.status?error.message:'Unable to prepare upload. Verify server credentials.'},error.status||503)}
}
