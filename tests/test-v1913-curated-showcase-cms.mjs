import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=p=>readFileSync(resolve(root,p),'utf8');
const page=JSON.parse(source('data/seed/pages/collections.json'));
const ids=['f00242','f00243','f00244','f00245'];
assert.ok(ids.every(id=>page.fields.some(f=>f.id===id&&f.kind==='text'&&f.section==='s-000')),'Four editable seed fields are provided');
assert.equal(new Set(page.fields.map(f=>f.id)).size,page.fields.length,'Field IDs remain unique');
const render=source('lib/render-page.js');
const ui=source('components/admin/CmsApp.jsx');
const server=source('lib/cms-server-api.js');
const preview=source('public/cms-preview.js');
for(const id of ids){
 assert.match(render,new RegExp(`data-cms-text-refs="${id}"`),'Rendered showcase has preview text metadata');
 assert.match(render,new RegExp(`<!--cms:${id}-->`),'Rendered showcase has CMS marker');
 assert.ok(ui.includes(`cms-curated-${id}`),'Dedicated edit input for '+id);
}
assert.match(ui,/Our Collections - Website Showcase/);
assert.match(ui,/To edit THE CURVE EDIT card:/);
assert.match(ui,/selected==='collections'/);
assert.match(ui,/updatePatch\('f00243',\{value\}\)/);
assert.match(render,/patchCuratedCollections\(\$,curatedCollections,activeCuratedCollection,page\)/);
assert.match(preview,/shaneryn-cms-preview/);
assert.match(preview,/data-cms-text-refs/);
assert.match(server,/patches:trimPatches\(body,base\.fields\)/,'Existing publish path sanitizes patches against seed fields');
// Exercise the real curated showcase renderer in isolation, without Firestore or a running Next.js server.
const beginning=render.indexOf('function patchCuratedCollections(');
const finish=render.indexOf('// Look Details: render optional',beginning);
assert.ok(beginning>=0&&finish>beginning);
const snippet=render.slice(beginning,finish);
function exampleRenderer(collections,patches={},active=null){
 let inserted='';
 const $=selector=>({
  length:selector==='.collections-main'?1:0,
  last(){return this},first(){return this},
  after(html){inserted=html},append(html){inserted=html},
  text(){return this},attr(){return this}
 });
 const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const safeImage=v=>{const x=String(v||'');return (/^(https:\/\/|\/|assets\/|data:image\/)/i.test(x)&&!/[<>]/.test(x))?x:''};
 const normalized=(p,id)=>p?.[id]&&typeof p[id]==='object'?p[id]:null;
 const context={$ ,escapeHtml,safeImage,normalized};
 vm.runInNewContext(snippet+'\nglobalThis.renderShowcase=patchCuratedCollections;',context);
 context.renderShowcase($,collections,active,{...page,patches});
 return inserted;
}
const collections=[{id:'the-curve-edit',name:'THE CURVE EDIT',image:'/cover.jpg',visible:true}];
const original=exampleRenderer(collections);
assert.match(original,/CURATED BY SHANERYN/);
assert.match(original,/Our Collections\./);
assert.match(original,/Explore considered edits for every occasion/);
assert.match(original,/THE CURVE EDIT/);
assert.match(original,/Explore All Looks ↗/);
assert.match(original,/href="\/collections\/the-curve-edit"/);
const updated=exampleRenderer(collections,{
 f00242:{value:'CELEBRATE THE CURVE',visible:true},
 f00243:{value:'The Latest Edit.',visible:true},
 f00244:{value:'Looks for <every> moment',visible:true},
 f00245:{value:'Discover collection',visible:true}
});
assert.match(updated,/CELEBRATE THE CURVE/);
assert.match(updated,/The Latest Edit/);
assert.match(updated,/Looks for &lt;every&gt; moment/,'Custom HTML is escaped, never injected');
assert.doesNotMatch(updated,/<every>/);
assert.match(updated,/Discover collection/);
assert.match(updated,/THE CURVE EDIT/,'Collection title remains controlled by collection records');
assert.equal(exampleRenderer([]),'','No collection -> no empty showcase');
assert.equal(exampleRenderer(collections,{}, {name:'Destination Edit',description:'test'}),'','Curated detail page does not get the overview showcase');
// Exercise actual patch sanitization for existing Firestore publishing flow.
const trimBegin=server.indexOf('function trimPatches('),trimEnd=server.indexOf('function cleanPage(',trimBegin);
assert.ok(trimBegin>=0&&trimEnd>trimBegin);
const sanitizer={small:(v,max)=>String(v??'').slice(0,max),safeLink:v=>v,safeImage:v=>v};
vm.runInNewContext(server.slice(trimBegin,trimEnd)+'\nglobalThis.sanitise=trimPatches;',sanitizer);
const clean=sanitizer.sanitise({patches:{f00243:{value:'Custom published title',visible:true},notExisting:{value:'Blocked'}}},page.fields);
assert.equal(clean.f00243.value,'Custom published title');
assert.equal(clean.notExisting,undefined,'Unknown fields rejected');
console.log('PASS V1.18.13: Collections showcase editor fields, sanitised persistence, server rendering, HTML escaping, and live preview marker mapping.');
