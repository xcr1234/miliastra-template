import { execFileSync } from 'node:child_process';
import { readFile, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));

// Include newly created saves, but respect Git ignores for portable exports.
export function discoverSaves(root = defaultRoot) {
  return [...new Set(execFileSync('git', [
    'ls-files', '--cached', '--others', '--exclude-standard', '-z', '--', '*.save.json',
  ], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean))].sort();
}

// Read-only: embedded code may contain edits that must first be merged into src.
export async function checkSaveReferences(root = defaultRoot, files = discoverSaves(root)) {
  const project = JSON.parse(await readFile(resolve(root, 'lua.project.json'), 'utf8'));
  const expectedPath = project.lua.out.replaceAll('\\', '/');
  const issues = [];
  for (const file of files) {
    try {
      const save = JSON.parse(await readFile(resolve(root, file), 'utf8'));
      if (save.format !== 'qxqy-simulator-save' || !Array.isArray(save.assets?.scripts)) {
        throw new Error('Expected a qxqy-simulator-save with assets.scripts');
      }
      for (const [index, script] of save.assets.scripts.entries()) {
        const label = `${file}: assets.scripts[${index}]`;
        if ((script.source ?? '') !== '') {
          issues.push(`${label}: embedded Lua found; compare and merge valid edits into src, rebuild, then clear source`);
        }
        if (script.path?.replaceAll('\\', '/') !== expectedPath) {
          issues.push(`${label}: path must reference ${expectedPath}`);
        } else {
          const source = await readFile(resolve(root, expectedPath), 'utf8');
          if (!source.trim()) issues.push(`${label}: empty Lua bundle; run npm run build:lua`);
        }
      }
    } catch (error) {
      issues.push(`${file}: ${error.message}${error.code === 'ENOENT' ? '; build missing Lua with npm run build:lua' : ''}`);
    }
  }
  return { checked: files.length, issues };
}

if (process.argv[1] && await realpath(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = await checkSaveReferences();
    for (const issue of result.issues) console.error(issue);
    console.log(`Checked ${result.checked} simulator save(s); ${result.issues.length} issue(s).`);
    if (result.issues.length) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
