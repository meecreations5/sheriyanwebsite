import {sessionUser,requireRole} from '@/lib/cms-session';
import {cmsServerApi} from '@/lib/cms-server-api';
import {assertOrigin,json,plain} from '@/lib/cms-admin-server';
export const runtime='nodejs';
const resources={pages:['super_admin','editor','viewer'],products:['super_admin','editor','products','viewer'],categories:['super_admin','editor','products','viewer'],collections:['super_admin','editor','products','viewer'],forms:['super_admin','editor','viewer'],media:['super_admin','editor','products','viewer'],settings:['super_admin','editor','viewer'],requests:['super_admin','enquiries'],revisions:['super_admin','editor'],seed:['super_admin'],users:['super_admin']};
async function handle(request,{params}){
 try{
  if(request.method!=='GET')assertOrigin(request);
  const user=await sessionUser(request);
  if(!user)return json({error:'Please sign in again'},401);
  const {path=[]}=await params;
  if(path.length>2)return json({error:'Not found'},404);
  const [resource]=path;
  if(!resources[resource])return json({error:'Not found'},404);
  requireRole(user,resources[resource]);
  if(user.role==='viewer'&&request.method!=='GET')return json({error:'Read-only access'},403);
  if(request.method!=='GET'&&request.method!=='DELETE'&&Number(request.headers.get('content-length')||0)>1500000)return json({error:'Content too large'},413);
  const body=request.method==='POST'||request.method==='PUT'?await request.json():{};
  const result=await cmsServerApi(path.join('/'),{method:request.method,body},user);
  return json(plain(result));
 }catch(error){
  console.error('SHANERYN CMS server action:',error.message);
  const safe=error.status?error.message:/permission|not authorised|not permitted|password|already exists|not found|invalid|must|limit|role|not allowed|unsupported|could not|cannot/i.test(error.message)?error.message:'Could not complete the operation. Check server configuration.';
  return json({error:safe},error.status||(/not authori|permission/i.test(safe)?403:400));
 }
}
export {handle as GET,handle as POST,handle as PUT,handle as DELETE};
