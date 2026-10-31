import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';
import { designEnvironment, ensureImpeccableEngine, validateDesignCommand } from '../tools/design-tools.mjs';

const bytes = Buffer.from('test engine fixture, never executed');
const digest = createHash('sha256').update(bytes).digest('hex');
async function fixture(t, manifest = `0.1.18 impeccable-windows-x64.exe ${digest}\n`) {
  const root = await mkdtemp(join(tmpdir(), 'miliastra-design-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const scripts = join(root, '.agents/skills/impeccable/scripts');
  await mkdir(scripts, { recursive: true });
  await writeFile(join(scripts, 'VERSION'), '0.1.18\n');
  await writeFile(join(scripts, 'engine-checksums.txt'), manifest);
  return root;
}

test('design runtimes isolate caches without changing home or unrelated environment', () => {
  const root = join(tmpdir(), 'game with spaces');
  const env = designEnvironment(root, { HOME: 'original-home', USERPROFILE: 'original-profile', KEEP: 'yes',
    IMPECCABLE_HOME: 'outside', TASTE_SKILL_HISTORY: 'outside', TEMP: 'outside' });
  assert.equal(env.HOME, 'original-home');
  assert.equal(env.USERPROFILE, 'original-profile');
  assert.equal(env.KEEP, 'yes');
  assert.equal(env.DO_NOT_TRACK, '1');
  for (const key of ['IMPECCABLE_HOME', 'IMPECCABLE_SKILL_DIR', 'TASTE_SKILL_HISTORY', 'TASTE_SKILL_TMP', 'TEMP', 'TMP', 'TMPDIR']) {
    assert.ok(!relative(root, env[key]).startsWith('..'), key);
  }
});

test('entrypoint rejects installation and traversal before executing upstream code', () => {
  for (const command of ['install', 'update', 'hooks', 'live-server', '../draw']) {
    assert.throws(() => validateDesignCommand('impeccable', [command]));
  }
  assert.throws(() => validateDesignCommand('taste', ['../draw']));
  validateDesignCommand('taste', ['inspect', 'a folder/index.html']);
  validateDesignCommand('impeccable', ['detect', 'a folder/index.html']);
});

test('engine downloads to this project only, verifies checksum, then reuses offline', async t => {
  const root = await fixture(t);
  let calls = 0;
  const options = { platform: 'win32', arch: 'x64', fetchImpl: async url => {
    calls++;
    assert.equal(url, 'https://github.com/pbakaus/impeccable/releases/download/engine-v0.1.18/impeccable-windows-x64.exe');
    return new Response(bytes);
  } };
  const binary = await ensureImpeccableEngine(root, options);
  assert.equal(binary, join(root, '.local-tools/impeccable/bin/0.1.18/impeccable-windows-x64.exe'));
  assert.deepEqual(await readFile(binary), bytes);
  assert.equal(await ensureImpeccableEngine(root, options), binary);
  assert.equal(calls, 1);
});

test('bad downloads and modified cached engines are refused', async t => {
  const root = await fixture(t);
  const options = { platform: 'win32', arch: 'x64', fetchImpl: async () => new Response('corrupt') };
  await assert.rejects(ensureImpeccableEngine(root, options), /download checksum mismatch/);
  const binary = join(root, '.local-tools/impeccable/bin/0.1.18/impeccable-windows-x64.exe');
  await assert.rejects(readFile(binary), { code: 'ENOENT' });
  await mkdir(dirname(binary), { recursive: true });
  await writeFile(binary, 'changed externally');
  await assert.rejects(ensureImpeccableEngine(root, options), /Cached engine checksum mismatch/);
  assert.equal(await readFile(binary, 'utf8'), 'changed externally');
});

test('unknown releases and unsupported platforms never start a download', async t => {
  const root = await fixture(t, '# no matching checksum\n');
  let called = false;
  const fetchImpl = async () => { called = true; throw new Error('unexpected network'); };
  await assert.rejects(ensureImpeccableEngine(root, { platform: 'win32', arch: 'x64', fetchImpl }), /No pinned checksum/);
  await assert.rejects(ensureImpeccableEngine(root, { platform: 'unknown', arch: 'x64', fetchImpl }), /Unsupported engine platform/);
  assert.equal(called, false);
});
