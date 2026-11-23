import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const css=fs.readFileSync(path.join(root,'public/homepage-final-v52.css'),'utf8');
const cardSelector='body[data-page="home"] .occasion-reference .occasion-ref-card>img';
// Homepage collection cards should respect uploaded photo ratios, without adding letterbox bands.
const exactRules=[...css.matchAll(/body\[data-page="home"\] \.occasion-reference \.occasion-ref-card>img\s*\{([^}]*)\}/g)].map(match=>match[1]).filter(rule=>/height:|aspect-ratio:/.test(rule));
assert.ok(exactRules.length>=3,'Expect base, mobile and two-column image size rules');
for(const rule of exactRules){
  assert.match(rule,/aspect-ratio:\s*auto\s*!important/,'Never force 2:3 in homepage cards');
  assert.doesNotMatch(rule,/aspect-ratio:\s*2\s*\/\s*3/);
  assert.match(rule,/height:\s*auto\s*!important/);
  assert.match(rule,/object-fit:\s*contain\s*!important/);
}
assert.match(css,/background:\s*transparent\s*!important/);
const template=fs.readFileSync(path.join(root,'lib/render-page.js'),'utf8');
assert.match(template,/occasion-ref-card.*?safeImage\(p\.catalogueImg\)\|\|safeImage\(p\.img\)/s);
console.log('PASS V1.18.5: homepage product images use natural ratio, with no 2:3 letterbox strips or crop');
