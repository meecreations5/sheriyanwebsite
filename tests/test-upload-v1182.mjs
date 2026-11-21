import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBrowserUploadUrl} from '../lib/cms-upload-url.mjs';

const base = {origin:'http://localhost:3000',contentType:'image/png'};
let attemptedResumable = false;
const signed = await createBrowserUploadUrl({
  async getSignedUrl(opts) {
    assert.equal(opts.version,'v4');
    assert.equal(opts.contentType,'image/png');
    return ['https://example.invalid/signed'];
  },
  async createResumableUpload() {attemptedResumable=true;throw Error('unexpected fallback');}
},base);
assert.equal(signed.mode,'signed-url');
assert.equal(attemptedResumable,false);

const originalWarn = console.warn;
console.warn = () => {};
try {
  const resumed = await createBrowserUploadUrl({
    async getSignedUrl() {throw Error('Cannot sign data without client_email');},
    async createResumableUpload(opts) {
      assert.equal(opts.origin,'http://localhost:3000');
      assert.equal(opts.metadata.contentType,'image/png');
      assert.equal(opts.preconditionOpts.ifGenerationMatch,0);
      return ['https://example.invalid/resumable'];
    }
  },base);
  assert.equal(resumed.mode,'resumable');
  assert.equal(resumed.url,'https://example.invalid/resumable');
  await assert.rejects(createBrowserUploadUrl({
    async getSignedUrl() {throw Error('cannot sign');},
    async createResumableUpload() {throw Error('Storage access denied');}
  },base),/Storage access denied/);
} finally {console.warn=originalWarn;}

const server = fs.readFileSync(new URL('../app/api/admin/media/sign/route.js',import.meta.url),'utf8');
assert.match(server,/authorizeMedia\(request\)/);
assert.match(server,/assertOrigin\(request\)/);
assert.match(server,/cms_pending_uploads/);
assert.match(server,/40\*60\*1000/);
assert.match(server,/safeUploadError/);
const client = fs.readFileSync(new URL('../components/admin/CmsApp.jsx',import.meta.url),'utf8');
assert.match(client,/mediaRequest\('sign'/);
assert.match(client,/mediaRequest\('complete'/);
console.log('PASS V1.18.2: signed and resumable URL preparation, auth, and completion workflow');
