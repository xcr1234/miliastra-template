import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import fengari from 'fengari';
import { bundleLua } from '../tools/bundle-lua.mjs';

const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;

async function fixture(t, files) {
  const dir = await mkdtemp(join(tmpdir(), 'qxqy-lua-bundle-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const root = join(dir, 'src');
  const out = join(dir, 'dist', 'main.lua');
  for (const [name, source] of Object.entries(files)) {
    const file = join(root, name);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, source);
  }
  return { root, out, entry: 'main' };
}

function execute(code, assertions, setup = '') {
  const state = lauxlib.luaL_newstate();
  lualib.luaL_openlibs(state);
  const run = source => {
    const status = lauxlib.luaL_dostring(state, to_luastring(source));
    assert.equal(status, lua.LUA_OK, status === lua.LUA_OK ? undefined : to_jsstring(lua.lua_tostring(state, -1)));
    lua.lua_settop(state, 0);
  };
  try {
    run('require=nil; package=nil; load=nil; loadfile=nil; dofile=nil; io=nil; os=nil');
    if (setup) run(setup);
    run(code);
    run(assertions);
  } finally {
    lua.lua_close(state);
  }
}

test('single file runs without host loaders, caches nested modules, exposes lifecycle callbacks', async t => {
  const options = await fixture(t, {
    'main.lua': 'local a = require("game.score")\nlocal b = require "game.score"\nassert(a == b)\nfunction OnStart() a.add(3) end\nfunction OnUpdate(dt) a.add(dt) end\nfunction OnDestroy() a.reset() end\nfunction GetScore() return b.get() end',
    'game/score.lua': 'local config = require("config")\ninitializations = (initializations or 0) + 1\nlocal n = config.initial\nlocal M = {}\nfunction M.add(v) n = n + v end\nfunction M.get() return n end\nfunction M.reset() n = 0 end\nreturn M',
    'config.lua': 'return { initial = 1 }',
  });
  const result = await bundleLua(options);
  assert.equal(result.moduleCount, 3);
  execute(await readFile(options.out, 'utf8'), 'assert(initializations == 1); OnStart(); OnUpdate(2); assert(GetScore() == 6); OnDestroy(); assert(GetScore() == 0)');
});

test('ignores require text in comments/strings and preserves source line mapping', async t => {
  const source = `-- require("missing")\n--[==[ require("missing") ]==]\nlocal text = [=[require("missing")]=]\nlocal quoted = "require(\\\"missing\\\")"\nlocal value = require -- note\n ("value")\nfunction GetText() return text .. value end\n`;
  const options = await fixture(t, { 'main.lua': source, 'value.lua': 'return " ok"' });
  const result = await bundleLua(options);
  assert.equal(result.moduleCount, 2);
  execute(result.code, `assert(GetText() == 'require("missing") ok')`);
  const map = JSON.parse(await readFile(`${options.out}.map.json`, 'utf8'));
  const module = map.modules.find(row => row.module === 'main');
  assert.equal(result.code.split('\n').slice(module.startLine - 1, module.endLine).join('\n'), source);
});

test('preserves lazy loading and isolates locals with the same name', async t => {
  const options = await fixture(t, {
    'main.lua': 'local value = "entry"\nfunction OnStart() local m = require("lazy"); assert(m == "lazy"); assert(value == "entry") end',
    'lazy.lua': 'local value = "lazy"\ninitialized = true\nreturn value',
  });
  const result = await bundleLua(options);
  execute(result.code, 'assert(initialized == nil); OnStart(); assert(initialized == true)');
});

test('project header escapes names and preserves runnable Lua and source mappings', async t => {
  const source = 'function GetValue() return 42 end';
  const options = await fixture(t, { 'main.lua': source });
  const projectIdentity = { id: 'fc296edd-4314-47ae-87dd-8705f80f11f0', name: '游戏 "demo"\nerror("injected")' };
  const result = await bundleLua({ ...options, projectIdentity });
  assert.equal(result.code.split('\n')[0], `-- miliastra-project: ${JSON.stringify(projectIdentity)}`);
  assert.deepEqual(result.map.projectIdentity, projectIdentity);
  const mapping = result.map.modules.find(row => row.module === 'main');
  assert.equal(result.code.split('\n').slice(mapping.startLine - 1, mapping.endLine).join('\n'), source);
  execute(result.code, 'assert(GetValue() == 42)');
});

test('module initialization happens once for nil and false exports', async t => {
  const options = await fixture(t, {
    'main.lua': 'assert(require("empty") == true); assert(require("empty") == true); assert(require("disabled") == false); assert(require("disabled") == false)',
    'empty.lua': 'emptyCount = (emptyCount or 0) + 1',
    'disabled.lua': 'disabledCount = (disabledCount or 0) + 1; return false',
  });
  const result = await bundleLua(options);
  execute(result.code, 'assert(emptyCount == 1 and disabledCount == 1)');
});

test('rejects missing modules and cycles with the dependency chain', async t => {
  const missing = await fixture(t, { 'main.lua': 'require("missing")' });
  await assert.rejects(bundleLua(missing), /Missing Lua module "missing".*required by main/);
  const cycle = await fixture(t, { 'main.lua': 'require("a")', 'a.lua': 'require("main")' });
  await assert.rejects(bundleLua(cycle), /main -> a -> main/);
});

test('rejects dynamic/aliased/shadowed require and unsafe module names', async t => {
  for (const source of [
    'local name = "a"; require(name)',
    'local import = require; import("a")',
    'local require = function() end',
    'require("../escape")',
    'require [[a]]',
    'require("a", "b")',
  ]) {
    const options = await fixture(t, { 'main.lua': source });
    await assert.rejects(bundleLua(options), /literal require/);
  }
});

test('Lua syntax errors identify the source and do not overwrite the previous build', async t => {
  const options = await fixture(t, { 'main.lua': 'return 1' });
  const original = await bundleLua(options);
  await writeFile(join(options.root, 'main.lua'), 'local broken =');
  await assert.rejects(bundleLua(options), /main.lua:1:/);
  assert.equal(await readFile(options.out, 'utf8'), original.code);
});

test('build is deterministic and cannot overwrite the source tree', async t => {
  t.mock.timers.enable({ apis: ['Date'], now: 1792569600000 });
  const options = await fixture(t, { 'main.lua': 'return require("value")', 'value.lua': 'return 42' });
  const first = await bundleLua(options);
  const second = await bundleLua(options);
  assert.equal(first.code, second.code);
  assert.deepEqual(first.map, second.map);
  await assert.rejects(bundleLua({ ...options, out: join(options.root, 'main.lua') }), /outside the Lua source root/);
  assert.equal(await readFile(join(options.root, 'main.lua'), 'utf8'), 'return require("value")');
});

test('build date uses local system time and startup logs surround OnStart without changing its values', async t => {
  const options = await fixture(t, {
    'main.lua': 'function OnStart(a, b) print("game started"); return a, nil, b end\nreturn { value = 42 }',
  });
  const before = Date.now();
  const result = await bundleLua(options);
  const after = Date.now();
  assert.match(result.builtAt, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3} [+-]\d{2}:\d{2}$/);
  const instant = Date.parse(result.builtAt.replace(' ', 'T').replace(' ', ''));
  assert.ok(instant >= before && instant <= after);
  assert.equal(new Date(instant).getHours(), Number(result.builtAt.slice(11, 13)));
  assert.ok(result.code.includes(`-- Build date (local): ${result.builtAt}`));
  execute(`entry = (function()\n${result.code}\nend)()`, `
    assert(#logs == 0)
    assert(entry.value == 42)
    local result = table.pack(OnStart(7, 9))
    assert(result.n == 3 and result[1] == 7 and result[2] == nil and result[3] == 9)
    assert(#logs == 4)
    assert(logs[1] == "[miliastra] Build date (local): ${result.builtAt}")
    assert(logs[2] == "[miliastra] Initialization started (OnStart)")
    assert(logs[3] == "game started")
    assert(logs[4] == "[miliastra] Initialization completed (OnStart)")
  `, 'logs = {}; print = function(value) logs[#logs + 1] = value end');
});

test('startup logs can be disabled while keeping the build date and original callback', async t => {
  const options = await fixture(t, { 'main.lua': 'function OnStart() return 42 end\noriginalStart = OnStart' });
  const result = await bundleLua({ ...options, startupLog: false });
  assert.ok(result.code.includes(`-- Build date (local): ${result.builtAt}`));
  execute(result.code, 'assert(OnStart == originalStart); assert(OnStart() == 42)', 'print = nil');
  await assert.rejects(bundleLua({ ...options, startupLog: 'false' }), /startupLog must be a boolean/);
});

test('failed initialization propagates its error and never logs completion', async t => {
  const options = await fixture(t, { 'main.lua': 'function OnStart() error("initialization failed") end' });
  const result = await bundleLua(options);
  execute(result.code, `
    local ok, err = pcall(OnStart)
    assert(not ok and string.find(err, "initialization failed", 1, true))
    assert(#logs == 2)
  `, 'logs = {}; print = function(value) logs[#logs + 1] = value end');
});

test('module-only bundles do not acquire a startup callback', async t => {
  const options = await fixture(t, { 'main.lua': 'return 42' });
  const result = await bundleLua(options);
  execute(result.code, 'assert(OnStart == nil)', 'print = function() error("unexpected log") end');
});
