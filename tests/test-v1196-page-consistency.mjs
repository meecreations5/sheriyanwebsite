import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const pages=n=>JSON.parse(read('data/seed/pages/'+n+'.json'));
const styling=pages('styling-services'),bespoke=pages('bespoke'),appointment=pages('appointment'),contact=pages('contact');
const a=styled=>styled.bodyHtml;
const server=read('lib/final-feedback-v119.mjs');
const css=read('public/shaneryn-v1196-page-consistency.css');
const social=read('public/social-v66.js');
const publicScript=read('public/shaneryn-final-v119.js');

// Bespoke's original images/cards stay in the Bespoke Page Manager with their
// original editable CMS field IDs. This was unintentionally hidden in 1.19.0.
assert.equal((bespoke.bodyHtml.match(/class="v63-service-card"/g)||[]).length,3);
assert.equal((bespoke.bodyHtml.match(/class="v63-service-photo"/g)||[]).length,3);
assert.ok(server.includes("$('.v69-bespoke-shortcuts a[href=\"#services\"]').attr('href','#services')"));
assert.ok(!server.includes("$('#services').remove()"));
for(const image of ['Shaneryn6838.webp','Shaneryn6594.webp','Shaneryn6713.webp']){
 assert.ok(bespoke.bodyHtml.includes(image)&&fs.existsSync(path.join(root,'public/assets/brand',image)));
}
// Different but intentional page structures: Bespoke photo cards vs Styling
// Services rectangular buttons, with descriptions and booking preserved.
assert.equal((styling.bodyHtml.match(/class="v119-service-option"/g)||[]).length,3);
assert.equal((styling.bodyHtml.match(/class="v119-service-editorial"/g)||[]).length,3);
assert.ok(!styling.bodyHtml.includes('data-v119-service="Bespoke"'));
assert.ok(!styling.bodyHtml.includes('v1194-service-grid'));
assert.ok(styling.bodyHtml.includes('id="book-appointment"'));
assert.ok(publicScript.includes('setService(button.dataset.v119Service)'));
assert.ok(server.includes("pageSeed('styling-services').bodyHtml"),'older published CMS pages restore the original selector layout');
assert.ok(server.includes("live.html(original.html())"),'do not duplicate cards');
assert.ok(css.includes('grid-template-columns:repeat(3,minmax(0,1fr))'));
// Contact-like appointment left image + right request, with all original
// appointment fields and CMS image field intact.
assert.ok(appointment.bodyHtml.includes('class="v119-page-intro"'));
assert.ok(appointment.bodyHtml.includes('id="book-appointment"'));
assert.ok(appointment.bodyHtml.includes('id="v67-appointment-form"'));
assert.ok(appointment.fields.some(f=>f.id==='f1195-appointment-image'));
assert.ok(css.includes('grid-template-columns:minmax(0,46%) minmax(0,54%)'));
assert.ok(css.includes('.v1195-appointment-image img'));
assert.ok(css.includes('body[data-page="appointment"] #book-appointment .v67-appointment-form'));
assert.ok(css.includes('body[data-page="appointment"] main.v119-standalone{display:block!important'));
assert.ok(contact.bodyHtml.includes('id="ep-contact-form"'));
assert.ok(contact.bodyHtml.includes('id="v67-contact-social"'));
// Unified social icon set; don't add separate text link to the Contact page.
assert.ok(social.includes("platforms=['whatsapp','instagram','facebook','youtube','linkedin']"));
assert.ok(social.includes('https://wa.me/'));
assert.ok(social.includes("document.getElementById('v67-contact-social')"));
assert.ok(social.includes("querySelector('.site-footer .footer-masthead')"));
assert.ok(server.includes("$('.v119-whatsapp,.v119-whatsapp-contact').remove()"));
assert.ok(!server.includes('append(`<a class="v119-whatsapp"'));
assert.ok(!server.includes('append(`<a class="v119-whatsapp-contact"'));
assert.ok(css.includes('body[data-page="contact-page"] .v67-contact-social .v66-social-icon'));
// No disruption to forms, private customer reference uploads or CMS login.
assert.ok(read('components/LegacyPage.jsx').includes('shaneryn-v1196-page-consistency.css'));
assert.ok(read('components/LegacyScripts.jsx').includes('shaneryn-feedback-v1195.js'));
assert.ok(read('app/api/requests/route.js').includes('referenceImage'));
assert.ok(read('lib/cms-admin-server.js').includes('cms_users'));
console.log('PASS V1.19.6: Bespoke 3 photo cards, Styling 3 boxes, Contact-like appointment, matching 5-icon socials, CMS and form safeguards.');
