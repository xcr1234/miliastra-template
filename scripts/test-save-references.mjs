import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { checkSaveReferences, discoverSaves } from '../tools/check-save-references.mjs';

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'miliastra-save-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'dist'));
  await mkdir(join(root, 'tests'));
  await writeFile(join(root, 'lua.project.json'), JSON.stringify({ lua: { out: 'dist/main.lua' } }));
  await writeFile(join(root, 'dist/main.lua'), '-- first build\nreturn {}\n');
  const save = { format: 'qxqy-simulator-save', assets: { scripts: [{ path: 'dist/main.lua', source: '' }] } };
  const writeSave = value => writeFile(join(root, 'tests/game.save.json'), JSON.stringify(value));
  await writeSave(save);
  return { root, save, writeSave };
}

test('file-backed saves remain unchanged across bundle updates; blank template is valid', async t => {
  const { root } = await fixture(t);
  assert.deepEqual(await checkSaveReferences(root, []), { checked: 0, issues: [] });
  const before = await readFile(join(root, 'tests/game.save.json'), 'utf8');
  assert.equal((await checkSaveReferences(root, ['tests/game.save.json'])).issues.length, 0);
  await writeFile(join(root, 'dist/main.lua'), '-- new build date\nreturn {updated=true}\n');
  assert.equal((await checkSaveReferences(root, ['tests/game.save.json'])).issues.length, 0);
  assert.equal(await readFile(join(root, 'tests/game.save.json'), 'utf8'), before);
});

test('embedded edits are reported without rewriting them', async t => {
  const { root, save, writeSave } = await fixture(t);
  save.assets.scripts[0].source = '-- hand-edited code';
  await writeSave(save);
  const before = await readFile(join(root, 'tests/game.save.json'), 'utf8');
  const result = await checkSaveReferences(root, ['tests/game.save.json']);
  assert.match(result.issues.join('\n'), /embedded Lua.*merge valid edits/);
  assert.equal(await readFile(join(root, 'tests/game.save.json'), 'utf8'), before);
});

test('custom bundle paths follow lua.project.json and missing source is accepted', async t => {
  const { root, save, writeSave } = await fixture(t);
  await writeFile(join(root, 'lua.project.json'), JSON.stringify({ lua: { out: 'dist/custom.lua' } }));
  await writeFile(join(root, 'dist/custom.lua'), 'return {}');
  save.assets.scripts[0].path = 'dist/custom.lua';
  delete save.assets.scripts[0].source;
  await writeSave(save);
  assert.equal((await checkSaveReferences(root, ['tests/game.save.json'])).issues.length, 0);
});

test('wrong paths, missing or empty bundles, and malformed saves fail', async t => {
  const { root, save, writeSave } = await fixture(t);
  save.assets.scripts[0].path = 'src/main.lua';
  await writeSave(save);
  assert.match((await checkSaveReferences(root, ['tests/game.save.json'])).issues.join('\n'), /path must reference/);
  save.assets.scripts[0].path = 'dist/main.lua';
  delete save.assets.scripts[0].source;
  await writeSave(save);
  await writeFile(join(root, 'dist/main.lua'), '');
  assert.match((await checkSaveReferences(root, ['tests/game.save.json'])).issues.join('\n'), /empty Lua bundle/);
  await rm(join(root, 'dist/main.lua'));
  assert.match((await checkSaveReferences(root, ['tests/game.save.json'])).issues.join('\n'), /ENOENT/);
  await writeSave({ format: 'wrong' });
  assert.match((await checkSaveReferences(root, ['tests/game.save.json'])).issues.join('\n'), /Expected a qxqy-simulator-save/);
});

test('Git discovery covers tracked and new saves and excludes ignored exports', async t => {
  const { root } = await fixture(t);
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' });
  git(['init', '-q']);
  await writeFile(join(root, '.gitignore'), 'dist/\n');
  git(['add', '--', 'tests/game.save.json']);
  await writeFile(join(root, 'new.save.json'), '{}');
  await writeFile(join(root, 'dist/portable.save.json'), '{}');
  assert.deepEqual(discoverSaves(root), ['new.save.json', 'tests/game.save.json']);
});

test('CLI exits successfully for references and fails for embedded code without rewriting it', async t => {
  const { root, save, writeSave } = await fixture(t);
  execFileSync('git', ['init', '-q'], { cwd: root });
  await mkdir(join(root, 'tools'));
  const cli = join(root, 'tools/check-save-references.mjs');
  await writeFile(cli, await readFile(new URL('../tools/check-save-references.mjs', import.meta.url)));
  assert.match(execFileSync(process.execPath, [cli], { encoding: 'utf8' }), /1 simulator save\(s\); 0 issue/);
  save.assets.scripts[0].source = '-- preserve this edit';
  await writeSave(save);
  const before = await readFile(join(root, 'tests/game.save.json'), 'utf8');
  assert.throws(() => execFileSync(process.execPath, [cli], { stdio: 'pipe' }), error => {
    assert.equal(error.status, 1);
    assert.match(error.stderr.toString(), /embedded Lua/);
    return true;
  });
  assert.equal(await readFile(join(root, 'tests/game.save.json'), 'utf8'), before);
});
