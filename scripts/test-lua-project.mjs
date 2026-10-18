import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { buildProject, deployProject } from '../tools/lua-project.mjs';

async function fixture(t) {
  const base = await mkdtemp(join(tmpdir(), 'miliastra-deploy-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = join(base, 'project with spaces');
  const target = join(base, '游戏脚本', 'main.lua');
  await mkdir(join(root, 'src'), { recursive: true });
  await writeFile(join(root, 'src/main.lua'), 'function OnStart() end');
  await writeFile(join(root, 'lua.project.json'), JSON.stringify({ lua: { root: 'src', entry: 'main', out: 'dist/main.lua' } }));
  await writeFile(join(root, 'lua.deploy.local.json'), JSON.stringify({ targetFile: target }));
  return { root, target, base };
}

test('build stays inside the project and does not deploy', async t => {
  const { root, target } = await fixture(t);
  const result = await buildProject(root);
  assert.equal(result.output, resolve(root, 'dist/main.lua'));
  await assert.rejects(readFile(target), { code: 'ENOENT' });
});

test('dry-run builds but writes neither target nor deployment state', async t => {
  const { root, target } = await fixture(t);
  const result = await deployProject(root, { dryRun: true });
  assert.equal(result.action, 'create');
  assert.equal(result.target, target);
  await assert.rejects(readFile(target), { code: 'ENOENT' });
  await assert.rejects(readFile(join(root, '.lua-deploy-state.json')), { code: 'ENOENT' });
});

test('deploys byte-identical Lua only and backs up a previous deployed version', async t => {
  const { root, target } = await fixture(t);
  await deployProject(root);
  const first = await readFile(target, 'utf8');
  await writeFile(join(root, 'src/main.lua'), 'function OnStart() print("v2") end');
  const result = await deployProject(root);
  assert.equal(result.action, 'replace');
  assert.equal(await readFile(result.backup, 'utf8'), first);
  assert.equal(await readFile(target, 'utf8'), await readFile(join(root, 'dist/main.lua'), 'utf8'));
  assert.deepEqual(await readdir(join(target, '..')), ['main.lua']);
});

test('identical deployment is a no-op; externally modified content needs an explicit overwrite', async t => {
  const { root, target } = await fixture(t);
  await deployProject(root);
  assert.equal((await deployProject(root)).action, 'unchanged');
  await writeFile(target, '-- edited in the game folder');
  assert.equal((await deployProject(root, { dryRun: true })).conflict, true);
  await assert.rejects(deployProject(root), /externally modified/);
  assert.equal(await readFile(target, 'utf8'), '-- edited in the game folder');
  const result = await deployProject(root, { overwrite: true });
  assert.equal(await readFile(result.backup, 'utf8'), '-- edited in the game folder');
});

test('first deployment protects an existing target', async t => {
  const { root, target } = await fixture(t);
  await mkdir(join(target, '..'), { recursive: true });
  await writeFile(target, '-- previous script');
  await assert.rejects(deployProject(root), /existing/);
  const result = await deployProject(root, { overwrite: true });
  assert.equal(await readFile(result.backup, 'utf8'), '-- previous script');
});

test('failed rebuild cannot publish a stale artifact', async t => {
  const { root, target } = await fixture(t);
  await deployProject(root);
  const original = await readFile(target, 'utf8');
  await writeFile(join(root, 'src/main.lua'), 'local broken =');
  await assert.rejects(deployProject(root), /main.lua/);
  assert.equal(await readFile(target, 'utf8'), original);
});

test('build rejects output outside the project; deployment requires an exact absolute Lua path', async t => {
  const { root } = await fixture(t);
  await writeFile(join(root, 'lua.deploy.local.json'), '{"targetFile":"relative/main.lua"}');
  await assert.rejects(deployProject(root), /absolute path/);
  await writeFile(join(root, 'lua.project.json'), JSON.stringify({ lua: { root: 'src', out: '../outside.lua' } }));
  await assert.rejects(buildProject(root), /stay in this project/);
});
