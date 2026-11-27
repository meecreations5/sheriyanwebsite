// V1.19.4 photo-card regression, updated to the client's V1.19.6 approval:
// original photo cards on Bespoke, original selection boxes on Styling Services.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const styled=JSON.parse(read('data/seed/pages/styling-services.json'));
const bespoke=JSON.parse(read('data/seed/pages/bespoke.json'));
const photos=['Shaneryn6838.webp','Shaneryn6594.webp','Shaneryn6713.webp'];
const names=['Color Analysis','Personal Styling','Occasion Styling'];
assert.equal(styled.slug,'styling-services');
assert.equal((styled.bodyHtml.match(/class="v119-service-option"/g)||[]).length,3,'only three rectangular styling choices');
assert.equal((styled.bodyHtml.match(/class="v119-service-editorial"/g)||[]).length,3,'each choice retains service description');
assert.ok(!styled.bodyHtml.includes('data-v119-service="Bespoke"'),'Bespoke not a styling choice');
assert.ok(!styled.bodyHtml.includes('class="v1194-service-card"'),'Styling Services must not replace original boxes with photo cards');
assert.equal((bespoke.bodyHtml.match(/class="v63-service-card"/g)||[]).length,3,'Bespoke retains three image-led service cards');
assert.equal((bespoke.bodyHtml.match(/class="v63-service-photo"/g)||[]).length,3,'Bespoke cards have original image links');
for(let i=0;i<photos.length;i++){
 assert.ok(bespoke.bodyHtml.includes(photos[i]),'Bespoke original image '+photos[i]);
 assert.ok(fs.existsSync(path.join(root,'public/assets/brand',photos[i])),'Bespoke image asset exists');
 assert.ok(styled.bodyHtml.includes('data-v119-service="'+names[i]+'"'),'Styling choice '+names[i]);
}
for(const field of ['f119-styling-services-copy-03','f119-styling-services-copy-04','f119-styling-services-copy-05','f119-styling-services-copy-06','f119-styling-services-copy-07','f119-styling-services-copy-08']){
 assert.ok(styled.bodyHtml.includes('<!--cms:'+field+'-->'),'service text remains editable '+field);
}
const server=read('lib/final-feedback-v119.mjs');
assert.ok(!server.includes("$('#services').remove()"),'Bespoke photo-card section must not be removed');
assert.ok(server.includes('function finalStylingServiceSelection('),'previously published Styling Services pages must also be restored');
assert.ok(server.includes('finalStylingServiceSelection($,page);'),'rendered page uses styling restoration');
assert.ok(styled.bodyHtml.includes('id="book-appointment"'),'Styling appointment form remains');
console.log('PASS V1.19.4/V1.19.6: original photos on Bespoke; original three service selectors on Styling Services; CMS copy and appointment preserved.');
