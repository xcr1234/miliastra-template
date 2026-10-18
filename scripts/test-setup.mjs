import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { setupProject } from '../tools/setup-project.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'miliastra-setup-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, '.codex'));
  const template = await readFile(new URL('../.codex/config.template.toml', import.meta.url), 'utf8');
  await writeFile(join(root, '.codex/config.template.toml'), template);
  return root;
}

test('setup rewrites MCP paths for each clone without a default proxy or target', async t => {
  const root = await fixture(t);
  await setupProject(root);
  const config = await readFile(join(root, '.codex/config.toml'), 'utf8');
  assert.ok(config.includes(root.replaceAll('\\', '/')));
  assert.ok(!config.includes('__PROJECT_ROOT__'));
  assert.ok(!config.includes('click-paimon'));
  assert.ok(!config.includes('HTTP_PROXY'));
  await assert.rejects(readFile(join(root, 'lua.deploy.local.json')), { code: 'ENOENT' });
});

test('local proxy survives setup reruns; target setup does not copy files', async t => {
  const root = await fixture(t);
  const target = join(root, 'external folder', 'script.lua');
  await setupProject(root, { proxy: 'http://127.0.0.1:7897', targetFile: target });
  await setupProject(root);
  const config = await readFile(join(root, '.codex/config.toml'), 'utf8');
  assert.equal((config.match(/HTTP_PROXY/g) || []).length, 2);
  assert.equal(JSON.parse(await readFile(join(root, 'lua.deploy.local.json'), 'utf8')).targetFile, target);
  await assert.rejects(readFile(target), { code: 'ENOENT' });
  await setupProject(root, { proxy: '' });
  assert.ok(!(await readFile(join(root, '.codex/config.toml'), 'utf8')).includes('HTTP_PROXY'));
});
