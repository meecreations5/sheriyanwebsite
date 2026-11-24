import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const server=read('lib/cms-server-api.js');
const admin=read('components/admin/CmsApp.jsx');
const render=read('lib/render-page.js');
const lightbox=read('public/client-feedback-v63.js');
const css=read('public/shaneryn-v190-refinements.css');
const legacy=read('components/LegacyPage.jsx');
const bespoke=JSON.parse(read('data/seed/pages/bespoke.json'));
const home=JSON.parse(read('data/seed/pages/index.json'));

// Exercise the actual V1.18.10 page sanitiser, without Firebase credentials.
const start=server.indexOf('function cleanPage('),end=server.indexOf('function cleanProduct(');
assert.ok(start>0&&end>start,'cleanPage function exists');
const context={
 small:(v,n=1000)=>String(v??'').slice(0,n),
 safeImage:v=>/^(https:\/\/|assets\/|\/)/i.test(String(v||''))?String(v):'',
 safeLink:v=>String(v||''),
 safeVideo:v=>String(v||''),
 slugValid:v=>/^[a-z0-9][a-z0-9_-]{1,80}$/i.test(String(v||'')),
 trimPatches:()=>({}),
 cleanArray:(a,max)=>Array.isArray(a)?a.slice(0,max):[],
 serverTimestamp:()=>0,
 crypto:{randomUUID:()=> 'fake-uuid'}
};
vm.runInNewContext(server.slice(start,end)+'\nglobalThis.cleanPage=cleanPage;',context);
const input={
 name:'Bespoke',title:'Bespoke',
 pastWorkExtras:[
  {id:'past-1',src:'https://storage.example/photo-a.webp',alt:'An embroidered couture gown',visible:true},
  {id:'past-2',src:'https://storage.example/photo-b.webp',alt:'Second look',visible:false},
  {id:'past-3',src:'javascript:alert(1)',alt:'Unsafe',visible:true},
 ]
};
const saved=context.cleanPage(input,bespoke);
assert.equal(saved.pastWorkExtras.length,3);
assert.equal(saved.pastWorkExtras[0].src,'https://storage.example/photo-a.webp');
assert.equal(saved.pastWorkExtras[1].visible,false);
assert.equal(saved.pastWorkExtras[2].src,'','unsafe URLs must be discarded');
assert.equal(context.cleanPage({pastWorkExtras:Array.from({length:105},(_,i)=>({id:`past-${i}`,src:'/test.png'}))},bespoke).pastWorkExtras.length,100,'100 extra max');
assert.match(admin,/selected==='bespoke'/);
for(const label of ['Past Work Gallery','Add Photograph','Show photograph on website','Save &amp; Publish'])assert.ok(admin.includes(label),label);
assert.match(admin,/MediaField spec="editorial"/);
assert.match(render,/function patchPastWorkGallery\(\$,page\)/);
assert.match(render,/grid\.append\(`/);
assert.match(render,/patchPastWorkGallery\(\$,page\)/);
assert.match(lightbox,/querySelectorAll\('#past-work \.v63-work-item'\)/);
assert.match(lightbox,/getComputedStyle\(button\)\.display!=='none'/);
assert.equal((bespoke.bodyHtml.match(/class="v63-work-item"/g)||[]).length,17,'Original 17 photos preserved');
assert.ok(home.bodyHtml.includes('class="bespoke-inset"'));
assert.ok(home.bodyHtml.includes('class="closure-v59-heading"'));
assert.match(css,/\.bespoke-visual > img:not\(\.bespoke-inset\)/);
assert.match(css,/\.bespoke-visual > img\.bespoke-inset/);
assert.match(css,/border: 0 !important/);
assert.match(css,/#closure \.closure-v62-kicker em/);
assert.match(css,/font-style: normal !important/);
assert.match(legacy,/slug==='index'&&<link rel="stylesheet" href="\/shaneryn-v190-refinements\.css"/);
console.log('PASS V1.18.10: Past Work extras sanitize and persist, 17 originals preserved, public gallery and lightbox extend, home-only border and upright label overrides');
