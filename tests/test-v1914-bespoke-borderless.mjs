import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const css=read('public/shaneryn-v1914-bespoke-borderless.css');
const page=read('components/LegacyPage.jsx');
const seed=JSON.parse(read('data/seed/pages/bespoke.json'));

// The page must load the override after the CMS's other stylesheet links.
const cssLink='{slug===\'bespoke\'&&<link rel="stylesheet" href="/shaneryn-v1914-bespoke-borderless.css"/>}';
assert.ok(page.includes(cssLink),'Bespoke route links scoped override');
assert.ok(page.indexOf('href="/cms-bridges.css"') < page.indexOf(cssLink),'Override loads after CMS styles');
assert.ok(!page.includes('slug===\'index\'&&<link rel="stylesheet" href="/shaneryn-v1914-bespoke-borderless.css"/>}'), 'Homepage unaffected');

// The CSS is limited to the two actual editorial photographs. The seal, Past Work,
// service cards, and section layout remain untouched.
const selector='.shaneryn-public-site[data-cms-page="bespoke"] .v63-bespoke-intro .bespoke-visual > img';
assert.ok(css.includes(selector+':not(.bespoke-inset)'),'Main photograph targeted');
assert.ok(css.includes(selector+'.bespoke-inset'),'Inset photograph targeted');
for(const declaration of ['border: 0 !important','outline: 0 !important','box-shadow: none !important']) {
  assert.ok(css.includes(declaration),declaration);
}
const rulesOnly=css.replace(/\/\*[\s\S]*?\*\//g,'');
assert.ok(!/\.v63-work-item|\.v63-service-card|display:|grid-template|(?:^|[;\s])order:|position:/.test(rulesOnly), 'No unrelated image, layout, or section-order overrides');
assert.ok(page.includes('data-cms-page={slug}'), 'Server-rendered page wrapper matches selector without waiting for hydration');
assert.ok(seed.bodyHtml.includes('class="bespoke bespoke-v4 bespoke-v57 v63-bespoke-intro"'),'Bespoke introduction exists');
assert.equal((seed.bodyHtml.match(/class="bespoke-inset"/g)||[]).length,1,'Exactly one inset photo');
assert.ok(seed.bodyHtml.indexOf('id="bespoke-introduction"')<seed.bodyHtml.indexOf('id="services"'),'Existing section sequence preserved');
assert.ok(seed.bodyHtml.indexOf('id="services"')<seed.bodyHtml.indexOf('id="past-work"'),'Gallery remains after services');
console.log('PASS V1.18.14: Bespoke editorial borders removed only; existing section sequence and other images unchanged');
