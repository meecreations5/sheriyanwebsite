import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync('public/look-detail-v45.css', 'utf8');
const related = css.slice(css.indexOf('/* V1.18.8: Related-look'));
assert(related.length > 150, 'Related-look sizing override must be present');
assert.match(related, /\.ep-related-grid\{align-items:start;\}/);
assert.match(related, /\.ep-related-grid \.ep-card\{align-self:start;height:auto;min-height:0;\}/);
assert.match(related, /\.ep-related-grid \.ep-card>a:first-child\{[^}]*aspect-ratio:auto;[^}]*line-height:0;/);
assert.match(related, /\.ep-related-grid \.ep-card>a:first-child img\{[^}]*height:auto;[^}]*aspect-ratio:auto;[^}]*object-fit:contain;/);
assert.doesNotMatch(related, /object-fit:cover/);
console.log('PASS: related-look images retain natural ratio, align to top and have no forced blank frame');
