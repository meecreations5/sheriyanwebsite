import {NextResponse} from 'next/server';
import {adminDb,assertOrigin} from '@/lib/cms-admin-server';
import {sessionUser,clearCookie} from '@/lib/cms-session';
import {passwordVerify,passwordHash,validPassword} from '@/lib/cms-password.mjs';
import {FieldValue} from '@google-cloud/firestore';
export const runtime='nodejs';
export async function POST(request){
 try{
  assertOrigin(request);const user=await sessionUser(request);
  if(!user)return NextResponse.json({error:'Please sign in again'},{status:401});
  const {currentPassword,newPassword}=await request.json();
  if(!validPassword(newPassword))return NextResponse.json({error:'Use a password between 12 and 128 characters.'},{status:400});
  const ref=adminDb().collection('cms_users').doc(user.id),snap=await ref.get();
  if(!await passwordVerify(currentPassword,snap.data()?.passwordHash))return NextResponse.json({error:'Current password is incorrect.'},{status:400});
  await ref.update({passwordHash:await passwordHash(newPassword),sessionVersion:FieldValue.increment(1),updatedAt:FieldValue.serverTimestamp()});
  await adminDb().collection('cms_login_attempts').doc(user.id).delete().catch(()=>{});
  const out=NextResponse.json({ok:true,message:'Password changed. Sign in with your new password.'});
  out.cookies.set(clearCookie.name,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});
  return out;
 }catch{return NextResponse.json({error:'Could not change password. Try again.'},{status:503})}
}
