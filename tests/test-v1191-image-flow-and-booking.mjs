import assert from 'node:assert/strict';
import fs from 'node:fs';
const css=fs.readFileSync('public/shaneryn-final-v119.css','utf8');
const logic=fs.readFileSync('lib/final-feedback-v119.mjs','utf8');
const appointment=JSON.parse(fs.readFileSync('data/seed/pages/appointment.json','utf8'));
const styling=JSON.parse(fs.readFileSync('data/seed/pages/styling-services.json','utf8'));
const js=fs.readFileSync('public/signature-v51.js','utf8');
const readRule=(selector)=>{
  const escaped=selector.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const matches=[...css.matchAll(new RegExp(escaped+'(?:\\s*,[^{}]+)?\\s*\\{([^}]*)\\}','g'))];
  assert(matches.length,`Missing exact CSS rule: ${selector}`);
  return matches.at(-1)[1];
};
const naturalImageRules=[
 'body[data-page="collections"] .look-card>.look-image-btn img',
 'body[data-page="collection-edit"] .ep-card>a:first-child img',
 'body[data-page="look"] .ld-media-tile.v119-primary-tile:not(.ld-film-tile) img'
];
// The final matching rule (near the end of the stylesheet) takes precedence
// over V1.19.0 fixed 3:4 / 1:1 card frames.
for(const selector of naturalImageRules){
  const rule=readRule(selector);
  assert.match(rule,/height:auto\s*!important/);
  assert.match(rule,/aspect-ratio:auto\s*!important/);
  assert.match(rule,/object-fit:contain\s*!important/);
}
const frame=readRule('body[data-page="collections"] .look-card>.look-image-btn');
assert.match(frame,/background:transparent\s*!important/);
assert.match(frame,/aspect-ratio:auto\s*!important/);
const quick=readRule('body[data-page="collections"] .look-card .v51-quick-btn');
assert.match(quick,/position:relative\s*!important/);
assert.match(quick,/top:auto\s*!important/);
assert.match(quick,/background:transparent\s*!important/);
assert.match(js,/function initQuickPreview\(/);
assert.match(css, /look-card>\.look-image-btn::after/);
assert.match(css, /\.v67-appointment-form\{[\s\S]*?display:block/);
assert.match(logic,/formSection\.removeAttr\('hidden'\)\.removeAttr\('aria-hidden'\)/);
assert.match(logic,/page\.slug==='appointment'\|\|page\.slug==='styling-services'/);
assert.match(logic,/book\.removeAttr\('hidden'\)\.removeAttr\('aria-hidden'\)/);
assert.match(appointment.bodyHtml,/id="book-appointment"/);
assert.match(styling.bodyHtml,/id="book-appointment"/);
assert.match(appointment.bodyHtml,/id="v67-appointment-form"/);
assert.match(styling.bodyHtml,/id="v67-appointment-form"/);
assert.match(logic,/visible!==false/);
console.log('PASS V1.19.1: naturally sized images, unobstructed Quick Look and visible standalone appointment forms');
