import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {normalizeProductDetails} from '../lib/product-details.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const source=read('lib/render-page.js');
const start=source.indexOf('function renderProductInformation(');
const end=source.indexOf('\nexport function renderPage(',start);
if(start<0||end<=start)throw Error('Cannot locate renderProductInformation');
const context={normalizeProductDetails,escapeHtml,console};
vm.runInNewContext(source.slice(start,end)+'\nglobalThis.renderProductInformation=renderProductInformation;',context);
export const renderInfo=context.renderProductInformation;
export function mockDom(){
 const events=[];
 const $=selector=>{
  if(typeof selector==='object')return selector;
  const key=String(selector);
  const el={selector:key,length:1,
   first(){return this},
   parent(){return $('__category_parent__')},
   text(value){events.push({type:'text',selector:key,value});return this},
   remove(){events.push({type:'remove',selector:key});return this},
   before(value){events.push({type:'before',selector:key,value});return this},
   after(value){events.push({type:'after',selector:key,value});return this},
   append(value){events.push({type:'append',selector:key,value});return this},
   removeClass(value){events.push({type:'removeClass',selector:key,value});return this},
   addClass(value){events.push({type:'addClass',selector:key,value});return this}
  };
  return el;
 };
 return {$,events};
}
