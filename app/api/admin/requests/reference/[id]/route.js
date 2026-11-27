import {sessionUser,requireRole} from '@/lib/cms-session';
import {adminDb,adminBucket} from '@/lib/cms-admin-server';
export const runtime='nodejs';
const error=(message,status)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request,{params}){
 try{
  const user=await sessionUser(request);
  if(!user)return error('Please sign in',401);
  requireRole(user,['super_admin','enquiries']);
  const {id}=await params;
  if(!/^[A-Za-z0-9]{10,60}$/.test(id||''))return error('Invalid reference',400);
  const doc=await adminDb().collection('cms_requests').doc(id).get();
  if(!doc.exists)return error('Request not found',404);
  const {path,contentType}=doc.data().referenceImage||{};
  if(!path?.startsWith(`private/customer-references/${id}/`)||!['image/jpeg','image/png','image/webp'].includes(contentType))return error('Image not found',404);
  const [bytes]=await adminBucket().file(path).download();
  return new Response(bytes,{headers:{'Content-Type':contentType,'Content-Disposition':'inline; filename="reference-image"','Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'}});
 }catch(e){console.error('SHANERYN private reference read:',e.message);return error('Unable to load reference image',e.status||503)}
}
