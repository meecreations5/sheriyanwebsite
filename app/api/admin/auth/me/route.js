import {sessionUser} from '@/lib/cms-session';
import {json} from '@/lib/cms-admin-server';
export const runtime='nodejs';
export async function GET(request){
 const user=await sessionUser(request);
 return user?json({id:user.id,uid:user.id,username:user.username,role:user.role,projectId:'shanerynwesbite'}):json({error:'Not signed in'},401);
}
