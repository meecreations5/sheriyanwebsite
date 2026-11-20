const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const read = rel => fs.readFileSync(path.join(root,rel),'utf8');

async function run() {
  const url='data:text/javascript,'+encodeURIComponent(read('lib/plain-client-data.js'));
  const {toPlainClientData} = await import(url);
  class FirestoreTimestamp {
    constructor(seconds,nanoseconds){this.seconds=seconds;this.nanoseconds=nanoseconds}
    toDate(){return new Date(this.seconds*1000+Math.floor(this.nanoseconds/1e6))}
    toJSON(){return {seconds:this.seconds,nanoseconds:this.nanoseconds}}
  }
  class GeoPoint { constructor(lat,long){this.latitude=lat;this.longitude=long} }
  const updatedAt = new FirestoreTimestamp(1732200000,637000000);
  const clientProps={
    scripts:['site.js','mobile-v5.js'],
    products:[{id:'SH-SUNSHINE',title:'Sunshine',updatedAt,gallery:[{src:'assets/studio.jpg',meta:{lastEdited:updatedAt}}],details:{createdAt:new Date('2026-11-21T00:00:00Z')},blob:new Uint8Array([1,2,3])}],
    settings:{lastPublished:updatedAt,other:{group:new Set(['A','B'])}},
    collections:[{id:'pant',geo:new GeoPoint(19.1,72.8)}],
    page:{slug:'index',options:new Map([['cta','Explore']])},
    activeProductId:null
  };
  const plain=toPlainClientData(clientProps);
  function assertPlain(value) {
    if(value==null||typeof value!=='object')return;
    assert.ok(Array.isArray(value)||Object.getPrototypeOf(value)===Object.prototype,`Non-plain prototype: ${value.constructor?.name}`);
    assert.equal(typeof value.toJSON,'undefined');
    Object.values(value).forEach(assertPlain);
  }
  assertPlain(plain);
  assert.equal(plain.products[0].updatedAt,new Date(1732200000637).toISOString());
  assert.equal(plain.products[0].gallery[0].meta.lastEdited,plain.products[0].updatedAt);
  assert.equal(plain.settings.lastPublished,plain.products[0].updatedAt);
  assert.equal(plain.products[0].details.createdAt,'2026-11-21T00:00:00.000Z');
  assert.deepEqual(plain.products[0].blob,[1,2,3]);
  assert.deepEqual(plain.collections[0].geo,{latitude:19.1,longitude:72.8});
  assert.deepEqual(plain.settings.other.group,['A','B']);
  assert.deepEqual(plain.page.options,{cta:'Explore'});
  assert.equal(JSON.stringify(plain).includes('SH-SUNSHINE'),true);
  const rsc=read('components/LegacyPage.jsx');
  assert.match(rsc,/import \{toPlainClientData\} from '@\/lib\/plain-client-data'/);
  assert.match(rsc,/const clientProps=toPlainClientData\(/);
  assert.match(rsc,/<LegacyScripts \{\.\.\.clientProps\}\/>/);
  assert.doesNotMatch(rsc,/<LegacyScripts scripts=\{page\.scripts\}/);
  const source=JSON.parse(read('data/seed/pages/index.json'));
  assert.ok(source.bodyHtml.includes('id="mobile-menu"'));
  assert.ok(source.bodyHtml.includes('id="menu-toggle"'));
  assert.ok(source.scripts.includes('site.js'));
  assert.ok(source.scripts.includes('mobile-v5.js'));
  assert.match(read('public/site.js'),/function initNav\(\)/);
  assert.match(read('public/site.js'),/btn\.addEventListener\('click'/);
  const pkg=JSON.parse(read('package.json'));
  assert.equal(pkg.version,'1.12.0');
  console.log('PASS V1.12: Firestore Timestamp and nested SDK values converted to plain Client props; existing menu scripts and markup retained');
}
run().catch(e=>{console.error(e);process.exit(1)});
