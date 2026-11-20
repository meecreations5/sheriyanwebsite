const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
(async()=>{
 const site=read('components/LegacyScripts.jsx');
 const admin=read('components/admin/CmsApp.jsx');
 const api=read('lib/cms-client-api.js');
 const renderer=read('lib/render-page.js');
 const rules=read('firestore.rules');
 const storage=read('storage.rules');
 assert.match(site,/heroDesktop=page\.heroImages\?\.desktop/);
 assert.match(site,/heroMobile=page\.heroImages\?\.mobile/);
 assert.match(admin,/Desktop Banner \(wide\)/);
 assert.match(admin,/Mobile Banner \(portrait\)/);
 assert.match(admin,/Products & Looks/);
 assert.match(admin,/Garment Category/);
 assert.match(admin,/Gallery & Video/);
 assert.match(admin,/More Options/);
 assert.match(admin,/YouTube Link/);
 assert.match(admin,/Upload Video/);
 assert.match(admin,/createUserWithEmailAndPassword\(secondaryAuth,email,form\.password\)/);
 assert.match(admin,/setPersistence\(secondaryAuth,inMemoryPersistence\)/);
 assert.match(admin,/Create Staff Account/);
 assert.doesNotMatch(admin,/Copy from Firebase Authentication|Firebase User UID/);
 assert.match(api,/heroImages:\{desktop:/);
 assert.match(api,/filmMedia:\{url:safeVideo/);
 assert.match(api,/video:safeVideo\(p\.video\)/);
 assert.match(renderer,/function patchFilmMedia/);
 assert.match(rules,/match \/cms_users\/\{uid\}/);
 assert.match(rules,/allow create: if superAdmin\(\)/);
 assert.match(storage,/video\/\(mp4\|webm\)/);
 const vidCode=read('lib/video-url.js');
 const moduleURL='data:text/javascript;base64,'+Buffer.from(vidCode).toString('base64');
 const {getYoutubeVideoId,youtubeEmbedUrl,isVideoFile}=await import(moduleURL);
 const ID='ABCDEFGHIjk';
 for (const u of [
  'https://www.youtube.com/watch?v='+ID,
  'https://youtu.be/'+ID,
  'https://www.youtube.com/shorts/'+ID,
  'https://www.youtube-nocookie.com/embed/'+ID,
 ]) assert.equal(getYoutubeVideoId(u),ID);
 assert.equal(getYoutubeVideoId('https://attacker.example/watch?v='+ID),'');
 assert.equal(youtubeEmbedUrl('https://youtu.be/'+ID),'https://www.youtube-nocookie.com/embed/'+ID+'?rel=0');
 assert.equal(isVideoFile('https://firebasestorage.googleapis.com/v0/b/x/o/media%2Fclip.mp4?alt=media&token=foo'),true);
 assert.equal(isVideoFile('https://evil.example/fake.mp4.js'),false);
 console.log('PASS V1.5: responsive banner wiring, product tabs, video URL handling, staff creation, security boundaries');
})().catch(err=>{console.error(err.stack||err);process.exitCode=1});
