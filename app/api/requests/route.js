// Public enquiry endpoint. Only this validated server route can write customer requests.
import {FieldValue} from '@google-cloud/firestore';
import {adminDb} from '@/lib/cms-admin-server';
export const runtime='nodejs';
const send=(value,status=200)=>Response.json(value,{status,headers:{'Cache-Control':'no-store'}});
const cut=(v,n=1600)=>String(v??'').trim().slice(0,n);
const validEmail=x=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x);
// Basic per-process throttling; configure Firebase App Check and edge throttling for production.
const recent=new Map();
function permitted(ip){const hour=Math.floor(Date.now()/3600000);const key=ip+'|'+hour;let entry=recent.get(key)||0;if(recent.size>10000)recent.clear();recent.set(key,entry+1);return entry<10}
export async function POST(request){
 try{
  const origin=request.headers.get('origin'),host=request.headers.get('host');
  if(origin&&host){try{if(new URL(origin).host!==host)return send({error:'Request origin not allowed'},403)}catch{return send({error:'Invalid request origin'},403)}}
  if(Number(request.headers.get('content-length')||0)>16000)return send({error:'Request too large'},413);
  const input=await request.json(),kind=input.kind;
  if(!['enquiry','appointment'].includes(kind))return send({error:'Invalid request type'},400);
  const f=input.fields||{};
  if(f.website)return send({ok:true,reference:'REQUEST-RECEIVED'}); // hidden bot trap
  const name=cut(f.name,120),email=cut(f.email,254),phone=cut(f.phone,35),message=cut(f.message||f.notes,1600);
  if(name.length<2||!validEmail(email))return send({error:'Please enter your name and email'},400);
  if(kind==='enquiry'&&message.length<3)return send({error:'Please enter a short message'},400);
  if(kind==='appointment'&&(!f.date||!f.time||!f.service||!f.mode||!f.timezone))return send({error:'Please provide appointment preferences'},400);
  if(kind==='appointment'&&cut(f.date,10)<new Date().toISOString().slice(0,10))return send({error:'Please select a future date'},400);
  if(kind==='appointment'&&/colou?r analysis/i.test(cut(f.service,100))&&!/studio/i.test(cut(f.mode,100)))return send({error:'Color Analysis appointments are available in the studio only'},400);
  const source=cut(input.source,500);if(!source.startsWith('/'))return send({error:'Invalid page'},400);
  const ip=cut(request.headers.get('x-forwarded-for')?.split(',')[0]||request.headers.get('x-real-ip')||'unknown',120);
  if(!permitted(ip))return send({error:'Too many requests; try again later'},429);
  const ref=adminDb().collection('cms_requests').doc();
  const reference=`SH-${kind==='appointment'?'APT':'ENQ'}-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${ref.id.slice(0,6).toUpperCase()}`;
  const fields=Object.fromEntries(Object.entries(f).slice(0,40).filter(([k])=>/^[a-zA-Z][\w-]{0,49}$/.test(k)&&k!=='website').map(([k,v])=>[k,cut(v,1600)]));
  await ref.set({reference,kind,status:kind==='appointment'?'requested':'new',name,email,phone,message,fields,source,createdAt:FieldValue.serverTimestamp(),notes:'',assignedTo:'',followUpDate:''});
  return send({ok:true,reference},201);
 }catch(error){console.error('SHANERYN public request failed:',error.message);return send({error:'Unable to save the request. Please try again.'},503)}
}
