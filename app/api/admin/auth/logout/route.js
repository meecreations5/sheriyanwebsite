import {NextResponse} from 'next/server';
import {clearCookie} from '@/lib/cms-session';
import {assertOrigin} from '@/lib/cms-admin-server';
export const runtime='nodejs';
export async function POST(request){
 try{assertOrigin(request)}catch{return NextResponse.json({error:'Invalid origin'},{status:403})}
 const out=NextResponse.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 out.cookies.set(clearCookie.name,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict',path:'/',maxAge:0});
 return out;
}
