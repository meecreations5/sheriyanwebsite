'use client';
// A small authenticated HTTP bridge. No Firebase Auth and NO browser writes to Firestore.
export async function cmsApi(resource,opts={}){
 const method=opts.method||'GET';
 const path=String(resource||'').split('/').map(encodeURIComponent).join('/');
 const response=await fetch('/api/admin/cms/'+path,{
  method,credentials:'same-origin',cache:'no-store',
  headers:method==='GET'?{}:{'Content-Type':'application/json'},
  ...(method==='GET'||method==='DELETE'?{}:{body:JSON.stringify(opts.body||{})})
 });
 const data=await response.json().catch(()=>({error:'Server returned an unexpected response'}));
 if(!response.ok){if(response.status===401&&typeof window!=='undefined')window.dispatchEvent(new Event('shaneryn-session-expired'));throw Error(data.error||'CMS request failed')}
 return data;
}
export async function authApi(action,body={}){
 const method=action==='me'?'GET':'POST';
 const response=await fetch('/api/admin/auth/'+action,{
  method,credentials:'same-origin',cache:'no-store',
  ...(method==='POST'?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})
 });
 const data=await response.json().catch(()=>({error:'Server returned an unexpected response'}));
 if(!response.ok)throw Error(data.error||'Unable to complete the request');
 return data;
}
