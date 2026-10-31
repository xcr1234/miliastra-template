import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, unlink, writeFile } from 'node:fs/promises';
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

test('build automatically deploys the same artifact after a target is configured', async t => {
  const { root, target } = await fixture(t);
  const gia = join(root, 'bootstrap.gia');
  const originalGia = Buffer.from('existing bootstrap export');
  await writeFile(gia, originalGia);
  const result = await buildProject(root);
  assert.equal(result.output, resolve(root, 'dist/main.lua'));
  assert.equal(await readFile(target, 'utf8'), result.code);
  assert.equal(result.deployment.target, target);
  await writeFile(join(root, 'src/main.lua'), 'function OnStart() print("Lua-only update") end');
  const next = await buildProject(root);
  assert.equal(await readFile(target, 'utf8'), next.code);
  assert.deepEqual(await readFile(gia), originalGia);
});

test('unconfigured builds and explicit local-only builds keep artifacts inside the project', async t => {
  const { root, target } = await fixture(t);
  const local = await buildProject(root, { localOnly: true });
  assert.equal(local.deployment, undefined);
  await assert.rejects(readFile(target), { code: 'ENOENT' });
  await unlink(join(root, 'lua.deploy.local.json'));
  const unconfigured = await buildProject(root);
  assert.equal(unconfigured.deployment, undefined);
  await assert.rejects(readFile(target), { code: 'ENOENT' });
});

test('imported blank Lua needs explicit consent before initialization and is backed up', async t => {
  const { root, target } = await fixture(t);
  await mkdir(join(target, '..'), { recursive: true });
  for (const blank of ['', '\uFEFF \r\n\t']) {
    await writeFile(target, blank, 'utf8');
    const plan = await deployProject(root, { dryRun: true });
    assert.equal(plan.identityStatus, 'missing');
    assert.equal(plan.conflict, true);
    assert.equal(plan.requiresConfirmation, true);
    await assert.rejects(deployProject(root), /project identity/);
    assert.equal(await readFile(target, 'utf8'), blank);
    const result = await deployProject(root, { overwrite: true });
    assert.equal(result.requiresConfirmation, false);
    assert.equal(await readFile(result.backup, 'utf8'), blank);
    assert.equal(await readFile(target, 'utf8'), await readFile(join(root, 'dist/main.lua'), 'utf8'));
  }
});

const headerIdentity = code => JSON.parse(code.split('\n')[0].replace(/^-- miliastra-project: /, ''));

test('project UUID persists across rebuilds and renames; separate template copies have distinct IDs', async t => {
  const first = await fixture(t);
  const second = await fixture(t);
  const original = await buildProject(first.root);
  const identity = headerIdentity(original.code);
  assert.match(identity.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(identity.name, 'project with spaces');
  assert.equal((await readFile(join(first.root, '.lua-project-id'), 'utf8')).trim(), identity.id);
  const config = JSON.parse(await readFile(join(first.root, 'lua.project.json'), 'utf8'));
  config.name = '新游戏名称';
  await writeFile(join(first.root, 'lua.project.json'), JSON.stringify(config));
  const renamed = await buildProject(first.root);
  assert.deepEqual(headerIdentity(renamed.code), { id: identity.id, name: '新游戏名称' });
  const other = await buildProject(second.root, { localOnly: true });
  assert.notEqual(headerIdentity(other.code).id, identity.id);
});

test('another project UUID cannot be replaced even when a stored hash matches the target', async t => {
  const { root, target } = await fixture(t);
  const other = await fixture(t);
  await deployProject(root);
  const own = headerIdentity(await readFile(target, 'utf8'));
  const foreign = await buildProject(other.root, { localOnly: true });
  await writeFile(target, foreign.code);
  const statePath = join(root, '.lua-deploy-state.json');
  const state = JSON.parse(await readFile(statePath, 'utf8'));
  const key = process.platform === 'win32' ? target.toLowerCase() : target;
  state[key].sha256 = createHash('sha256').update(foreign.code).digest('hex');
  await writeFile(statePath, JSON.stringify(state));
  const plan = await deployProject(root, { dryRun: true });
  assert.equal(plan.identityStatus, 'mismatch');
  assert.equal(plan.project.id, own.id);
  assert.equal(plan.targetProject.id, headerIdentity(foreign.code).id);
  assert.equal(plan.conflict, true);
  await assert.rejects(buildProject(root), /project identity/);
  assert.equal(await readFile(target, 'utf8'), foreign.code);
  const approved = await deployProject(root, { overwrite: true });
  assert.equal(await readFile(approved.backup, 'utf8'), foreign.code);
  assert.equal(headerIdentity(await readFile(target, 'utf8')).id, own.id);
});

test('missing, malformed and body-only project markers require consent', async t => {
  const { root, target } = await fixture(t);
  const own = await buildProject(root, { localOnly: true });
  await mkdir(join(target, '..'), { recursive: true });
  for (const content of [
    '-- legacy Lua\nfunction OnStart() end',
    '-- miliastra-project: broken JSON\n',
    '-- miliastra-project: {"id":"not-a-uuid","name":"game"}\n',
    `-- unrelated first line\n${own.code}`,
  ]) {
    await writeFile(target, content);
    await assert.rejects(deployProject(root), /project identity/);
    assert.equal(await readFile(target, 'utf8'), content);
  }
});

test('matching project identity still protects external edits', async t => {
  const { root, target } = await fixture(t);
  await deployProject(root);
  const edited = `${await readFile(target, 'utf8')}\n-- user change\n`;
  await writeFile(target, edited);
  const plan = await deployProject(root, { dryRun: true });
  assert.equal(plan.identityStatus, 'match');
  assert.equal(plan.conflict, true);
  await assert.rejects(buildProject(root), /externally modified/);
  assert.equal(await readFile(target, 'utf8'), edited);
});

test('a damaged local project UUID fails without regenerating it or touching the target', async t => {
  const { root, target } = await fixture(t);
  await deployProject(root);
  const original = await readFile(target, 'utf8');
  await writeFile(join(root, '.lua-project-id'), 'damaged-id\n');
  await assert.rejects(buildProject(root), /Invalid project UUID/);
  assert.equal(await readFile(join(root, '.lua-project-id'), 'utf8'), 'damaged-id\n');
  assert.equal(await readFile(target, 'utf8'), original);
});

test('automatic deployment errors fail the build and protect externally edited target code', async t => {
  const { root, target } = await fixture(t);
  await deployProject(root);
  await writeFile(target, 'function OnStart() print("external edit") end');
  await assert.rejects(buildProject(root), /externally modified/);
  assert.match(await readFile(target, 'utf8'), /external edit/);
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
  t.mock.timers.enable({ apis: ['Date'], now: 1792569600000 });
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

test('project startupLog setting defaults on and can be disabled', async t => {
  const { root } = await fixture(t);
  const enabled = await buildProject(root);
  assert.ok(enabled.code.includes('[miliastra] Initialization started (OnStart)'));
  const projectPath = join(root, 'lua.project.json');
  const project = JSON.parse(await readFile(projectPath, 'utf8'));
  project.lua.startupLog = false;
  await writeFile(projectPath, JSON.stringify(project));
  const disabled = await buildProject(root);
  assert.ok(!disabled.code.includes('[miliastra] Initialization started (OnStart)'));
  assert.ok(disabled.code.includes('-- Build date (local):'));
  project.lua.startupLog = 'false';
  await writeFile(projectPath, JSON.stringify(project));
  await assert.rejects(buildProject(root), /startupLog must be a boolean/);
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
