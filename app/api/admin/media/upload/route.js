import {randomUUID} from 'node:crypto';
import {adminBucket,assertOrigin,json} from '@/lib/cms-admin-server';
import {DIRECT_MAX_BYTES,mediaValidation,newMediaPath,publicMediaUrl,recordMedia,authorizeMedia} from '@/lib/cms-media-server';
export const runtime='nodejs';
export async function POST(request){
 try{
  assertOrigin(request);
  const auth=await authorizeMedia(request);if(auth.error)return json({error:auth.error},auth.status);
  if(Number(request.headers.get('content-length')||0)>DIRECT_MAX_BYTES+65536)return json({error:'For files over 3 MB, use the large-file uploader.'},413);
  const form=await request.formData(),file=form.get('file');
  if(!file||typeof file.arrayBuffer!=='function')return json({error:'Select a file'},400);
  mediaValidation(file.name,file.type,file.size);
  if(file.size>DIRECT_MAX_BYTES)return json({error:'For files over 3 MB, use the large-file uploader.'},413);
  const path=newMediaPath(file.name),token=randomUUID();
  await adminBucket().file(path).save(Buffer.from(await file.arrayBuffer()),{
   resumable:false,metadata:{contentType:file.type,cacheControl:'public,max-age=3600',metadata:{firebaseStorageDownloadTokens:token}}
  });
  const record=await recordMedia(path,token,auth.user,{name:file.name,contentType:file.type,bytes:file.size});
  return json({ok:true,item:record},201);
 }catch(error){console.error('Media upload error:',error.message);return json({error:error.status?error.message:'Could not upload this file. Check server Storage settings.'},error.status||503)}
}
