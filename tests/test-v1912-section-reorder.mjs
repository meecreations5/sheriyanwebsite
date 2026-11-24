import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=readFileSync(path.join(root,'lib/render-page.js'),'utf8');
const begin=source.indexOf('function patchSections($,page){');
const end=source.indexOf('\nfunction blockHtml(',begin);
assert.ok(begin>=0&&end>begin,'Section-ordering renderer must exist');
const code=source.slice(begin,end);
assert.doesNotMatch(code,/\.detach\s*\(/,'No jQuery-only .detach() in Cheerio renderer');
assert.match(code,/\.remove\s*\(/,'Uses Cheerio-compatible .remove()');

// Exercise the real patchSections source against a small, deliberately simple
// DOM double. This validates section ordering/slots without service credentials.
function node(tag,id){return {tag,id,parent:null,attrs:id?{'data-cms-section':id}:{}}}
const main=node('main');
const before=node('p');const after=node('footer');
const a=node('section','a'),b=node('section','b'),c=node('section','c');
main.children=[before,a,b,c,after];
for(const n of main.children)n.parent=main;
const byId={a,b,c};
function detach(el){if(el.parent){const list=el.parent.children;const i=list.indexOf(el);if(i>=0)list.splice(i,1)}el.parent=null}
function insertBefore(ref,el){detach(el);const parent=ref.parent;assert.ok(parent,'reference attached');const i=parent.children.indexOf(ref);parent.children.splice(i,0,el);el.parent=parent}
function replace(ref,el){detach(el);const parent=ref.parent;assert.ok(parent,'marker attached');const i=parent.children.indexOf(ref);parent.children[i]=el;el.parent=parent;ref.parent=null}
function $(arg){
 let items=[];
 if(arg==='main')items=[main];
 else if(typeof arg==='string'&&arg.startsWith('[data-cms-section=')){
  const id=arg.match(/\[data-cms-section="([^"]+)"\]/)?.[1];items=id&&byId[id]?[byId[id]]:[];
 }else if(arg==='<div data-cms-sort-placeholder="1"></div>')items=[node('div')];
 else if(arg&&typeof arg==='object')items=[arg];
 return {
  length:items.length,
  first(){return $(items[0])},
  children(){return {toArray(){return main.children.filter(n=>n.tag==='section'&&n.attrs['data-cms-section'])}}},
  attr(key,value){if(arguments.length===1)return items[0]?.attrs[key];for(const el of items)el.attrs[key]=value;return this},
  toArray(){return [...items]},
  before(marker){insertBefore(items[0],marker.toArray()[0]);return this},
  remove(){for(const el of items)detach(el);return this},
  replaceWith(el){replace(items[0],el);return this}
 };
}
const hidden=[];
const context={$ , attrCSS:(el,isHidden)=>hidden.push([el.toArray()[0]?.id,isHidden])};
vm.runInNewContext(code+'\nthis.patchSections=patchSections;',context);
context.patchSections($,{
 sections:[{id:'a'},{id:'b'},{id:'c'}],
 sectionSettings:{a:{order:2},b:{order:0,visible:false},c:{order:1}}
});
assert.deepEqual(main.children.map(n=>n.id||n.tag),['p','b','c','a','footer']);
assert.equal(a.parent,main);assert.equal(b.parent,main);assert.equal(c.parent,main);
assert.equal(main.children.filter(n=>n.tag==='div').length,0,'No sort markers left behind');
assert.deepEqual(hidden,[['b',true]]);
assert.equal(main.children.filter(n=>n.tag==='section').length,3);
console.log('PASS V1.18.12: fixed Cheerio .detach() crash, section reorder/visibility and original DOM slot retention');
