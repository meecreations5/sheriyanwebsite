'use client';
import React,{useEffect,useState,useMemo,useRef} from 'react';
import {cmsApi,authApi} from '@/lib/cms-client-api';
import {slugify,productSlug,productPath} from '@/lib/product-paths';
import {getYoutubeVideoId,isVideoFile,youtubeEmbedUrl} from '@/lib/video-url';
import {MAX_MEDIA_MB, DIRECT_UPLOAD_BYTES, IMAGE_MEDIA_TYPES, VIDEO_MEDIA_TYPES, SUPPORTED_MEDIA_TYPES, mediaUploadError} from '@/lib/cms-media-policy.mjs';
const normalizeAdminUsername=x=>String(x||'').trim().toLowerCase();
const validAdminUsername=x=>/^[a-z][a-z0-9._-]{2,31}$/.test(normalizeAdminUsername(x));

const NAV=[['dashboard','▦','Dashboard'],['users','♙','Admin Users'],['pages','▤','Page Manager'],['products','◇','Products & Looks'],['categories','▤','Categories'],['collections','▥','Collections'],['forms','≡','Forms'],['enquiries','✉','Enquiries'],['appointments','▣','Appointments'],['media','▧','Media Library'],['settings','⚙','Global Settings']];
const ROLE_NAMES={super_admin:'Super Admin',editor:'Content Editor',products:'Product Manager',enquiries:'Enquiry Staff',viewer:'Read Only'};
const Field=({label,children})=><label className="admin-field"><span>{label}</span>{children}</label>;
const Input=({value,onChange,...p})=><input className="admin-input" value={value??''} onChange={e=>onChange(e.target.value)} {...p}/>;
const TextArea=({value,onChange,...p})=><textarea className="admin-textarea" value={value??''} onChange={e=>onChange(e.target.value)} {...p}/>;
const Select=({value,onChange,options,...p})=><select className="admin-select" value={value??''} onChange={e=>onChange(e.target.value)} {...p}>{options.map(o=><option key={typeof o==='string'?o:o.value} value={typeof o==='string'?o:o.value}>{typeof o==='string'?o:o.label}</option>)}</select>;
const Check=({label,checked,onChange})=><label className="admin-check"><input type="checkbox" checked={Boolean(checked)} onChange={e=>onChange(e.target.checked)}/>{label}</label>;
const Btn=({children,onClick,variant='',...p})=><button type="button" className={'admin-btn '+variant} onClick={onClick} {...p}>{children}</button>;
const stable=(v)=>JSON.parse(JSON.stringify(v));
const mediaSrc=v=>String(v||'').startsWith('assets/')?'/'+v:(String(v||'').startsWith('favicon')?'/'+v:v);
function prettyError(err){return err?.message||String(err)}

function Login({onLogin}){
 const [identifier,setIdentifier]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function go(e){
  e.preventDefault();setError('');setBusy(true);
  try{
   const result=await authApi('login',{username:identifier,password});
   setPassword('');onLogin(result);
  }catch(err){setError(prettyError(err))}finally{setBusy(false)}
 }
 return <div className="admin-shell admin-login-wrap"><form className="admin-login" onSubmit={go}>
  <div className="login-logo">SHANERYN</div><div className="login-kicker">CONTENT STUDIO</div>
  <label htmlFor="login-user">USERNAME</label>
  <input id="login-user" type="text" autoComplete="username" value={identifier} onChange={e=>setIdentifier(e.target.value)} required placeholder="e.g. admin"/>
  <label htmlFor="login-pass">PASSWORD</label>
  <input id="login-pass" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/>
  {error&&<p className="admin-status error" style={{marginTop:15}} role="alert">{error}</p>}
  <button disabled={busy} type="submit">{busy?'PLEASE WAIT...':'SIGN IN'}</button>
  <p className="login-note">Sign in using your CMS username and password. No email needed.</p>
 </form></div>;
}

function PasswordChange({onClose,onChanged}){
 const [currentPassword,setCurrentPassword]=useState(''),[nextPassword,setNextPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 async function save(e){
  e.preventDefault();setStatus('');setBusy(true);
  try{
   if(nextPassword.length<12)throw Error('Use a new password with at least 12 characters.');
   if(nextPassword!==confirm)throw Error('New passwords do not match.');
   await authApi('change-password',{currentPassword,newPassword:nextPassword});
   setCurrentPassword('');setNextPassword('');setConfirm('');onChanged();
  }catch(err){setStatus(prettyError(err))}finally{setBusy(false)}
 }
 return <div className="admin-modal-bg" onClick={onClose}><div className="admin-modal" role="dialog" aria-modal="true" aria-label="Change password" onClick={e=>e.stopPropagation()}>
  <div className="admin-row"><h2>Change My Password</h2><Btn variant="neutral sm" onClick={onClose}>Close</Btn></div>
  <p className="admin-subtitle">Change your password. You will sign in again with the new password.</p>
  {status&&<p role="alert" className="admin-status error">{status}</p>}
  <form onSubmit={save} autoComplete="off" style={{marginTop:18}}>
   <Field label="Current password"><input className="admin-input" type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required/></Field>
   <Field label="New password"><input className="admin-input" type="password" autoComplete="new-password" value={nextPassword} onChange={e=>setNextPassword(e.target.value)} minLength={12} required/></Field>
   <Field label="Confirm new password"><input className="admin-input" type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={12} required/></Field>
   <button type="submit" disabled={busy} className="admin-btn">{busy?'Saving...':'Change Password'}</button>
  </form>
 </div></div>;
}

function ResetStaffPassword({staff,api,onClose}){
 const [nextPassword,setNextPassword]=useState(''),[confirm,setConfirm]=useState(''),[showPassword,setShowPassword]=useState(false),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[done,setDone]=useState(false);
 function generate(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#%+-';
  const bytes=new Uint8Array(24);crypto.getRandomValues(bytes);
  const generated=Array.from(bytes,b=>alphabet[b%alphabet.length]).join('');
  setNextPassword(generated);setConfirm(generated);setShowPassword(true);setStatus('Generated password. Share it privately with staff.');
 }
 async function copyPassword(){if(!nextPassword)return;try{await navigator.clipboard.writeText(nextPassword);setStatus('Password copied.')}catch{setStatus('Copy unavailable. Select the displayed password to copy.') }}
 async function save(e){
  e.preventDefault();setStatus('');
  if(nextPassword.length<12||nextPassword.length>128){setStatus('Use a password between 12 and 128 characters.');return}
  if(nextPassword!==confirm){setStatus('Passwords do not match.');return}
  if(!window.confirm('Set a new password for '+staff.username+'?'))return;
  setBusy(true);
  try{
   await api('users/'+staff.id+':reset',{method:'POST',body:{password:nextPassword}});
   setDone(true);setStatus('Password updated. The staff member can now sign in with the new password.');
  }catch(error){setStatus(prettyError(error))}finally{setBusy(false)}
 }
 return <div className="admin-modal-bg" onClick={onClose}><div className="admin-modal" role="dialog" aria-modal="true" aria-label="Reset staff password" onClick={e=>e.stopPropagation()}>
  <div className="admin-row"><h2>Reset Password</h2><Btn variant="neutral sm" onClick={onClose}>Close</Btn></div>
  <p className="admin-subtitle">Staff account: <strong>{staff.username}</strong></p>
  {status&&<p role="status" className={'admin-status '+(done?'':'error')}>{status}</p>}
  {!done?<form onSubmit={save} autoComplete="off" style={{marginTop:18}}>
   <Field label="New password"><div className="admin-flex" style={{flexWrap:'nowrap'}}><input className="admin-input" type={showPassword?'text':'password'} minLength={12} maxLength={128} autoComplete="new-password" value={nextPassword} onChange={e=>setNextPassword(e.target.value)} required/><Btn variant="secondary sm" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</Btn></div></Field>
   <Field label="Confirm new password"><input className="admin-input" type={showPassword?'text':'password'} minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></Field>
   <div className="admin-flex" style={{marginBottom:14}}><Btn variant="secondary sm" onClick={generate}>Generate Strong Password</Btn><Btn variant="secondary sm" onClick={copyPassword} disabled={!nextPassword}>Copy Password</Btn></div>
   <button type="submit" className="admin-btn" disabled={busy}>{busy?'Saving...':'Save New Password'}</button>
   <p className="admin-note" style={{marginTop:12}}>Saved securely as a password hash in cms_users. No Firebase Authentication or Cloud Function required.</p>
  </form>:<div className="admin-flex" style={{marginTop:16}}><Btn onClick={copyPassword}>Copy New Password</Btn><Btn variant="neutral sm" onClick={onClose}>Done</Btn></div>}
 </div></div>;
}

const IMAGE_GUIDES={
 general:{label:'Photograph',ratio:'3:4',size:'1200 × 1600 px',max:'3 MB recommended'},
 desktop:{label:'Desktop homepage hero',ratio:'16:9',size:'1920 × 1080 px',max:'3 MB recommended'},
 mobile:{label:'Mobile homepage hero',ratio:'9:16',size:'1080 × 1920 px',max:'3 MB recommended'},
 bestseller:{label:'Best Seller section',ratio:'2:3',size:'1200 × 1800 px',max:'3 MB recommended'},
 catalogue:{label:'Product catalogue / studio',ratio:'3:4',size:'1200 × 1600 px',max:'3 MB recommended'},
 editorial:{label:'Editorial look photograph',ratio:'2:3',size:'1200 × 1800 px',max:'3 MB recommended'},
 collection:{label:'Collection / category cover',ratio:'4:3',size:'1600 × 1200 px',max:'3 MB recommended'},
 social:{label:'Social preview',ratio:'1.91:1',size:'1200 × 630 px',max:'3 MB recommended'},
 favicon:{label:'Favicon',ratio:'1:1',size:'512 × 512 px',max:'250 KB recommended'},
 logo:{label:'Official logo',ratio:'Original',size:'At least 1000 px wide',max:'Transparent PNG / WebP recommended'}
};
const VIDEO_GUIDE={label:'Video',ratio:'16:9',size:'1920 × 1080 px'};
function MediaGuide({spec='general',type='image'}){
 const g=type==='video'?VIDEO_GUIDE:(IMAGE_GUIDES[spec]||IMAGE_GUIDES.general);
 const formats=type==='video'?'MP4, WebM':type==='all'?'JPG, PNG, WebP, GIF, MP4, WebM':'JPG, PNG, WebP, GIF';
 return <div className="cms-media-guide"><strong>{type==='all'?'Photographs & videos':g.label}</strong><span>Recommended {type==='all'?'photo ':''}dimensions: {g.size} · Ratio {g.ratio}</span><span>Formats: {formats} · <strong>Maximum upload: {MAX_MEDIA_MB} MB per file</strong></span>{type!=='video'&&<span>For faster website loading: {g.max}</span>}</div>;
}
async function mediaRequest(route,body){
 const res=await fetch('/api/admin/media/'+route,{method:'POST',credentials:'same-origin',...(body instanceof FormData?{body}:{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})});
 const data=await res.json().catch(()=>({error:'Unexpected upload response'}));
 if(!res.ok)throw Error(data.error||'Media upload failed');return data;
}
function MediaPicker({api,onPick,onClose,type='all',spec='general'}){
 const [items,setItems]=useState([]),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
 useEffect(()=>{api('media').then(r=>setItems(Array.isArray(r)?r:[])).catch(e=>setStatus(e.message))},[api]);
 const fileAccept=(type==='video'?VIDEO_MEDIA_TYPES:type==='image'?IMAGE_MEDIA_TYPES:SUPPORTED_MEDIA_TYPES).join(',');
 const compatible=x=>type==='all'||(type==='video'?x.contentType?.startsWith('video/'):x.contentType?.startsWith('image/'));
 async function upload(files){
  const file=files?.[0];if(!file)return;
  const validationError=mediaUploadError({name:file.name,type:file.type,size:file.size},type);
  if(validationError){setStatus(validationError);return}
  setBusy(true);setStatus('Uploading '+file.name+' ('+(file.size/(1024*1024)).toFixed(1)+' MB)… Please keep this window open.');
  try{
   let response;
   if(file.size<=DIRECT_UPLOAD_BYTES){const form=new FormData();form.append('file',file);response=await mediaRequest('upload',form)}
   else{
    const signed=await mediaRequest('sign',{name:file.name,contentType:file.type,size:file.size});
    const uploaded=await fetch(signed.url,{method:'PUT',headers:{'Content-Type':file.type},body:file});
    if(!uploaded.ok)throw Error('Large-file upload failed ('+uploaded.status+'). Check your Firebase Storage bucket CORS configuration.');
    response=await mediaRequest('complete',{uploadId:signed.uploadId});
   }
   setItems(old=>[response.item,...old]);
   // In an image/video field, uploading a file also selects it for that field.
   // Users must still click Save & Publish on the parent form.
   if(type!=='all'&&response.item?.url){onPick(response.item.url);onClose();}
   else setStatus('Upload complete. Select a file below or close the library.');
  }catch(error){setStatus('Upload failed: '+prettyError(error))}finally{setBusy(false)}
 }
 return <div className="admin-modal-bg" onClick={onClose}><div className="admin-modal" onClick={e=>e.stopPropagation()}><div className="admin-row"><h2>Media Library</h2><Btn variant="neutral sm" onClick={onClose}>Close ×</Btn></div>
  <p className="admin-subtitle">Select an existing file or upload a new file, up to {MAX_MEDIA_MB} MB each.</p><MediaGuide spec={spec} type={type}/>
  <p style={{marginTop:15}}><input type="file" accept={fileAccept} disabled={busy} onChange={e=>{upload(e.target.files);e.target.value='';}}/></p>
  {status&&<p className="admin-status" role="status" style={{marginTop:12}}>{status}</p>}
  <div className="admin-media-grid">{items.filter(compatible).map((item,i)=><button key={item.id||i} className="admin-media-tile" onClick={()=>{onPick(item.url);onClose()}}>{item.contentType?.startsWith('video/')?<video muted playsInline src={item.url} style={{width:'100%',height:140,objectFit:'cover'}}/>:<img src={item.url} alt={item.name||'Upload'}/>}<span>{item.name||'Media'}</span></button>)}</div>
 </div></div>;
}

function MediaField({value,onChange,pick,spec='general'}){
 const [showUrl,setShowUrl]=useState(false);
 return <div className="cms-simple-media-field">
  <MediaGuide spec={spec}/>
  {value?<img className="admin-image-preview" style={{maxWidth:225,marginBottom:10}} src={mediaSrc(value)} alt="Selected image"/>:<div className="cms-image-empty">No photograph selected</div>}
  <div className="admin-flex"><Btn variant="secondary sm" onClick={()=>pick(onChange,'image',spec)}>{value?'Change Image':'Choose / Upload Image'}</Btn>{value&&<Btn variant="neutral sm" onClick={()=>onChange('')}>Remove</Btn>}<Btn variant="neutral sm" onClick={()=>setShowUrl(x=>!x)}>{showUrl?'Hide URL':'Use Image URL'}</Btn></div>
  {showUrl&&<div style={{marginTop:8}}><Input value={value} onChange={onChange} placeholder="https://... or assets/image.webp"/></div>}
 </div>;
}

function VideoField({value,onChange,pick}){
 const [mode,setMode]=useState(getYoutubeVideoId(value)?'youtube':'upload');
 useEffect(()=>{if(getYoutubeVideoId(value))setMode('youtube');else if(isVideoFile(value))setMode('upload')},[value]);
 const embed=youtubeEmbedUrl(value);
 return <div className="cms-video-editor">
  <div className="admin-flex" style={{marginBottom:12}}>
   <Btn variant={mode==='upload'?'':'secondary sm'} onClick={()=>{setMode('upload');if(getYoutubeVideoId(value))onChange('')}}>Upload Video</Btn>
   <Btn variant={mode==='youtube'?'':'secondary sm'} onClick={()=>{setMode('youtube');if(isVideoFile(value))onChange('')}}>YouTube Link</Btn>
   {value&&<Btn variant="neutral sm" onClick={()=>onChange('')}>Remove video</Btn>}
  </div>
  {mode==='youtube'?<Field label="Paste a YouTube video link"><Input value={isVideoFile(value)?'':(value||'')} placeholder="https://www.youtube.com/watch?v=..." onChange={onChange}/></Field>:<><MediaGuide type="video"/><div className="admin-flex"><Btn variant="secondary" onClick={()=>pick(onChange,'video','film')}>Select / Upload Video</Btn>{isVideoFile(value)&&<span className="admin-note">Video selected</span>}</div></>}
  {mode==='youtube'&&value&&!embed&&<p className="admin-status error">Enter a valid YouTube link.</p>}
  {embed&&mode==='youtube'&&<iframe title="YouTube preview" src={embed} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen className="cms-video-preview"/>}
  {mode==='upload'&&isVideoFile(value)&&<video className="cms-video-preview" src={mediaSrc(value)} controls playsInline preload="metadata"/>}
 </div>;
}

function readableFieldLabel(f){
 const hint=String(f.label||'').replace(/^[^:]*:\s*/,'').replace(/\s+/g,' ').trim();
 const short=hint.length>65?hint.slice(0,65)+'...':hint;
 if(f.kind==='href')return (f.tag==='a'?'Button / link destination':'Link destination')+(short?' - '+short:'');
 if(f.kind==='src'||f.kind==='background')return 'Photograph'+(short&&short!=='photo'?' - '+short:'');
 if(f.kind==='text')return (['h1','h2','h3','h4'].includes(f.tag)?'Heading':f.tag==='p'?'Paragraph':'Text')+(short?' - '+short:'');
 if(f.kind==='visibility')return 'Element visibility'+(short?' - '+short:'');
 return f.kind.replace(/-/g,' ').replace(/^./,x=>x.toUpperCase())+(short?' - '+short:'');
}
const linkChoices=[
 {value:'/',label:'Homepage'},
 {value:'/collections',label:'All Collections / Products'},
 {value:'/bespoke',label:'Bespoke Couture'},
 {value:'/bespoke#services',label:'Styling Services'},
 {value:'/story',label:'Our Story'},
 {value:'/film',label:'Fashion Film'},
 {value:'/contact',label:'Contact Us'},
 {value:'/contact?interest=Bespoke%20%2F%20Customisation',label:'Bespoke Enquiry'},
 {value:'/contact?appointment=1',label:'Book an Appointment'}
];
function cleanPublicLink(raw){
 const val=String(raw||'').trim();
 return val.replace(/^(?:\/?)(index|collections|collection|bespoke|story|film|testimonials|contact)\.html(?=[?#]|$)/i,(_,route)=>route==='index'?'/':'/'+route);
}
function LinkPicker({value,onChange}){
 const clean=cleanPublicLink(value);
 const [customMode,setCustomMode]=useState(false);
 const chosen=!customMode&&linkChoices.some(c=>c.value===clean)?clean:'custom';
 return <div className="cms-friendly-picker">
  <Select value={chosen} onChange={v=>{setCustomMode(v==='custom');if(v!=='custom')onChange(v)}} options={[...linkChoices,{value:'custom',label:'External or custom link'}]}/>
  {chosen==='custom'&&<Input value={clean} placeholder="https://... or /contact" onChange={v=>onChange(v)}/>}
  <small className="admin-note">Visitors will be directed here when they select this button or link.</small>
 </div>;
}
function ChipEditor({value=[],onChange,suggestions=[],placeholder='Add an item'}){
 const [input,setInput]=useState('');
 const items=Array.isArray(value)?value:[];
 const add=raw=>{const v=String(raw||'').trim();if(v&&!items.some(t=>t.toLowerCase()===v.toLowerCase()))onChange([...items,v]);setInput('')};
 return <div className="cms-chip-editor">
  <div className="cms-chips">{items.map(s=><span className="cms-chip" key={s}>{s}<button type="button" aria-label={'Remove '+s} onClick={()=>onChange(items.filter(x=>x!==s))}>x</button></span>)}{!items.length&&<small className="admin-note">No items selected yet</small>}</div>
  <div className="admin-flex" style={{flexWrap:'nowrap'}}><Input value={input} placeholder={placeholder} onChange={setInput} onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add(input)}}}/><Btn variant="secondary sm" onClick={()=>add(input)}>+ Add</Btn></div>
  {!!suggestions.length&&<div className="cms-chip-suggestions">{suggestions.filter(s=>!items.includes(s)).map(s=><button type="button" key={s} onClick={()=>add(s)}>+ {s}</button>)}</div>}
 </div>;
}
function MultiProductPicker({products=[],selected=[],onChange}){
 const active=Array.isArray(selected)?selected:[];
 return <div className="cms-product-picker">
  <p className="admin-note" style={{marginBottom:10}}>Choose products by photograph and name. No product IDs needed.</p>
  <div className="cms-product-choice-grid">{products.map(product=><label className={'cms-product-choice '+(active.includes(product.id)?'checked':'')} key={product.id}>
   <input type="checkbox" checked={active.includes(product.id)} onChange={e=>onChange(e.target.checked?[...active,product.id]:active.filter(x=>x!==product.id))}/>
   {product.catalogueImg||product.img?<img src={mediaSrc(product.catalogueImg||product.img)} alt=""/>:null}
   <span><strong>{product.title||'Untitled'}</strong><small>{product.cat||'Uncategorised'}</small></span>
  </label>)}</div>
 </div>;
}
function MeasurementGroupEditor({value,onChange}){
 const groups=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
 const [newName,setNewName]=useState('');
 function add(){const key=newName.trim();if(key&&!Object.keys(groups).includes(key))onChange({...groups,[key]:[]});setNewName('')}
 function rename(oldName,nextName){const key=String(nextName||'').trim();if(!key||key===oldName||Object.prototype.hasOwnProperty.call(groups,key))return;
  const out={};for(const [name,items] of Object.entries(groups))out[name===oldName?key:name]=items;onChange(out)
 }
 return <div className="cms-measurements">
  {Object.entries(groups).map(([group,measurements])=><MeasurementGroup key={group} name={group} measurements={measurements} onRename={v=>rename(group,v)} onChange={v=>onChange({...groups,[group]:v})} onRemove={()=>{const out={...groups};delete out[group];onChange(out)}}/>)}
  <div className="admin-flex"><div style={{flex:1}}><Input value={newName} placeholder="New group, e.g. Jacket" onChange={setNewName} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();add()}}}/></div><Btn variant="secondary sm" onClick={add}>+ Add group</Btn></div>
 </div>;
}
function MeasurementGroup({name,measurements,onRename,onChange,onRemove}){
 const [label,setLabel]=useState(name);useEffect(()=>setLabel(name),[name]);
 return <div className="admin-editor-field"><div className="admin-row"><strong>Measurement group</strong><Btn variant="danger sm" onClick={onRemove}>Remove group</Btn></div>
  <Field label="Group name"><Input value={label} onChange={setLabel} onBlur={()=>onRename(label)}/></Field>
  <Field label="Measurements to request"><ChipEditor value={measurements} onChange={onChange} suggestions={['Chest','Waist','Hip','Shoulder','Sleeve Length','Garment Length','Height']}/></Field>
 </div>;
}

function Dashboard({api,me,onNavigate,canOpen}){
 const [counts,setCounts]=useState({products:0,pages:0,enquiries:0,appointments:0}),[issue,setIssue]=useState(''),[seeding,setSeeding]=useState(false);
 async function refresh(){try{const [pages,products,requests]=await Promise.all([canOpen('pages')?api('pages'):[],canOpen('products')?api('products'):[],canOpen('enquiries')?api('requests'):[]]);setCounts({pages:pages.length,products:Array.isArray(products)?products.length:0,enquiries:requests.filter(x=>x.kind==='enquiry'&&x.status==='new').length,appointments:requests.filter(x=>x.kind==='appointment'&&x.status==='requested').length})}catch(e){setIssue(e.message)}}
 useEffect(()=>{refresh()},[]);
 async function seed(){if(!confirm('Import the approved V6.9 baseline into Firestore? Existing records will NOT be overwritten.'))return;setSeeding(true);try{await api('seed',{method:'POST'});setIssue('Baseline imported. Your live website can now be edited from Admin.');refresh()}catch(e){setIssue('Import failed: '+e.message)}finally{setSeeding(false)}}
 const metrics=[['Products',counts.products,'products'],['Website Pages',counts.pages,'pages'],['New Enquiries',counts.enquiries,'enquiries'],['Appointment Requests',counts.appointments,'appointments']].filter(([, ,id])=>canOpen(id));
 return <><div className="admin-header"><div><p className="admin-tagline">YOUR CONTENT, YOUR CONTROL</p><h1>Good day, {me.username}.</h1><p className="admin-subtitle">Manage the complete SHANERYN website without touching code.</p><p className="admin-access-label">Signed in as {ROLE_NAMES[me.role]||me.role}</p></div>{me.role==='super_admin'&&<Btn onClick={seed} disabled={seeding}>{seeding?'Importing…':'Import V6.9 Baseline'}</Btn>}</div>{issue&&<p className="admin-status">{issue}</p>}<div className="admin-metrics">{metrics.map(([name,count,id])=><div className="admin-card" key={name} onClick={()=>onNavigate(id)} style={{cursor:'pointer'}}><p className="admin-metric-label">{name}</p><p className="admin-metric-value">{count}</p></div>)}</div><div className="admin-grid-2"><div className="admin-card"><h2>Quick Actions</h2>{[['Edit Homepage','pages'],['Manage Products','products'],['Review Enquiries','enquiries'],['Manage Booking Requests','appointments'],['Change Social Links','settings'],['Manage Admin Users','users']].filter(([,to])=>canOpen(to)).map(([n,to])=><div className="admin-row" key={n} style={{padding:'12px 0',borderBottom:'1px solid #eee'}}><span>{n}</span><Btn variant="secondary sm" onClick={()=>onNavigate(to)}>Open ↗</Btn></div>)}</div><div className="admin-card"><h2>How publishing works</h2><p>Edit any page, product or setting, then select <strong>Save & Publish</strong>. No approvals or queues. Sections and individual content elements may be hidden without deleting their saved data.</p><div className="admin-divider"/><p className="admin-note">Server-managed login and Firestore rules protect the CMS. Staff passwords are hashed in cms_users; only server APIs can edit protected data. Page edits retain revision history.</p></div></div></>
}

function PageManager({api,pick}){
 const [pages,setPages]=useState([]),[selected,setSelected]=useState(''),[page,setPage]=useState(null),[activeSection,setActiveSection]=useState('s-000'),[query,setQuery]=useState(''),[status,setStatus]=useState(''),[saving,setSaving]=useState(false),[view,setView]=useState('content'),[simple,setSimple]=useState(true);
 const frame=useRef(null);
 useEffect(()=>{api('pages').then(x=>{setPages(x);setSelected(x.some(p=>p.slug==='index')?'index':x[0]?.slug||'')}).catch(e=>setStatus(e.message))},[api]);
 useEffect(()=>{if(!selected)return;setPage(null);api('pages/'+selected).then(p=>{setPage(p);setActiveSection(p.sections?.[0]?.id||'header');setQuery('')}).catch(e=>setStatus(e.message))},[selected,api]);
 const update=(prop,value)=>setPage(old=>({...old,[prop]:value}));
 function updatePatch(id,change){setPage(old=>({...old,patches:{...(old.patches||{}),[id]:{value:old.patches?.[id]?.value??old.fields.find(f=>f.id===id)?.value,visible:old.patches?.[id]?.visible!==false,...change}}}))}
 function changeSection(id,change){setPage(old=>({...old,sectionSettings:{...(old.sectionSettings||{}),[id]:{visible:old.sectionSettings?.[id]?.visible!==false,order:old.sectionSettings?.[id]?.order??old.sections.find(s=>s.id===id)?.order,...change}}}))}
 const sections=page? [...page.sections.filter(s=>!s.parent),...page.sections.filter(s=>s.parent)]:[];
 const bestSellerSection=selected==='index'?page?.sections?.find(s=>s.originalId==='best-seller'):null;
 const bestSellerPhoto=bestSellerSection? page?.fields?.find(f=>f.section===bestSellerSection.id&&f.kind==='src'):null;
 const bestSellerAlt=bestSellerSection? page?.fields?.find(f=>f.section===bestSellerSection.id&&f.kind==='alt'):null;
 const filtered=(page?.fields||[]).filter(f=>!(selected==='bespoke'&&['f00310','f00311'].includes(f.id))&&f.section===activeSection&&(!simple||query||['text','src','background','href'].includes(f.kind))&&(f.label.toLowerCase().includes(query.toLowerCase())||f.kind.includes(query.toLowerCase())));
 async function save(){if(!page)return;setSaving(true);setStatus('');try{await api('pages/'+selected,{method:'PUT',body:page});setStatus('Published. The website will use the updated content on the next request.')}catch(e){setStatus('Save failed: '+e.message)}finally{setSaving(false)}}
 function reorder(id,delta){const items=sections.filter(s=>!s.parent).sort((a,b)=>(page.sectionSettings?.[a.id]?.order??a.order)-(page.sectionSettings?.[b.id]?.order??b.order));const pos=items.findIndex(s=>s.id===id),to=pos+delta;if(pos<0||to<0||to>=items.length)return;const one=items[pos],two=items[to];setPage(old=>({...old,sectionSettings:{...(old.sectionSettings||{}),[one.id]:{...old.sectionSettings?.[one.id],visible:old.sectionSettings?.[one.id]?.visible!==false,order:old.sectionSettings?.[two.id]?.order??two.order},[two.id]:{...old.sectionSettings?.[two.id],visible:old.sectionSettings?.[two.id]?.visible!==false,order:old.sectionSettings?.[one.id]?.order??one.order}}}))}
 function addSection(){const type=prompt('Section style: text, split, cards, gallery, faq','split');if(!['text','split','cards','gallery','faq'].includes(type))return;const heading=prompt('Section heading','New section');if(!heading)return;setPage(old=>({...old,extraSections:[...(old.extraSections||[]),{id:'custom-'+Date.now(),type,heading,body:'',visible:true,cards:[],images:[],buttonText:'EXPLORE',href:'contact.html'}]}));setView('extra')}
 function addPastWorkPhoto(){setPage(old=>({...old,pastWorkExtras:[...(old.pastWorkExtras||[]),{id:'past-'+crypto.randomUUID(),src:'',alt:'',visible:true}]}))}
 function updatePastWorkPhoto(index,patch){setPage(old=>({...old,pastWorkExtras:(old.pastWorkExtras||[]).map((photo,i)=>i===index?{...photo,...patch}:photo)}))}
 function movePastWorkPhoto(index,delta){setPage(old=>{const photos=[...(old.pastWorkExtras||[])],other=index+delta;if(other<0||other>=photos.length)return old;[photos[index],photos[other]]=[photos[other],photos[index]];return {...old,pastWorkExtras:photos}})}
 async function newPage(){const name=prompt('New page title','New Editorial Page');if(!name)return;const slug=prompt('Page URL slug, e.g. editorial-journal','editorial-journal');if(!slug)return;try{await api('pages',{method:'POST',body:{name,slug}});const list=await api('pages');setPages(list);setSelected(slug);setStatus('Page created as hidden. Add sections, then publish when ready.')}catch(e){setStatus(e.message)}}
 useEffect(()=>{if(!page||!frame.current?.contentWindow)return;frame.current.contentWindow.postMessage({type:'shaneryn-cms-preview',patches:page.patches||{},sectionSettings:page.sectionSettings||{},heroImages:page.heroImages||{}},location.origin)},[page]);
 useEffect(()=>{const onMessage=e=>{if(e.origin!==location.origin||e.data?.type!=='shaneryn-cms-select')return;const fld=page?.fields.find(f=>f.id===e.data.id);if(fld){if(selected==='collections'&&['f00242','f00243','f00244','f00245'].includes(fld.id)){const input=document.getElementById('cms-curated-'+fld.id);input?.scrollIntoView({behavior:'smooth',block:'center'});input?.focus();return}setActiveSection(fld.section);setQuery(fld.label.slice(0,24))}};window.addEventListener('message',onMessage);return()=>window.removeEventListener('message',onMessage)},[page,selected]);
 return <><div className="admin-header"><div><p className="admin-tagline">LIVE VISUAL CONTENT STUDIO</p><h1>Page Manager</h1><p className="admin-subtitle">Every section and individual text, image, link and label can be edited or hidden.</p></div><div className="admin-flex"><Btn variant="secondary" onClick={newPage}>+ New Page</Btn><Btn variant="secondary" onClick={addSection} disabled={!page}>+ Add Section</Btn><Btn onClick={save} disabled={!page||saving}>{saving?'Publishing…':'Save & Publish ↗'}</Btn></div></div>
 {status&&<p className="admin-status">{status}</p>}
 <div className="admin-flex" style={{marginBottom:18}}><div style={{minWidth:250}}><Select value={selected} onChange={setSelected} options={pages.map(p=>({value:p.slug,label:p.name||p.slug}))}/></div>{page&&<><Check label="Page visible" checked={page.visible!==false} onChange={v=>update('visible',v)}/><a href={selected==='index'?'/':'/'+selected} target="_blank" rel="noreferrer" style={{color:'#983f73'}}>View current live page ↗</a></>}</div>
 {page?<><div className="admin-card" style={{marginBottom:18}}><div className="admin-form-row"><Field label="Browser title"><Input value={page.title} onChange={v=>update('title',v)}/></Field><Field label="Page name"><Input value={page.name} onChange={v=>update('name',v)}/></Field></div><Field label="SEO meta description"><TextArea rows={2} value={page.description} onChange={v=>update('description',v)}/></Field><Field label="Social preview image (Open Graph)"><MediaField spec="social" value={page.socialImage||''} onChange={v=>update('socialImage',v)} pick={pick}/></Field></div>
 {selected==='index'&&<div className="admin-card cms-simple-panel" style={{marginBottom:18}}>
   <div className="admin-row"><div><h2>Homepage Hero Banner</h2><p className="admin-note">Separate desktop and mobile images. The website automatically shows the right image for each screen.</p></div><span className="admin-pill active">2 image sizes</span></div>
   <div className="admin-grid-2">
    <Field label="Desktop Banner (wide)"><MediaField spec="desktop" value={page.heroImages?.desktop||page.patches?.[page.fields.find(f=>f.kind==='background'&&f.section==='s-000')?.id]?.value||'assets/hero-client-shaneryn7231.jpg'} onChange={v=>update('heroImages',{...page.heroImages,desktop:v})} pick={pick}/><small className="admin-note">Recommended: 1920 × 1080 px · 16:9</small></Field>
    <Field label="Mobile Banner (portrait)"><MediaField spec="mobile" value={page.heroImages?.mobile||page.heroImages?.desktop||'assets/hero-client-shaneryn7231.jpg'} onChange={v=>update('heroImages',{...page.heroImages,mobile:v})} pick={pick}/><small className="admin-note">Recommended: 1080 × 1920 px · 9:16</small></Field>
   </div>
   <Field label="Banner image description (accessibility)"><Input value={page.heroImages?.alt||'SHANERYN fashion campaign'} onChange={v=>update('heroImages',{...page.heroImages,alt:v})}/></Field>
   <p className="admin-note">Save & Publish to apply the images. Homepage typography, animation and layout remain unchanged.</p>
  </div>}
 {selected==='index'&&bestSellerPhoto&&<div className="admin-card cms-simple-panel" style={{marginBottom:18}}>
   <div className="admin-row"><div><h2>Homepage Best Seller</h2><p className="admin-note">Your uploaded photograph is displayed here, regardless of which product you link to.</p></div><span className="admin-pill active">Independent image</span></div>
   <Field label="Best Seller Section Photograph"><MediaField spec="bestseller" value={page.patches?.[bestSellerPhoto.id]?.value??bestSellerPhoto.value} onChange={value=>updatePatch(bestSellerPhoto.id,{value})} pick={pick}/></Field>
   {bestSellerAlt&&<Field label="Image Description (accessibility)"><Input value={page.patches?.[bestSellerAlt.id]?.value??bestSellerAlt.value} onChange={value=>updatePatch(bestSellerAlt.id,{value})}/></Field>}
   <Check label="Show Best Seller Section" checked={page.sectionSettings?.[bestSellerSection.id]?.visible!==false} onChange={visible=>changeSection(bestSellerSection.id,{visible})}/>
   <p className="admin-note">To choose which product opens when visitors click this section, go to Global Settings → Homepage Highlights → Best Seller. Selecting a product never replaces this photograph.</p>
  </div>}
  {selected==='collections'&&<div className="admin-card cms-simple-panel" style={{marginBottom:18}}>
    <div className="admin-row"><div><h2>Our Collections - Website Showcase</h2><p className="admin-note">Edit the heading and description you see in the "Our Collections" area of the live preview. The existing design stays the same.</p></div><span className="admin-pill active">Editable text</span></div>
    <div className="admin-grid-2">
     <Field label="Small heading (pink)"><Input id="cms-curated-f00242" value={page.patches?.f00242?.value??page.fields.find(f=>f.id==='f00242')?.value??'CURATED BY SHANERYN'} onChange={value=>updatePatch('f00242',{value})}/></Field>
     <Field label="Main heading"><Input id="cms-curated-f00243" value={page.patches?.f00243?.value??page.fields.find(f=>f.id==='f00243')?.value??'Our Collections.'} onChange={value=>updatePatch('f00243',{value})}/></Field>
    </div>
    <Field label="Supporting description"><TextArea id="cms-curated-f00244" rows={2} value={page.patches?.f00244?.value??page.fields.find(f=>f.id==='f00244')?.value??'Explore considered edits for every occasion.'} onChange={value=>updatePatch('f00244',{value})}/></Field>
    <Field label="Collection card link caption"><Input id="cms-curated-f00245" value={page.patches?.f00245?.value??page.fields.find(f=>f.id==='f00245')?.value??'Explore edit ↗'} onChange={value=>updatePatch('f00245',{value})}/></Field>
    <p className="admin-note"><strong>To edit THE CURVE EDIT card:</strong> open <strong>Collections</strong> from the left menu. There you can change each collection's name, description, photograph and linked looks. These cards update automatically.</p>
    <p className="admin-note" style={{marginTop:8}}>Your edits appear in the preview below. Select <strong>Save &amp; Publish</strong> to update the public page.</p>
   </div>}
  {selected==='bespoke'&&<div className="admin-card cms-simple-panel" style={{marginBottom:18}}>
   <div className="admin-row"><div><h2>Past Work Gallery</h2><p className="admin-note">Add more photographs to Bespoke → Past Work. The original 17 photographs stay in place. New photographs appear below them in the same gallery and full-screen viewer.</p></div><Btn variant="secondary sm" disabled={(page.pastWorkExtras||[]).length>=100} onClick={addPastWorkPhoto}>+ Add Photograph</Btn></div>
   {(page.pastWorkExtras||[]).map((photo,i)=><div className="admin-editor-field" key={photo.id||i} style={{marginTop:14}}>
     <div className="admin-row"><strong>Additional photograph {i+1}</strong><div className="admin-flex"><Btn variant="neutral sm" disabled={i===0} onClick={()=>movePastWorkPhoto(i,-1)}>Up</Btn><Btn variant="neutral sm" disabled={i===(page.pastWorkExtras||[]).length-1} onClick={()=>movePastWorkPhoto(i,1)}>Down</Btn><Btn variant="danger sm" onClick={()=>{if(confirm('Remove this additional Past Work photo?'))update('pastWorkExtras',(page.pastWorkExtras||[]).filter((_,j)=>j!==i))}}>Remove</Btn></div></div>
     <Field label="Photograph"><MediaField spec="editorial" value={photo.src||''} onChange={src=>updatePastWorkPhoto(i,{src})} pick={pick}/></Field>
     <Field label="Photo description (for accessibility)"><Input value={photo.alt||''} placeholder="e.g. Editorial couture look at a fashion event" onChange={alt=>updatePastWorkPhoto(i,{alt})}/></Field>
     <Check label="Show photograph on website" checked={photo.visible!==false} onChange={visible=>updatePastWorkPhoto(i,{visible})}/>
     {!photo.src&&<p className="admin-note">Choose a photograph before publishing. Empty photo slots remain hidden on the website.</p>}
   </div>)}
   {!(page.pastWorkExtras||[]).length&&<p className="admin-note" style={{marginTop:12}}>No additional Past Work photographs yet. Select Add Photograph to upload the next one.</p>}
   <p className="admin-note" style={{marginTop:12}}>Click <strong>Save &amp; Publish</strong> above to make new photographs live. <a href="/bespoke#past-work" target="_blank" rel="noreferrer">View Past Work ↗</a></p>
  </div>}
  {selected==='film'&&<div className="admin-card cms-simple-panel" style={{marginBottom:18}}>
   <h2>Fashion Film</h2><p className="admin-note" style={{marginBottom:12}}>Choose one video source. Paste YouTube, or upload an MP4/WebM. It will appear in the dedicated Fashion Film page.</p>
   <VideoField value={page.filmMedia?.url||''} onChange={url=>update('filmMedia',{url})} pick={pick}/>
  </div>}
  <div className="admin-3col"><div className="admin-card admin-sidebar-list"><div className="admin-row"><h2>Sections</h2><span className="admin-pill">{page.sections.length} sections</span></div>{[...sections.map(s=>({id:s.id,title:s.title,order:s.order})),...['header','navigation','footer','dialogs','other'].map(id=>({id,title:id.charAt(0).toUpperCase()+id.slice(1),order:500}))].map(s=>{const count=page.fields.filter(f=>f.section===s.id).length;return <div key={s.id}><button className={'admin-section-btn '+(activeSection===s.id?'selected':'')} onClick={()=>{setActiveSection(s.id);setQuery('');setView('content')}}><span className="admin-section-title">{s.title}</span><span className="admin-section-counter">{count} editable items</span></button>{s.id.startsWith('s-')&&<div className="admin-flex" style={{padding:'0 10px 9px'}}><Check label="Show" checked={page.sectionSettings?.[s.id]?.visible!==false} onChange={v=>changeSection(s.id,{visible:v})}/><button title="Move up" onClick={()=>reorder(s.id,-1)}>↑</button><button title="Move down" onClick={()=>reorder(s.id,1)}>↓</button></div>}</div>})}<div className="admin-divider"/><button className={'admin-section-btn '+(view==='extra'?'selected':'')} onClick={()=>setView('extra')}>+ Additional sections ({page.extraSections?.length||0})</button></div>
 <div className="admin-card"><div className="admin-row"><h2>{view==='extra'?'Custom Sections':'Edit Content'}</h2><span className="admin-pill">{view==='extra'?page.extraSections?.length||0:filtered.length} fields</span></div>{view==='extra'?<div className="admin-editor-fields">{(page.extraSections||[]).map((item,i)=><div className="admin-editor-field" key={item.id}><p style={{fontWeight:700,marginBottom:8}}>{i+1}. {item.type} section</p><Check label="Show this section" checked={item.visible} onChange={v=>update('extraSections',page.extraSections.map((x,j)=>j===i?{...x,visible:v}:x))}/>{[['heading','Heading'],['body','Description'],['image','Image URL'],['href','Button URL'],['buttonText','Button label']].map(([k,label])=><Field key={k} label={label}>{k==='image'?<MediaField value={item[k]} onChange={v=>update('extraSections',page.extraSections.map((x,j)=>j===i?{...x,[k]:v}:x))} pick={pick}/>:k==='href'?<LinkPicker value={item[k]} onChange={v=>update('extraSections',page.extraSections.map((x,j)=>j===i?{...x,[k]:v}:x))}/>:k==='body'?<TextArea value={item[k]} onChange={v=>update('extraSections',page.extraSections.map((x,j)=>j===i?{...x,[k]:v}:x))}/>:<Input value={item[k]} onChange={v=>update('extraSections',page.extraSections.map((x,j)=>j===i?{...x,[k]:v}:x))}/>}</Field>)}{['gallery','cards','faq'].includes(item.type)&&<Field label={item.type==='gallery'?'Gallery images (one URL per line)':'Cards / FAQs (one Title | Text per line)'}><TextArea rows={5} value={item.type==='gallery'?(item.images||[]).join('\n'):(item.cards||[]).map(x=>x.title+' | '+x.text).join('\n')} onChange={v=>update('extraSections',page.extraSections.map((x,j)=>j===i?{...x,[item.type==='gallery'?'images':'cards']:item.type==='gallery'?v.split('\n').filter(Boolean):v.split('\n').filter(Boolean).map(line=>({title:line.split('|')[0]?.trim(),text:line.split('|').slice(1).join('|').trim()}))}:x))}/></Field>}<Btn variant="danger sm" onClick={()=>update('extraSections',page.extraSections.filter((_,j)=>j!==i))}>Remove section</Btn></div>)}{!page.extraSections?.length&&<p className="admin-empty">No custom sections. Select Add Section above.</p>}</div>:<><div className="admin-flex" style={{marginBottom:12}}><Btn variant={simple?"":"secondary sm"} onClick={()=>setSimple(true)}>Simple</Btn><Btn variant={!simple?"":"secondary sm"} onClick={()=>setSimple(false)}>All Fields</Btn></div><div style={{marginBottom:12}}><Input placeholder="Find heading, image, button, link…" value={query} onChange={setQuery}/></div><div className="admin-editor-fields">{filtered.map(f=>{const p=page.patches?.[f.id],value=p?.value??f.value,visible=p?.visible!==false;return <div className="admin-editor-field" key={f.id}><div className="admin-row" style={{marginBottom:8}}><label>{readableFieldLabel(f)}</label>{!simple&&<span className="meta">{f.kind}</span>}</div>{f.kind==='visibility'?<Check label="Show element" checked={p?.value!==false&&visible} onChange={v=>updatePatch(f.id,{value:v,visible:v})}/>:<>{['src','background'].includes(f.kind)?<MediaField value={value} onChange={v=>updatePatch(f.id,{value:v})} pick={pick}/>:f.kind==='href'?<LinkPicker value={value} onChange={v=>updatePatch(f.id,{value:v})}/>:f.kind==='text'&&String(value).length>85?<TextArea rows={3} value={value} onChange={v=>updatePatch(f.id,{value:v})}/>:<Input value={value} onChange={v=>updatePatch(f.id,{value:v})}/>}<div className="admin-flex" style={{marginTop:8}}><Check label="Visible" checked={visible} onChange={v=>updatePatch(f.id,{visible:v})}/>{f.kind==='text'&&<><label className="admin-note">Font px <input style={{width:60,padding:5,border:'1px solid #ddd',borderRadius:4}} type="number" min="0" max="96" placeholder="Auto" value={p?.fontSize||''} onChange={e=>updatePatch(f.id,{fontSize:Number(e.target.value)||0})}/></label><select aria-label="Text alignment" className="admin-select" style={{width:105,padding:5}} value={p?.textAlign||''} onChange={e=>updatePatch(f.id,{textAlign:e.target.value})}><option value="">Alignment</option><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></>}</div></>}</div>})}{!filtered.length&&<p className="admin-empty">No matching fields in this section.</p>}</div></>}</div>
 <div className="admin-card admin-preview-wrap"><div className="admin-row"><h2>Live Page Preview</h2><span className="admin-pill">Click any text or image</span></div><p className="admin-note" style={{marginBottom:12}}>Your unsaved text and visibility edits preview here. New sections appear after publishing.</p><iframe ref={frame} className="admin-preview" title="SHANERYN page preview" src={(selected==='index'?'/':'/'+selected)+'?cmsPreview=1'} onLoad={()=>frame.current?.contentWindow?.postMessage({type:'shaneryn-cms-preview',patches:page.patches||{},sectionSettings:page.sectionSettings||{},heroImages:page.heroImages||{}},location.origin)}/></div>
 </div></>:<p className="admin-empty">Loading page editor…</p>}</>
}

function ProductDetailRows({title,entries,onChange,description}){
 const rows=Array.isArray(entries)?entries:[];
 const updateRow=(i,key,value)=>onChange(rows.map((row,j)=>j===i?{...row,[key]:value}:row));
 return <section className="cms-product-detail-group"><div className="admin-row"><div><h3>{title}</h3><p className="admin-note">{description}</p></div><Btn variant="secondary sm" disabled={rows.length>=12} onClick={()=>onChange([...rows,{garment:'',description:''}])}>+ Add garment</Btn></div>
 {rows.map((row,i)=><div className="cms-product-detail-row" key={i}><div className="admin-row"><strong>Garment {i+1}</strong><Btn variant="danger sm" onClick={()=>onChange(rows.filter((_,j)=>i!==j))}>Remove</Btn></div><Field label="Garment name (optional)"><Input value={row.garment} onChange={v=>updateRow(i,'garment',v)} placeholder="e.g. Black Palazzo Pant"/></Field><Field label="Description"><TextArea rows={3} value={row.description} onChange={v=>updateRow(i,'description',v)} placeholder="Enter fabric or design details for this garment"/></Field></div>)}
 {!rows.length&&<p className="admin-note cms-description-empty">Nothing added yet. This section will stay hidden on the website.</p>}</section>;
}
function ProductOccasionEntries({occasions,onChange}){
 const rows=Array.isArray(occasions)?occasions:[];
 return <section className="cms-product-detail-group"><div className="admin-row"><div><h3>Occasion description</h3><p className="admin-note">Optional display text, separate from the catalogue filter.</p></div><Btn variant="secondary sm" disabled={rows.length>=20} onClick={()=>onChange([...rows,''])}>+ Add occasion</Btn></div>
 {rows.map((text,i)=><div key={i} className="cms-product-occasion-row"><Input value={text} onChange={v=>onChange(rows.map((x,j)=>j===i?v:x))} placeholder="e.g. Cocktail Parties" aria-label={'Occasion '+(i+1)}/><Btn variant="danger sm" onClick={()=>onChange(rows.filter((_,j)=>j!==i))}>Remove</Btn></div>)}
 {!rows.length&&<p className="admin-note cms-description-empty">No occasion description. This section will stay hidden on the website.</p>}</section>;
}

const blankProduct={id:'',title:'',slug:'',cat:'Dresses',categoryId:'dresses',collectionIds:[],occasion:'evening',tagline:'',description:'',price:'',productDetails:{fabric:[],design:[],embroidery:'',occasions:[]},tone:'',pieces:[],measurementGroups:{},img:'',catalogueImg:'',bestSellerImage:'',gallery:[],video:'',visible:true,featured:false,bestSeller:false,sortOrder:100,seoTitle:'',seoDescription:''};
function ProductManager({api,pick}){
 const [items,setItems]=useState([]),[categories,setCategories]=useState([]),[collections,setCollections]=useState([]),[selected,setSelected]=useState(''),[item,setItem]=useState(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[filter,setFilter]=useState(''),[tab,setTab]=useState('basic');
 async function refresh(){const [products,cats,edits]=await Promise.all([api('products'),api('categories'),api('collections')]);setItems(products);setCategories(cats);setCollections(edits);return products}
 useEffect(()=>{refresh().then(x=>{if(x[0])setSelected(x[0].id)}).catch(e=>setStatus(e.message))},[api]);
 useEffect(()=>{if(selected){setItem(stable(items.find(x=>x.id===selected)||blankProduct));setTab('basic')}},[selected,items]);
 const update=(k,v)=>setItem(old=>({...old,[k]:v}));
 const updateProductDetails=(k,v)=>setItem(old=>({...old,productDetails:{...(old.productDetails||{}),[k]:v}}));
 function create(){setSelected('');setItem({...blankProduct,id:'SH-'+Date.now().toString(36).toUpperCase(),categoryId:categories[0]?.id||'dresses',cat:categories[0]?.name||'Dresses'});setTab('basic');setStatus('New look. Enter a name, select a category and add photographs.');}
 function duplicate(){if(!item)return;setSelected('');setItem({...item,id:'SH-'+Date.now().toString(36).toUpperCase(),title:item.title+' Copy',slug:slugify(item.title+' Copy'),featured:false,bestSeller:false});setTab('basic')}
 async function save(){if(!item)return;setBusy(true);setStatus('');try{
  const matched=categories.find(c=>c.id===item.categoryId||c.name===item.cat);
  const product={...item,slug:item.slug||slugify(item.title),cat:matched?.name||item.cat,categoryId:matched?.id||'',collectionIds:item.collectionIds||[]};
  const exists=items.some(x=>x.id===product.id);
  if(!product.title?.trim())throw Error('Enter the product name.');
  if(!matched)throw Error('Choose a garment category.');
  if(!product.catalogueImg&&!product.img)throw Error('Choose at least one photograph.');
  if(items.some(p=>p.id!==product.id&&productSlug(p)===productSlug(product)))throw Error('This public URL already exists. Change the name or URL under Advanced.');
  if(product.video&&!getYoutubeVideoId(product.video)&&!isVideoFile(product.video))throw Error('Choose an MP4/WebM file or valid YouTube link.');
  await api('products'+(exists?'/'+product.id:''),{method:exists?'PUT':'POST',body:product});const all=await api('products');setItems(all);setSelected(product.id);setItem(product);setStatus('Product saved and published.');
 }catch(e){setStatus('Save error: '+e.message)}finally{setBusy(false)}}
 const shown=items.filter(x=>(x.title+' '+x.id+' '+x.cat).toLowerCase().includes(filter.toLowerCase()));
 return <><div className="admin-header"><div><p className="admin-tagline">FASHION CATALOGUE</p><h1>Products & Looks</h1><p className="admin-subtitle">Easy product editing. Categories describe garment types; Collections group selected looks.</p></div><div className="admin-flex"><Btn variant="secondary" onClick={create}>+ Add Product</Btn><Btn onClick={save} disabled={busy||!item}>{busy?'Publishing...':'Save & Publish'}</Btn></div></div>
 {status&&<p className="admin-status" role="status">{status}</p>}
 <div className="admin-split"><div className="admin-card"><h2>Products ({items.length})</h2><Input value={filter} onChange={setFilter} placeholder="Search by name or garment type"/>{shown.map(p=><button type="button" className={'admin-item-card cms-product-list-item '+(selected===p.id?'selected':'')} key={p.id} onClick={()=>setSelected(p.id)}><img src={mediaSrc(p.catalogueImg||p.img)} alt=""/><div><strong>{p.title}</strong><p className="admin-note">{p.cat}</p><span className={'admin-pill '+(p.visible?'active':'')}>{p.visible?'Published':'Hidden'}</span></div></button>)}</div>
 <div className="admin-card">{item?<><div className="admin-row"><h2>{item.title||'New Product'}</h2><div className="admin-flex"><Btn variant="neutral sm" onClick={duplicate}>Duplicate</Btn><Check label="Visible" checked={item.visible!==false} onChange={v=>update('visible',v)}/></div></div>
 <div className="cms-editor-tabs" role="tablist" aria-label="Product editor">{[['basic','Details'],['description','Descriptions'],['photos','Gallery & Video'],['advanced','More Options']].map(([id,label])=><button key={id} type="button" role="tab" aria-selected={tab===id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div>
 {tab==='basic'&&<div>
  <Field label="Product Name"><Input value={item.title} onChange={v=>update('title',v)} placeholder="e.g. Sunshine"/></Field>
  <div className="admin-form-row"><Field label="Garment Category"><Select value={item.categoryId||categories.find(c=>c.name===item.cat)?.id||''} options={[{value:'',label:'Choose a category'},...categories.filter(c=>c.visible!==false||c.name===item.cat).map(c=>({value:c.id,label:c.name}))]} onChange={v=>{const c=categories.find(x=>x.id===v);setItem(old=>({...old,cat:c?.name||'',categoryId:v}))}}/></Field><Field label="Colour / Tone"><Input value={item.tone} onChange={v=>update('tone',v)} placeholder="e.g. Sunshine Yellow"/></Field></div>
  <Field label="Garment pieces included"><ChipEditor value={item.pieces} onChange={v=>update('pieces',v)} suggestions={['Top','Pant','Skirt','Blouse','Jacket','Gown','Tunic','Dupatta']}/></Field>
  <div className="admin-divider"/><h2>Assign to Collections (optional)</h2><p className="admin-note" style={{marginBottom:12}}>A product has one garment category and may appear in several curated collections.</p>
  {collections.length?<div className="cms-collection-checks">{collections.map(c=><Check key={c.id} label={c.name} checked={(item.collectionIds||[]).includes(c.id)} onChange={v=>update('collectionIds',v?[...(item.collectionIds||[]),c.id]:(item.collectionIds||[]).filter(x=>x!==c.id))}/>)}</div>:<p className="admin-note">No curated collections yet. Create your first one in the Collections menu.</p>}
  <div className="admin-divider"/><h2>Main Photographs</h2><p className="admin-note" style={{marginBottom:12}}>To replace a dress picture in the four-look homepage grid or the Collections listing, change the <strong>studio photograph</strong> below. To change the first photograph inside a Look Detail gallery, also update Photo 1 under Gallery &amp; Video. Click Save &amp; Publish after choosing your image.</p><div className="admin-form-row"><Field label="Homepage four-look grid / collection card (studio photograph)"><MediaField spec="catalogue" value={item.catalogueImg} onChange={v=>update('catalogueImg',v)} pick={pick}/></Field><Field label="Look detail (editorial photograph)"><MediaField spec="editorial" value={item.img} onChange={v=>update('img',v)} pick={pick}/></Field></div>
  <div className="admin-divider"/><h2>Visibility & Highlights</h2><div className="cms-checkbox-stack"><Check label="Show on website" checked={item.visible!==false} onChange={v=>update('visible',v)}/><Check label="Featured product" checked={item.featured} onChange={v=>update('featured',v)}/><Check label="Best Seller" checked={item.bestSeller} onChange={v=>update('bestSeller',v)}/></div>
 </div>}
 {tab==='description'&&<div className="cms-product-description-editor">
  <h2>Product Description</h2><p className="admin-note" style={{marginBottom:16}}>Fill in only what applies to this outfit. Empty sections are automatically hidden on the website. No separate Show/Hide switches.</p>
  <Field label="Short Tagline (optional)"><Input value={item.tagline} onChange={v=>update('tagline',v)} placeholder="e.g. Let the Tide Set the Vibe"/></Field>
  <Field label="Short Description (optional)"><TextArea value={item.description} rows={3} onChange={v=>update('description',v)} placeholder="A short introduction to the outfit"/></Field>
  <Field label="Price (optional)"><Input value={item.price} onChange={v=>update('price',v)} placeholder="e.g. ₹ 18,500"/></Field>
  <p className="admin-note" style={{marginTop:-7,marginBottom:16}}>Leave the price blank if you do not want to display it. This is information only; there is no online checkout.</p>
  <ProductDetailRows title="Fabric" entries={item.productDetails?.fabric} onChange={v=>updateProductDetails('fabric',v)} description="Add the garment and its fabric. For two-piece outfits, add a separate row for each piece."/>
  <ProductDetailRows title="Design Description" entries={item.productDetails?.design} onChange={v=>updateProductDetails('design',v)} description="Explain the cut, silhouette and construction of each garment."/>
  <div className="cms-product-detail-group"><h3>Embroidery &amp; Detailing</h3><p className="admin-note" style={{marginBottom:10}}>Optional. You can enter several lines of text.</p><TextArea rows={4} value={item.productDetails?.embroidery} onChange={v=>updateProductDetails('embroidery',v)} placeholder="Describe embroidery, accents or finishing details"/></div>
  <ProductOccasionEntries occasions={item.productDetails?.occasions} onChange={v=>updateProductDetails('occasions',v)}/>
 </div>}
 {tab==='photos'&&<div><h2>Product Gallery</h2><p className="admin-note" style={{marginBottom:14}}>Add photographs in the order customers should see them.</p>
  <div className="admin-form-row"><Field label="Studio image"><MediaField spec="catalogue" value={item.catalogueImg} onChange={v=>update('catalogueImg',v)} pick={pick}/></Field><Field label="Editorial image"><MediaField spec="editorial" value={item.img} onChange={v=>update('img',v)} pick={pick}/></Field></div>
  <p className="admin-note" style={{marginBottom:16}}>The Homepage Best Seller photograph is managed under Page Manager → Homepage → Best Seller, not here. Product photographs can be changed without altering that section image.</p>
  <div className="admin-row"><h2>Gallery ({item.gallery?.length||0})</h2><Btn variant="secondary sm" onClick={()=>update('gallery',[...(item.gallery||[]),{src:'',alt:'Product photograph'}])}>+ Add Photo</Btn></div>
  {(item.gallery||[]).map((g,i)=><div className="admin-editor-field" key={i}><div className="admin-row"><strong>Photo {i+1}</strong><div className="admin-flex"><Btn variant="neutral sm" disabled={i===0} onClick={()=>{const a=[...item.gallery];[a[i-1],a[i]]=[a[i],a[i-1]];update('gallery',a)}}>Up</Btn><Btn variant="neutral sm" disabled={i===item.gallery.length-1} onClick={()=>{const a=[...item.gallery];[a[i+1],a[i]]=[a[i],a[i+1]];update('gallery',a)}}>Down</Btn><Btn variant="danger sm" onClick={()=>update('gallery',item.gallery.filter((_,j)=>j!==i))}>Remove</Btn></div></div><MediaField spec="editorial" value={g.src} onChange={v=>update('gallery',item.gallery.map((x,j)=>j===i?{...x,src:v}:x))} pick={pick}/><Input value={g.alt} placeholder="Describe photo" onChange={v=>update('gallery',item.gallery.map((x,j)=>j===i?{...x,alt:v}:x))}/></div>)}
  <div className="admin-divider"/><h2>Optional Video</h2><VideoField value={item.video} onChange={v=>update('video',v)} pick={pick}/>
 </div>}
 {tab==='advanced'&&<div><p className="admin-note" style={{marginBottom:12}}>Optional product settings. Normally you can leave these unchanged.</p>
  <Field label="Internal Reference (auto-generated)"><Input value={item.id} disabled/></Field><Field label="Public Product URL"><Input value={productSlug(item)} onChange={v=>update('slug',slugify(v))}/><small className="admin-note">Website link: {productPath(item)}</small></Field>
  <Field label="Catalogue Occasion Filter"><Select value={item.occasion} options={['evening','festive','destination','everyday','bridal','corporate']} onChange={v=>update('occasion',v)}/></Field><p className="admin-note" style={{marginTop:-4,marginBottom:12}}>This dropdown controls Collections filtering. To show an occasion description on the Look Details page, add it under Descriptions.</p>
  <Field label="Display Order"><Input type="number" value={item.sortOrder} onChange={v=>update('sortOrder',Number(v))}/></Field>
  <div className="admin-divider"/><h2>Measurement Questions</h2><p className="admin-note" style={{marginBottom:12}}>Add measurement groups and questions individually. No JSON or comma-separated input required.</p>
  <MeasurementGroupEditor value={item.measurementGroups} onChange={v=>update('measurementGroups',v)}/>
  <div className="admin-divider"/><h2>Search Engine Details</h2><Field label="SEO Page Title"><Input value={item.seoTitle} onChange={v=>update('seoTitle',v)}/></Field><Field label="SEO Description"><TextArea value={item.seoDescription} onChange={v=>update('seoDescription',v)}/></Field>
 </div>}
 <div className="admin-divider"/><div className="admin-flex"><Btn onClick={save} disabled={busy}>{busy?'Publishing...':'Save & Publish'}</Btn><a href={productPath(item)} target="_blank" rel="noreferrer" className="cms-public-link">Preview Product</a></div>
 </>:<p className="admin-empty">Select a product or add a new one.</p>}</div></div></>;
}
function CategoryManager({api,pick}){
 const [items,setItems]=useState([]),[products,setProducts]=useState([]),[selected,setSelected]=useState(''),[item,setItem]=useState(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 async function refresh(){const [cats,looks]=await Promise.all([api('categories'),api('products')]);setItems(cats);setProducts(looks);return cats}
 useEffect(()=>{refresh().then(x=>setSelected(x[0]?.id||'')).catch(e=>setStatus(e.message))},[api]);
 useEffect(()=>{if(selected)setItem(stable(items.find(x=>x.id===selected)||null))},[selected,items]);
 const update=(k,v)=>setItem(x=>({...x,[k]:v}));
 function create(){setSelected('');setItem({id:'',name:'',copy:'',image:'',visible:true,sortOrder:items.length})}
 async function save(){if(!item)return;setBusy(true);setStatus('');try{
  const id=item.id||slugify(item.name);if(!item.name?.trim()||!id)throw Error('Enter a category name.');
  await api('categories'+(items.some(x=>x.id===id)?'/'+id:''),{method:items.some(x=>x.id===id)?'PUT':'POST',body:{...item,id}});
  const cats=await refresh();setSelected(id);setItem(stable(cats.find(x=>x.id===id)));setStatus('Category saved. Existing products remain linked.');
 }catch(e){setStatus('Save failed: '+e.message)}finally{setBusy(false)}}
 return <><div className="admin-header"><div><p className="admin-tagline">GARMENT TYPES</p><h1>Categories</h1><p className="admin-subtitle">Pant Sets, Dresses, Gowns and other garment types used to filter the catalogue.</p></div><div className="admin-flex"><Btn variant="secondary" onClick={create}>+ Category</Btn><Btn onClick={save} disabled={!item||busy}>Save & Publish</Btn></div></div>
 {status&&<p className="admin-status">{status}</p>}
 <div className="admin-split"><div className="admin-card">{items.map(x=><button key={x.id} className={'admin-section-btn '+(selected===x.id?'selected':'')} onClick={()=>setSelected(x.id)}><strong>{x.name}</strong><span className="admin-section-counter">{products.filter(p=>p.cat===x.name||p.categoryId===x.id).length} products - {x.visible?'Visible':'Hidden'}</span></button>)}</div>
 {item&&<div className="admin-card"><h2>{item.name||'New Category'}</h2><Field label="Category Name"><Input value={item.name} onChange={v=>update('name',v)} placeholder="e.g. Pant Sets"/></Field>
 <Field label="Description"><TextArea value={item.copy} onChange={v=>update('copy',v)} placeholder="Short description for this category"/></Field>
 <Field label="Category Photograph"><MediaField spec="collection" value={item.image} onChange={v=>update('image',v)} pick={pick}/></Field>
 <Check label="Show this category" checked={item.visible} onChange={v=>update('visible',v)}/>
 <div className="admin-divider"/><details><summary>More options</summary><Field label="Display Order"><Input type="number" value={item.sortOrder} onChange={v=>update('sortOrder',Number(v))}/></Field><small className="admin-note">Internal URL key: {item.id||slugify(item.name)}</small></details>
 <p className="admin-note" style={{marginTop:14}}>Category changes update product filters. You can rename a category without manually editing every product.</p></div>}</div></>;
}
function CollectionManager({api,pick}){
 const [items,setItems]=useState([]),[products,setProducts]=useState([]),[selected,setSelected]=useState(''),[item,setItem]=useState(null),[status,setStatus]=useState(''),[busy,setBusy]=useState(false);
 async function refresh(){const [edits,looks]=await Promise.all([api('collections'),api('products')]);setItems(edits);setProducts(looks);return edits}
 useEffect(()=>{refresh().then(x=>setSelected(x[0]?.id||'')).catch(e=>setStatus(e.message))},[api]);
 useEffect(()=>{if(selected)setItem(stable(items.find(x=>x.id===selected)||null))},[selected,items]);
 const update=(k,v)=>setItem(x=>({...x,[k]:v}));
 function create(){setSelected('');setItem({id:'',name:'',description:'',image:'',visible:true,productIds:[],sortOrder:items.length})}
 async function save(){if(!item)return;setBusy(true);setStatus('');try{
  const id=item.id||slugify(item.name);if(!item.name?.trim()||!id)throw Error('Enter a collection name.');
  const exists=items.some(x=>x.id===id);await api('collections'+(exists?'/'+id:''),{method:exists?'PUT':'POST',body:{...item,id}});
  const edits=await refresh();setSelected(id);setItem(stable(edits.find(x=>x.id===id)));setStatus('Collection saved with selected products.');
 }catch(e){setStatus('Save failed: '+e.message)}finally{setBusy(false)}}
 return <><div className="admin-header"><div><p className="admin-tagline">CURATED EDITS</p><h1>Collections</h1><p className="admin-subtitle">Create seasonal, occasion or campaign edits and choose which garments appear in each.</p></div><div className="admin-flex"><Btn variant="secondary" onClick={create}>+ Collection</Btn><Btn onClick={save} disabled={!item||busy}>Save & Publish</Btn></div></div>
 {status&&<p className="admin-status">{status}</p>}
 <div className="admin-split"><div className="admin-card">{items.map(x=><button key={x.id} className={'admin-section-btn '+(selected===x.id?'selected':'')} onClick={()=>setSelected(x.id)}><strong>{x.name}</strong><span className="admin-section-counter">{x.productIds?.length||0} products - {x.visible?'Visible':'Hidden'}</span></button>)}{!items.length&&<p className="admin-empty">No curated collections yet. Create a Festive Edit, Evening Edit or another collection.</p>}</div>
 {item&&<div className="admin-card"><h2>{item.name||'New Collection'}</h2><Field label="Collection Name"><Input value={item.name} onChange={v=>update('name',v)} placeholder="e.g. The Festive Edit"/></Field>
 <Field label="Short Description"><TextArea value={item.description} onChange={v=>update('description',v)}/></Field>
 <Field label="Cover Photograph"><MediaField spec="collection" value={item.image} onChange={v=>update('image',v)} pick={pick}/></Field>
 <Check label="Show this collection" checked={item.visible} onChange={v=>update('visible',v)}/>
 <div className="admin-divider"/><h2>Select Products</h2><MultiProductPicker products={products} selected={item.productIds||[]} onChange={v=>update('productIds',v)}/>
 <div className="admin-divider"/><details><summary>More options</summary><Field label="Display Order"><Input type="number" value={item.sortOrder} onChange={v=>update('sortOrder',Number(v))}/></Field><small className="admin-note">URL: /collections/{item.id||slugify(item.name)}</small></details>
 <div className="admin-flex" style={{marginTop:16}}><Btn disabled={busy} onClick={save}>Save & Publish</Btn>{item.id&&<a className="cms-public-link" href={'/collections/'+item.id} target="_blank" rel="noreferrer">Preview Collection</a>}</div></div>}</div></>;
}

function FormManager({api}){
 const [forms,setForms]=useState([]),[selected,setSelected]=useState('enquiry'),[status,setStatus]=useState('');
 useEffect(()=>{api('forms').then(data=>{const list=Array.isArray(data)?data:Object.values(data);setForms(list);setSelected(list[0]?.id||'enquiry')}).catch(e=>setStatus(e.message))},[api]);
 const form=forms.find(f=>f.id===selected),index=forms.findIndex(f=>f.id===selected);
 function update(form){setForms(old=>old.map(f=>f.id===form.id?form:f))}
 async function save(){if(!form)return;try{await api('forms/'+selected,{method:'PUT',body:form});setStatus('Form changes published. Existing form IDs remain intact.')}catch(e){setStatus(e.message)}}
 return <><div className="admin-header"><div><h1>Form Builder</h1><p className="admin-subtitle">Edit field labels, required/optional rules, dropdown options, visibility and custom fields.</p></div><Btn onClick={save}>Save & Publish</Btn></div>{status&&<p className="admin-status">{status}</p>}<div className="admin-flex" style={{marginBottom:18}}>{forms.map(f=><Btn key={f.id} variant={selected===f.id?'':'secondary'} onClick={()=>setSelected(f.id)}>{f.title||f.id}</Btn>)}</div>{form&&<div className="admin-card"><div className="admin-row"><h2>{form.title}</h2><Btn variant="secondary sm" onClick={()=>update({...form,fields:[...form.fields,{name:'custom'+(form.fields.length+1),label:'New field',type:'text',required:false,visible:true,options:[]}]})}>+ Add Field</Btn></div><p className="admin-note" style={{marginBottom:16}}>Existing technical field names should stay unchanged; all customer-facing text and options are editable.</p>{form.fields.map((field,i)=><div className="admin-editor-field" key={field.name+'-'+i}><div className="admin-row" style={{marginBottom:10}}><strong>{i+1}. {field.label}</strong><div className="admin-flex"><Check label="Visible" checked={field.visible} onChange={v=>update({...form,fields:form.fields.map((f,j)=>j===i?{...f,visible:v}:f)})}/><Check label="Required" checked={field.required} onChange={v=>update({...form,fields:form.fields.map((f,j)=>j===i?{...f,required:v}:f)})}/></div></div><div className="admin-form-row"><Field label="Field label"><Input value={field.label} onChange={v=>update({...form,fields:form.fields.map((f,j)=>j===i?{...f,label:v}:f)})}/></Field><Field label="Input type"><Select value={field.type} options={['text','email','tel','number','date','time','textarea','select']} onChange={v=>update({...form,fields:form.fields.map((f,j)=>j===i?{...f,type:v}:f)})}/></Field></div><Field label="Field key (technical, change only for new fields)"><Input value={field.name} disabled={!field.name.startsWith('custom')} onChange={v=>update({...form,fields:form.fields.map((f,j)=>j===i?{...f,name:v}:f)})}/></Field>{field.type==='select'&&<Field label="Dropdown choices, one per line"><TextArea rows={5} value={(field.options||[]).join('\n')} onChange={v=>update({...form,fields:form.fields.map((f,j)=>j===i?{...f,options:v.split('\n').filter(Boolean)}:f)})}/></Field>}{field.name.startsWith('custom')&&<Btn variant="danger sm" onClick={()=>update({...form,fields:form.fields.filter((_,j)=>j!==i)})}>Remove custom field</Btn>}</div>)}</div>}</>
}

function RequestsManager({api,kind}){
 const [items,setItems]=useState([]),[selected,setSelected]=useState(''),[draft,setDraft]=useState(null),[status,setStatus]=useState('');
 useEffect(()=>{setItems([]);api('requests').then(x=>{const list=x.filter(r=>r.kind===kind);setItems(list);setSelected(list[0]?.id||'')}).catch(e=>setStatus(e.message))},[api,kind]);
 useEffect(()=>{setDraft(stable(items.find(x=>x.id===selected)||null))},[selected,items]);
 const statuses=kind==='appointment'?['requested','confirmed','rescheduled','cancelled','completed']:['new','contacted','follow_up','converted','closed','lost'];
 const change=(k,v)=>setDraft(old=>({...old,[k]:v}));
 async function save(){try{await api('requests/'+draft.id,{method:'PUT',body:{status:draft.status,notes:draft.notes,assignedTo:draft.assignedTo,followUpDate:draft.followUpDate}});setStatus('Request saved.');const newItems=await api('requests');setItems(newItems.filter(x=>x.kind===kind))}catch(e){setStatus(e.message)}}
 return <><div className="admin-header"><div><h1>{kind==='enquiry'?'Enquiry Manager':'Appointment Manager'}</h1><p className="admin-subtitle">Every website submission is saved in Firestore with source, status and customer details.</p></div><span className="admin-pill active">{items.length} records</span></div>{status&&<p className="admin-status">{status}</p>}<div className="admin-split"><div className="admin-card"><h2>Incoming {kind==='enquiry'?'enquiries':'appointments'}</h2>{items.map(x=><button key={x.id} className={'admin-section-btn '+(selected===x.id?'selected':'')} onClick={()=>setSelected(x.id)}><span className="admin-section-title">{x.name||'Customer'}</span><span className="admin-section-counter">{x.reference} · {x.status}</span></button>)}{!items.length&&<p className="admin-empty">No requests received yet.</p>}</div>{draft&&<div className="admin-card"><div className="admin-row"><h2>{draft.name}</h2><span className="admin-pill">{draft.reference}</span></div><p><strong>Email:</strong> {draft.email}</p><p><strong>Phone:</strong> {draft.phone||'Not provided'}</p><p><strong>Source:</strong> {draft.source}</p><div className="admin-divider"/><h2>Submitted details</h2><table className="admin-table"><tbody>{Object.entries(draft.fields||{}).map(([key,value])=><tr key={key}><th style={{width:160}}>{key}</th><td style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{String(value)}</td></tr>)}</tbody></table><div className="admin-divider"/><Field label="Status"><Select value={draft.status} options={statuses} onChange={v=>change('status',v)}/></Field><Field label="Assigned team member"><Input value={draft.assignedTo} onChange={v=>change('assignedTo',v)}/></Field><Field label="Next follow-up date"><Input type="date" value={draft.followUpDate||''} onChange={v=>change('followUpDate',v)}/></Field><Field label="Internal notes"><TextArea rows={5} value={draft.notes} onChange={v=>change('notes',v)}/></Field><Btn onClick={save}>Save Request</Btn></div>}</div></>
}

function SettingsManager({api,pick}){
 const [data,setData]=useState(null),[products,setProducts]=useState([]),[status,setStatus]=useState('');
 useEffect(()=>{Promise.all([api('settings'),api('products')]).then(([settings,looks])=>{setData(settings);setProducts(looks)}).catch(e=>setStatus(e.message))},[api]);
 const set=(section,key,v)=>setData(old=>({...old,[section]:{...old[section],[key]:v}}));
 async function save(){try{await api('settings',{method:'PUT',body:data});setStatus('Settings saved and published.')}catch(e){setStatus('Save error: '+e.message)}}
 const featured=data?.home?.featuredProductIds||[];
 return <><div className="admin-header"><div><h1>Global Settings</h1><p className="admin-subtitle">Manage shared contact details, social profiles, branding, home highlights and SEO.</p></div><Btn onClick={save} disabled={!data}>Save & Publish</Btn></div>
 {status&&<p className="admin-status">{status}</p>}{data&&<div className="admin-grid-2">
  <div className="admin-card"><h2>Contact & WhatsApp</h2>{[['email','Studio Email'],['phone','Phone'],['whatsapp','WhatsApp Number'],['address','Studio Address'],['mapsUrl','Google Maps Link']].map(([k,label])=><Field key={k} label={label}>{k==='address'?<TextArea value={data.contact?.[k]} onChange={v=>set('contact',k,v)}/>:<Input value={data.contact?.[k]} onChange={v=>set('contact',k,v)}/>}</Field>)}<p className="admin-note">Enter only verified business details. All pages will use the same contact information.</p></div>
  <div className="admin-card"><h2>Social Media</h2>{[['instagram','Instagram'],['facebook','Facebook'],['youtube','YouTube'],['linkedin','LinkedIn']].map(([k,label])=><Field key={k} label={label}><Input value={data.social?.[k]} onChange={v=>set('social',k,v)} placeholder={'Official '+label+' profile URL'}/></Field>)}</div>
  <div className="admin-card"><h2>Brand Appearance</h2><Field label="Official Logo"><MediaField spec="logo" value={data.branding?.logo} onChange={v=>set('branding','logo',v)} pick={pick}/></Field><Field label="Favicon"><MediaField spec="favicon" value={data.branding?.favicon} onChange={v=>set('branding','favicon',v)} pick={pick}/></Field><Field label="Magenta Accent"><Input value={data.branding?.accent} onChange={v=>set('branding','accent',v)} placeholder="#c33583"/></Field><Field label="Founder LinkedIn"><Input value={data.founderLinkedin} onChange={v=>setData(old=>({...old,founderLinkedin:v}))}/></Field></div>
  <div className="admin-card"><h2>Homepage Highlights</h2><p className="admin-note" style={{marginBottom:12}}>Select looks by name and photograph. You do not need to know product IDs.</p>
   <Field label="Best Seller — Linked Product"><Select value={data.home?.bestSellerId||''} options={[{value:'',label:'Choose linked product'},...products.filter(p=>p.visible!==false).map(p=>({value:p.id,label:p.title+' - '+p.cat}))]} onChange={v=>set('home','bestSellerId',v)}/></Field>
   {products.find(p=>p.id===data.home?.bestSellerId)&&<div className="cms-featured-preview"><img src={mediaSrc(products.find(p=>p.id===data.home.bestSellerId)?.catalogueImg||products.find(p=>p.id===data.home.bestSellerId)?.img)} alt="Linked product thumbnail only"/><span>Linked product: {products.find(p=>p.id===data.home.bestSellerId)?.title}<br/><small>Opens {productPath(products.find(p=>p.id===data.home.bestSellerId))}</small></span></div>}
   <p className="admin-note" style={{marginTop:10}}>This selection changes ONLY the product link. It does not replace the Best Seller section photograph or its text. To change that image, open Page Manager → Homepage → Best Seller.</p>
   <div className="admin-divider"/><h2>Featured Products</h2><p className="admin-note" style={{marginBottom:12}}>Choose up to four products to feature on the homepage. Their photographs come from <strong>Products &amp; Looks → Main Photographs → Homepage four-look grid / collection card</strong>, not from this screen.</p>
   <MultiProductPicker products={products} selected={featured} onChange={v=>{if(v.length<=4)set('home','featuredProductIds',v);else setStatus('Select no more than four featured products.')}}/>
  </div>
  <div className="admin-card"><h2>Search Engine Settings</h2><Field label="Website Name"><Input value={data.seo?.siteName} onChange={v=>set('seo','siteName',v)}/></Field><Field label="Default Meta Description"><TextArea value={data.seo?.defaultDescription} onChange={v=>set('seo','defaultDescription',v)}/></Field></div>
 </div>}</>;
}
function MediaManager({api,pick}){const [items,setItems]=useState([]),[status,setStatus]=useState('');useEffect(()=>{api('media').then(setItems).catch(e=>setStatus(e.message))},[api]);return <><div className="admin-header"><div><h1>Media Library</h1><p className="admin-subtitle">Upload photographs and videos up to {MAX_MEDIA_MB} MB per file. Reuse them throughout the CMS.</p></div><Btn onClick={()=>pick(()=>{api('media').then(setItems).catch(e=>setStatus(e.message))},'all','general')}>+ Upload Media</Btn></div>{status&&<p className="admin-status">{status}</p>}<div className="admin-card"><div className="admin-media-grid">{items.map(x=><button key={x.id} className="admin-media-tile" title="Copy image URL" onClick={()=>{navigator.clipboard.writeText(x.url);setStatus('Image URL copied')}}>{x.contentType?.startsWith('video/')?<video muted playsInline src={x.url} style={{width:'100%',height:140,objectFit:'cover'}}/>:<img src={x.url} alt={x.name||'Media'}/>}<span>{x.name||'Image'} · Copy URL</span></button>)}</div>{!items.length&&<p className="admin-empty">No Firebase uploads yet. The approved V6.9 photographs are already available in the website's local assets folder.</p>}</div></>}
function UserManager({api,me}){
 const initial={username:'',password:'',role:'editor'};
 const [users,setUsers]=useState([]),[form,setForm]=useState(initial),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[creating,setCreating]=useState(false),[showPassword,setShowPassword]=useState(false),[resetTarget,setResetTarget]=useState(null),[updatingId,setUpdatingId]=useState('');
 const roles=[{value:'editor',label:'Content Editor'},{value:'products',label:'Product Manager'},{value:'enquiries',label:'Enquiry / Appointment Staff'},{value:'viewer',label:'Read Only'},{value:'super_admin',label:'Super Admin'}];
 async function load(){try{setUsers(await api('users'))}catch(e){setStatus(e.message)}}
 useEffect(()=>{load()},[api]);
 async function add(e){
  e.preventDefault();setBusy(true);setStatus('');
  const username=normalizeAdminUsername(form.username);
  try{
   if(!validAdminUsername(username))throw Error('Username must be 3-32 characters, starting with a letter.');
   if(users.some(u=>normalizeAdminUsername(u.username)===username))throw Error('This username already exists.');
   if(form.password.length<12)throw Error('Use a password of at least 12 characters.');
   await api('users',{method:'POST',body:{username,password:form.password,role:form.role}});
   setForm(initial);setCreating(false);setShowPassword(false);
   setStatus('User '+username+' created. Share their password privately.');await load();
  }catch(error){setStatus('Could not create user: '+prettyError(error))}finally{setBusy(false)}
 }
 async function update(user,patch){
  if(user.id===me.uid){setStatus('You cannot change or disable your own Super Admin account here.');return}
  if(patch.active===false&&!window.confirm('Disable '+(user.username||user.email)+'? They will lose CMS access until you enable them.'))return;
  setStatus('');setUpdatingId(user.id);
  try{await api('users/'+user.id,{method:'PUT',body:{...user,...patch}});setStatus('User '+(user.username||user.email)+' updated.');await load()}
  catch(e){setStatus('Could not update user: '+prettyError(e))}
  finally{setUpdatingId('')}
 }
 const activeCount=users.filter(u=>u.active).length;
 return <><div className="admin-header cms-users-header"><div><h1>Admin Users</h1><p className="admin-subtitle">Create accounts, reset passwords or control access. Username, password and role only. No email or UID required.</p></div><Btn onClick={()=>{setCreating(v=>!v);setStatus('')}}>{creating?'Close Form':'+ Create User'}</Btn></div>
 {status&&<p className="admin-status" role="status">{status}</p>}
 {creating&&<div className="admin-card cms-staff-create"><div className="admin-row"><h2>Create Staff Account</h2><Btn variant="neutral sm" onClick={()=>setCreating(false)}>Cancel</Btn></div>
  <form onSubmit={add} autoComplete="off" className="cms-staff-form">
   <Field label="Username"><Input value={form.username} onChange={v=>setForm(old=>({...old,username:v}))} placeholder="e.g. designer01" minLength={3} maxLength={32} required autoComplete="off"/></Field>
   <Field label="Password"><div className="admin-flex" style={{flexWrap:'nowrap'}}><input className="admin-input" type={showPassword?'text':'password'} value={form.password} onChange={e=>setForm(old=>({...old,password:e.target.value}))} minLength={12} required autoComplete="new-password"/><Btn variant="secondary sm" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</Btn></div></Field>
   <Field label="Access Role"><Select value={form.role} options={roles} onChange={v=>setForm(old=>({...old,role:v}))}/></Field>
   <div className="cms-staff-create-actions"><button className="admin-btn" disabled={busy} type="submit">{busy?'Creating...':'Create User'}</button><small className="admin-note">Minimum 12-character password. Share it privately.</small></div>
  </form>
 </div>}
 <div className="admin-card"><div className="admin-row cms-staff-list-heading"><h2>Staff Accounts</h2><span className="admin-note">{activeCount} active · {users.length} total</span></div>
 {users.map(user=><div className="cms-staff-row" key={user.id}>
  <div className="cms-staff-identity"><div className="cms-staff-name"><strong>{user.username||user.email}</strong>{user.id===me.uid&&<span className="admin-pill">You</span>}<span className={'admin-pill '+(user.active?'active':'')}>{user.active?'Active':'Disabled'}</span></div>
   <p className="admin-note">{ROLE_NAMES[user.role]||user.role} · Username login</p>
  </div>
  {user.id!==me.uid?<div className="cms-staff-actions">
   <Btn variant="secondary sm" onClick={()=>setResetTarget(user)} disabled={updatingId===user.id}>Reset Password</Btn>
   <Btn variant={user.active?'danger sm':'secondary sm'} disabled={updatingId===user.id} onClick={()=>update(user,{active:!user.active})}>{updatingId===user.id?'Saving...':(user.active?'Disable User':'Enable User')}</Btn>
   <details className="cms-staff-permissions"><summary>Access Role</summary><div className="cms-staff-permissions-select"><Select value={user.role} options={roles} disabled={updatingId===user.id} onChange={v=>update(user,{role:v})}/></div></details>
  </div>:<p className="admin-note cms-staff-self-note">Use the account menu to change your password.</p>}
 </div>)}{!users.length&&<p className="admin-empty">Your staff accounts will appear here. Click Create User to add one.</p>}
 <p className="admin-note" style={{marginTop:14}}>Existing passwords cannot be viewed. Super Admin can securely set a new password for staff without any Firebase Authentication reset service.</p>
 </div>{resetTarget&&<ResetStaffPassword staff={resetTarget} api={api} onClose={()=>setResetTarget(null)}/>}</>;
}

export default function CmsApp(){
 const [session,setSession]=useState(undefined),[me,setMe]=useState(null),[screen,setScreen]=useState('dashboard'),[error,setError]=useState(''),[picker,setPicker]=useState(null),[changePassword,setChangePassword]=useState(false);
 const api=React.useCallback(cmsApi,[]);
 useEffect(()=>{let alive=true;authApi('me').then(user=>{if(alive){setMe(user);setSession(user)}}).catch(()=>{if(alive){setMe(null);setSession(null)}});return()=>{alive=false}},[]);
 useEffect(()=>{document.title='SHANERYN | Content Studio'},[]);
 useEffect(()=>{const expired=()=>{setMe(null);setSession(null)};window.addEventListener('shaneryn-session-expired',expired);return()=>window.removeEventListener('shaneryn-session-expired',expired)},[]);
 const pick=(callback,type='all',spec='general')=>setPicker({onPick:callback,type,spec});
 async function logout(){try{await authApi('logout')}finally{setMe(null);setSession(null);setScreen('dashboard')}}
 function login(user){setMe(user);setSession(user);setScreen('dashboard');setError('')}
 const allowed=(view)=>view==='dashboard'||me?.role==='super_admin'||(view==='pages'&&['editor','viewer'].includes(me?.role))||(['products','categories','collections','media'].includes(view)&&['editor','products','viewer'].includes(me?.role))||(['enquiries','appointments'].includes(view)&&me?.role==='enquiries')||(['forms','settings'].includes(view)&&['editor','viewer'].includes(me?.role));
 const availableNav=NAV.filter(([key])=>allowed(key));
 if(session===undefined)return <div className="admin-shell admin-login-wrap"><div style={{color:'white'}}>Loading admin…</div></div>;
 if(!session)return <Login onLogin={login}/>;
 if(!me)return <div className="admin-shell admin-login-wrap"><div className="admin-login"><div className="login-logo">SHANERYN</div><p className="login-note">{error||'Checking permissions…'}</p><button onClick={logout}>Sign out</button></div></div>;
 return <div className="admin-shell"><div className="admin-main-layout"><aside className="admin-sidebar"><div><div className="admin-wordmark">SHANERYN</div><div className="admin-subword">CONTENT STUDIO</div></div><div className="admin-mobile-nav"><label htmlFor="admin-mobile-module">Admin menu <small>({ROLE_NAMES[me.role]||me.role})</small></label><select id="admin-mobile-module" aria-label="Choose admin module" value={screen} onChange={e=>setScreen(e.target.value)}>{availableNav.map(([key,,name])=><option key={key} value={key}>{name}</option>)}</select><div className="admin-mobile-actions"><button type="button" onClick={()=>setChangePassword(true)}>Change Password</button><a href="/" target="_blank" rel="noreferrer">View Website ↗</a><button type="button" onClick={logout}>Sign out</button></div></div><nav aria-label="Admin modules">{availableNav.map(([key,icon,name])=><button key={key} className={'admin-navitem '+(screen===key?'active':'')} onClick={()=>setScreen(key)}><span className="admin-navicon">{icon}</span>{name}</button>)}</nav><div className="admin-sidebar-footer"><strong>{me.username}</strong><br/>{me.role.replace('_',' ')}<div style={{marginTop:12}}><button className="admin-navitem" onClick={()=>setChangePassword(true)}>Change Password</button><button className="admin-navitem" onClick={logout}>↩ Sign Out</button></div><a href="/" target="_blank" rel="noreferrer" style={{color:'#d79bb9'}}>View Website ↗</a></div></aside><main className="admin-main">{screen==='dashboard'?<Dashboard api={api} me={me} onNavigate={setScreen} canOpen={allowed}/>:screen==='pages'?<PageManager api={api} pick={pick}/>:screen==='products'?<ProductManager api={api} pick={pick}/>:screen==='categories'?<CategoryManager api={api} pick={pick}/>:screen==='collections'?<CollectionManager api={api} pick={pick}/>:screen==='forms'?<FormManager api={api}/>:screen==='enquiries'?<RequestsManager api={api} kind="enquiry"/>:screen==='appointments'?<RequestsManager api={api} kind="appointment"/>:screen==='media'?<MediaManager api={api} pick={pick}/>:screen==='settings'?<SettingsManager api={api} pick={pick}/>:screen==='users'?<UserManager api={api} me={me}/>:null}</main></div>{picker&&<MediaPicker api={api} type={picker.type} spec={picker.spec} onPick={picker.onPick} onClose={()=>setPicker(null)}/>} {changePassword&&<PasswordChange onClose={()=>setChangePassword(false)} onChanged={()=>{setChangePassword(false);setSession(null);setMe(null)}}/>}</div>;
}
