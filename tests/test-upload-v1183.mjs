import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  MAX_MEDIA_MB,MAX_MEDIA_BYTES,DIRECT_UPLOAD_BYTES,
  IMAGE_MEDIA_TYPES,VIDEO_MEDIA_TYPES,SUPPORTED_MEDIA_TYPES,mediaUploadError
} from '../lib/cms-media-policy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
assert.equal(MAX_MEDIA_MB,100);
assert.equal(MAX_MEDIA_BYTES,104857600);
assert.equal(DIRECT_UPLOAD_BYTES,3*1024*1024);
assert.equal(SUPPORTED_MEDIA_TYPES.length,6);
assert.equal(IMAGE_MEDIA_TYPES.length,4);
assert.equal(VIDEO_MEDIA_TYPES.length,2);
for(const type of SUPPORTED_MEDIA_TYPES){
  assert.equal(mediaUploadError({name:'media-file',type,size:MAX_MEDIA_BYTES}), '', `100 MB boundary allowed: ${type}`);
  assert.match(mediaUploadError({name:'media-file',type,size:MAX_MEDIA_BYTES+1}),/100 MB/);
}
assert.match(mediaUploadError({name:'image.jpg',type:'image/jpeg',size:1},'video'),/MP4 or WebM/);
assert.match(mediaUploadError({name:'video.mp4',type:'video/mp4',size:1},'image'),/JPG, PNG/);
assert.match(mediaUploadError({name:'bad',type:'application/pdf',size:10}),/Use JPG/);
assert.match(mediaUploadError({name:'x',type:'image/png',size:0}),/100 MB/);
assert.match(mediaUploadError({name:'x'.repeat(201),type:'image/png',size:1024}),/name is too long/);

const ui=read('components/admin/CmsApp.jsx');
const server=read('lib/cms-media-server.js');
const sign=read('app/api/admin/media/sign/route.js');
const direct=read('app/api/admin/media/upload/route.js');
const done=read('app/api/admin/media/complete/route.js');
assert.match(ui,/from '@\/lib\/cms-media-policy.mjs'/);
assert.match(server,/from '@\/lib\/cms-media-policy.mjs'/);
assert.match(ui,/mediaUploadError\(\{name:file.name,type:file.type,size:file.size\},type\)/);
assert.match(server,/mediaUploadError\(\{name, type, size\}\)/);
assert.match(ui,/Maximum upload: \{MAX_MEDIA_MB\} MB per file/);
assert.match(ui,/file.size<=DIRECT_UPLOAD_BYTES/);
assert.match(ui,/mediaRequest\('sign'/);
assert.match(ui,/mediaRequest\('complete'/);
assert.match(sign,/mediaValidation\(input.name, input.contentType, Number\(input.size\)\)/);
assert.match(direct,/mediaValidation\(file.name,file.type,file.size\)/);
assert.match(done,/Number\(info.size\)!==job.size/);
assert.match(ui,/function MediaField/);
assert.match(ui,/function VideoField/);
assert.match(ui,/function MediaManager/);
// All form uploads share MediaPicker. No other CMS upload UI can bypass its cap.
let fileInputCount=0;
for(const folder of ['app','components','lib']) {
  const scan=d=>{for(const entry of fs.readdirSync(d,{withFileTypes:true})){
    if(entry.isDirectory())scan(path.join(d,entry.name));
    else if(/\.(?:js|jsx|mjs)$/.test(entry.name)){
      const source=fs.readFileSync(path.join(d,entry.name),'utf8');
      fileInputCount+=(source.match(/type="file"/g)||[]).length;
      if(/type="file"/.test(source))assert.equal(path.relative(root,path.join(d,entry.name)),'components/admin/CmsApp.jsx');
    }
  }};scan(path.join(root,folder));
}
assert.equal(fileInputCount,1,'One shared file input across CMS modules');
console.log('PASS V1.18.3: global 100 MB policy, boundary tests, all CMS upload surfaces and Storage routing');
