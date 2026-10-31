import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import test from 'node:test';
import { createWebServer } from 'beyond-simulator-web';

test('combined GIA keeps an empty Lua mapping and mount without embedding the disk bundle', { timeout: 15000 }, async t => {
  const root = await mkdtemp(join(tmpdir(), 'miliastra-bootstrap-gia-'));
  const web = await createWebServer({ workspace: root, host: '127.0.0.1', port: 0, password: '', open: false });
  t.after(async () => {
    await web.close();
    await rm(root, { recursive: true, force: true });
  });
  async function call(action, args = {}, sessionId = 'export-fixture') {
    // Exercise the real HTTP handler in-process, without sandbox-dependent socket connects.
    const request = Readable.from([Buffer.from(JSON.stringify({ sessionId, ...args }))]);
    request.method = 'POST';
    request.url = `/editor/api/${action}`;
    request.headers = { 'content-type': 'application/json', host: '127.0.0.1' };
    const envelope = await new Promise((accept, reject) => {
      const response = {
        setHeader() {}, writeHead() {},
        end(bytes) {
          try { accept(JSON.parse(String(bytes))); } catch (error) { reject(error); }
        },
      };
      Promise.resolve(web.server.listeners('request')[0](request, response)).catch(reject);
    });
    assert.equal(envelope.ok, true, envelope.error);
    return envelope.value;
  }
  const initial = await call('export', { format: 'save' });
  const save = JSON.parse(Buffer.from(initial.data, 'base64').toString('utf8'));
  const target = save.assets.client.root.children[0];
  assert.ok(target && target.kind !== 'server-container');
  const guid = 1234567;
  target.scriptMappingIds = [guid];
  save.assets.scripts = [{
    id: String(guid), guid, path: 'dist/main.lua', source: '',
    controlId: target.id, controlAsset: 'client-control-template',
  }];
  await mkdir(join(root, 'dist'));
  await writeFile(join(root, 'dist/main.lua'), 'function OnStart() print("NEVER_EMBED_RUNTIME") end');
  await call('import', {
    format: 'json', filename: 'fixture.save.json',
    data: Buffer.from(JSON.stringify(save)).toString('base64'),
  });
  const gia = await call('export', { format: 'gia-combined' });
  assert.ok(gia.filename.endsWith('.gia'));
  assert.equal(Buffer.from(gia.data, 'base64').includes(Buffer.from('NEVER_EMBED_RUNTIME')), false);
  await call('import', { format: 'gia', data: gia.data, filename: gia.filename }, 'import-fixture');
  const roundTrip = await call('export', { format: 'save' }, 'import-fixture');
  const imported = JSON.parse(Buffer.from(roundTrip.data, 'base64').toString('utf8'));
  assert.equal(imported.assets.scripts.length, 1);
  const script = imported.assets.scripts[0];
  assert.equal(script.path, 'dist/main.lua');
  assert.equal(script.source, '');
  assert.equal(script.controlAsset, 'client-control-template');
  assert.ok(script.controlId);
});
