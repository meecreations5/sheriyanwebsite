import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const js=read('public/shaneryn-mobile-v1203.js'),css=read('public/shaneryn-mobile-v1203.css'),type=read('public/shaneryn-typography-v1205.css'),media=read('public/shaneryn-final-v119.css');
assert.match(js,/scroll\.append\(footer\)/);assert.match(js,/main\.append\(dock\)/);assert.match(js,/dock\.hidden=!hide\|\|blocked/);assert.match(js,/footerMarker\.replaceWith\(footer\)/);assert.match(js,/dockMarker\.replaceWith\(dock\)/);assert.match(css,/\.v5-tabbar\[hidden\]\{display:none!important\}/);assert.match(css,/\.sh1203-look-ready \.site-footer\{display:block!important/);
assert.match(type,/\.ld-interlude-kicker,\.closure-v59-eyebrow,\.closure-v62-kicker,\.v119-final-quote \.v119-quote-inner>span/);assert.match(type,/font-weight:400!important;font-size:14px!important;line-height:1.5!important/);assert.match(type,/\.v64-stitch-label\)\{font-size:12px!important\}/);
assert.match(media,/\.ld-film-tile video \{object-fit:cover!important;object-position:center!important;\}/);assert.doesNotMatch(media,/\.ld-film-tile :is\(video,iframe\)\{[^}]*object-fit:contain/);
assert.match(read('components/LegacyPage.jsx'),/shaneryn-mobile-v1203.css\?v=1207/);
console.log('PASS V1.20.7 labels, video sizing, contextual navigation, footer restoration and cache version');
