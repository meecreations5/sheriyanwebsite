import {NextResponse} from 'next/server';
import {checkCredentials} from '@/lib/cms-login-guard';
import {createSession,cookieSettings} from '@/lib/cms-session';
import {assertOrigin} from '@/lib/cms-admin-server';
export const runtime='nodejs';
export async function POST(request){
 try{
  assertOrigin(request);
  const {username,password}=await request.json();
  const user=await checkCredentials(username,password);
  if(!user)return NextResponse.json({error:'Invalid username or password'},{status:401,headers:{'Cache-Control':'no-store'}});
  const response=NextResponse.json({ok:true,id:user.id,uid:user.id,username:user.username,role:user.role},{headers:{'Cache-Control':'no-store'}});
  response.cookies.set(cookieSettings.name,createSession(user),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:28800});
  return response;
 }catch(error){
  return NextResponse.json({error:error.status===429?error.message:'Login is unavailable. Check server configuration or try again.',code:error.status||503},{status:error.status||503});
 }
}
