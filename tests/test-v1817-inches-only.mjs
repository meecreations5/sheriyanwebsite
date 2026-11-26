import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=file=>readFileSync(resolve(root,file),'utf8');
const bespoke=JSON.parse(source('data/seed/pages/bespoke.json'));
const look=JSON.parse(source('data/seed/pages/look.json'));
const script=source('public/feedback-v3.js');
const lookScript=source('public/look-detail-v45.js');
const render=source('lib/render-page.js');
const admin=source('components/admin/CmsApp.jsx');

// The published baseline must not show a centimetre toggle, even before JS loads.
assert.match(bespoke.bodyHtml,/<div class="cv3-unit-row"><span[^>]*>.*?Measurements in.*?<strong>INCHES \(in\)<\/strong><\/div>/s);
assert.doesNotMatch(bespoke.bodyHtml,/centimet|name="measure-unit"|value="cm"/i);
assert.ok(!bespoke.fields.some(f=>['f00310','f00311'].includes(f.id)),'Obsolete CMS unit controls removed from baseline');
assert.match(admin,/selected==='bespoke'&&\['f00310','f00311'\]\.includes\(f\.id\)/,'Older published pages do not show CM editing controls');
assert.doesNotMatch(script,/centimet|\bcm\b|name="measure-unit"/i,'No conversion or unit toggle remains in browser logic');
assert.match(lookScript,/const unitName=\(\)=> 'in'/);
assert.match(lookScript,/Units: inches/);
assert.doesNotMatch(lookScript,/centimet|\bcm\b/i);
assert.doesNotMatch(look.bodyHtml,/centimet|name="measure-unit"|value="cm"/i);

// Simulate a previously published Firestore page still containing a CM radio;
// ensure the server-side normalizer replaces it, without touching other pages.
const start=render.indexOf('function enforceInchesOnlyMeasurements(');
const end=render.indexOf('// Look Details: render optional',start);
assert.ok(start!==-1&&end>start);
assert.match(render,/enforceInchesOnlyMeasurements\(\$,page\)/);
const oldRow={editableSpan:'Measurements in',labels:['Inches','Centimetres'],strong:''};
const legacyRadio={removed:false};
function fakeQuery(selector){
 if(selector==='.cv3-unit-row')return {each(fn){fn(0,oldRow)}};
 if(selector==='input[name="measure-unit"]')return {each(fn){fn(0,legacyRadio)}};
 if(selector===oldRow)return {
  find(q){
   if(q==='label')return {remove(){oldRow.labels=[]}};
   if(q==='input[name="measure-unit"]')return {remove(){oldRow.labels=[]}};
   if(q==='strong')return {first(){return oldRow.strong?{length:1,text(v){oldRow.strong=v}}:{length:0}}};
   throw Error('Unexpected row child selector '+q);
  },
  append(markup){oldRow.strong=markup.match(/<strong>([^<]+)<\/strong>/)?.[1]||''}
 };
 if(selector===legacyRadio)return {closest(){return {length:1,remove(){legacyRadio.removed=true}}}};
 throw Error('Unexpected selector in normalization test: '+selector);
}
const rendering={};
vm.runInNewContext(render.slice(start,end)+'\nglobalThis.run=enforceInchesOnlyMeasurements;',rendering);
rendering.run(fakeQuery,{slug:'bespoke'});
assert.equal(oldRow.strong,'INCHES (in)');
assert.deepEqual(oldRow.labels,[]);
assert.equal(oldRow.editableSpan,'Measurements in','CMS-editable introduction remains available');
assert.equal(legacyRadio.removed,true);
rendering.run(fakeQuery,{slug:'collections'});
assert.equal(oldRow.strong,'INCHES (in)','Other pages remain unaffected');

// Run the real Bespoke measurements controller against lightweight DOM mocks.
// This verifies fields, grouping, mode changes, and review submissions, not just source strings.
const sectionStart=script.indexOf(' // Measurements: two data-driven paths.');
const sectionEnd=script.lastIndexOf('\n})();');
assert.ok(sectionStart>=0&&sectionEnd>sectionStart);
const listeners=()=>({handlers:{},addEventListener(type,fn){this.handlers[type]=fn}});
const select={...listeners(),value:'Occasion Wear',innerHTML:''};
const input={dataset:{measureKey:'Body Measurements / Chest'},value:'33.5',checkValidity(){return true},focus(){}};
const fieldRoot={...listeners(),innerHTML:'',querySelectorAll(q){return q==='input[data-measure-key]'?[input]:[]}};
const form={...listeners(),checkValidity(){return true}};
const review={hidden:true,scrollIntoView(){this.scrolled=true}};
const status={textContent:''},summary={textContent:''},copied={textContent:''},copy= listeners();
const garmentButton={dataset:{measureMode:'garment'},...listeners(),setAttribute(){}};
const lookButton={dataset:{measureMode:'look'},...listeners(),setAttribute(){}};
const map={'#measure-select':select,'#cv3-measure-fields':fieldRoot,'#cv3-measure-form':form,'#cv3-measure-review':review,'#cv3-unit-hint':status,'#cv3-measure-summary':summary,'#cv3-measure-status':copied,'#cv3-measure-copy':copy};
const document={querySelector:q=>map[q]||null,querySelectorAll(q){if(q==='[data-measure-mode]')return [garmentButton,lookButton];return []}};
const looks=[{id:'SH-STARLIGHT',title:'Starlight',measurementGroups:{Top:['Shoulder','Chest']}}];
const context={document,looks,location:{search:''},URLSearchParams,Number,Map,Math,matchMedia:()=>({matches:true})};
const prelude=`const $=(q,el=document)=>el.querySelector(q),all=(q,el=document)=>[...el.querySelectorAll(q)];
const looks=globalThis.looks;const itemById=id=>looks.find(x=>x.id===id);
const esc=s=>String(s).replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));`;
vm.runInNewContext(prelude+script.slice(sectionStart,sectionEnd),context);
assert.match(fieldRoot.innerHTML,/Chest <span>\(in\)<\/span>/);
assert.match(fieldRoot.innerHTML,/Bust <span>\(in\)<\/span>/);
assert.match(fieldRoot.innerHTML,/max="140"/);
assert.doesNotMatch(fieldRoot.innerHTML,/centimet|\(cm\)/i);
assert.equal(status.textContent,'Enter all measurements in inches (in).');
fieldRoot.handlers.input({target:{closest:()=>input}});
form.handlers.submit({preventDefault(){}});
assert.equal(review.hidden,false);
assert.match(summary.textContent,/Measurements in inches/);
assert.match(summary.textContent,/Body Measurements \/ Chest: 33\.5 in/);
assert.doesNotMatch(summary.textContent,/cm|centimet/i);
// Look-specific path uses the same inches rule; switching back preserves numbers.
lookButton.handlers.click();
assert.match(fieldRoot.innerHTML,/Shoulder <span>\(in\)<\/span>/);
garmentButton.handlers.click();
assert.match(fieldRoot.innerHTML,/value="33\.5"/);
console.log('PASS V1.18.17: Bespoke and Look Details inches only; archived CM radio removed; fields and review use inches; CMS unit labels retired.');
