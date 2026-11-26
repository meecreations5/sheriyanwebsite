import assert from 'node:assert/strict';
import fs from 'node:fs';
const story=JSON.parse(fs.readFileSync('data/seed/pages/story.json','utf8'));
const html=story.bodyHtml;
const fields=story.fields;
const css=fs.readFileSync('public/shaneryn-my-story-v1192.css','utf8');
const component=fs.readFileSync('components/LegacyPage.jsx','utf8');
const copy=[
"My Story",
"It began as a childhood fascination, a little girl enchanted by beautiful clothes, as if each one belonged in a fairytale. That wonder never left me. It grew into my life's passion.",
"For over 18 years, I have lived and breathed design as a fashion and costume designer and image consultant. I've had the privilege of creating looks for more than 30 Bollywood films and over 500 fiction and non-fiction mini-series, and of styling well-known faces from the film industry and the corporate world.",
"Costume design taught me that clothes tell stories. Every character I dressed began with a concept, a storyboard and a feeling, then came alive through fabric, embroidery, hair, make-up and jewellery. Working side by side with pattern masters and tailors, I learned every step of how a garment is made, from the first sketch to the final stitch. Embroidery and embellishment became my signature language.",
"As an image consultant, I discovered something even more meaningful: helping women understand, embrace and enhance who they are. I've guided people to dress for their shape, their personality and the life they lead, so they can present their best selves to the world.",
"Yet through all those years, one thing was missing from my own wardrobe. Every time I dressed for a celebration, I found pieces that looked beautiful but held me back, with fabrics that wouldn't let me breathe or move freely.",
"So in 2025, I followed a new dream and created House of Shaneryn.",
"From our studio in Santacruz, Mumbai, I bring together everything I've learned: the storytelling of cinema, the precision of craft, and the understanding of a woman's body that only years of image consulting can give. Each piece is made to your measure, with couture detail and comfort at its heart, so you can stop managing your outfit and start living the moment.",
"We don't dress women for events. We dress them for the moments they'll tell stories about.",
"My dream is to take this vision to the world, one celebration at a time.",
"Comfort is Couture.","Yours,","Shivani Cherian","Founder & Designer, House of Shaneryn"];
const newFields=fields.filter(x=>/f004\d\d/.test(x.id)).sort((a,b)=>a.id.localeCompare(b.id));
assert.equal(newFields.length,copy.length);
assert.equal(new Set(newFields.map(x=>x.id)).size,copy.length);
assert.deepEqual(newFields.map(x=>x.value),copy);
for(const f of newFields){
  assert.equal(f.kind,'text');assert.equal(f.section,'s-000');
  assert.equal(html.split(`<!--cms:${f.id}-->`).length-1,1);
  assert.equal(html.split(`<!--/cms:${f.id}-->`).length-1,1);
  assert.match(html,new RegExp(`data-cms-text-refs="${f.id}"`));
}
assert.match(html,/class="founder-letter shaneryn-my-story"/);
assert.match(html,/id="shaneryn-my-story-heading"/);
assert.doesNotMatch(html,/I CREATED THE CURVE EDIT BECAUSE/);
assert.doesNotMatch(html,/LOTSA LOVE/);
assert.match(html,/id="vision-mission"/);
assert.match(html,/id="words-impressions"/);
assert.match(html,/id="founder"/);
assert.match(html,/founder-photo-full/);
assert.match(html,/founder-links/);
assert.equal(story.sections[0].title,'My Story / Designer');
assert.match(component,/slug==='story'&&<link rel="stylesheet" href="\/shaneryn-my-story-v1192.css"\/>/);
assert.match(css,/body\[data-page="story-page"\]/);
assert.match(css,/font-size:14\.5px!important/);
assert.match(css,/letter-spacing:\.005em!important/);
console.log('V1.19.2 My Story full-copy, CMS, preserved-sections and mobile typography checks passed.');
