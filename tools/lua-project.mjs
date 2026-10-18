import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { bundleLua } from './bundle-lua.mjs';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const inside = (root, file) => {
  const rel = relative(root, file);
  return !isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`);
};
async function optionalFile(file) {
  try { return await readFile(file); }
  catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

export async function buildProject(root = defaultRoot) {
  root = resolve(root);
  const project = JSON.parse(await readFile(resolve(root, 'lua.project.json'), 'utf8'));
  const settings = project.lua;
  if (!settings || typeof settings.root !== 'string' || typeof settings.out !== 'string') {
    throw new Error('lua.project.json must define lua.root, lua.entry and lua.out');
  }
  const source = resolve(root, settings.root);
  const output = resolve(root, settings.out);
  if (!inside(root, source) || !inside(root, output) || !output.toLowerCase().endsWith('.lua')) {
    throw new Error('Lua source and output must stay in this project; output must end in .lua');
  }
  return bundleLua({ root: source, entry: settings.entry ?? 'main', out: output });
}

export async function deployProject(root = defaultRoot, { dryRun = false, overwrite = false } = {}) {
  root = resolve(root);
  // Always rebuild before touching the destination. Never deploy a stale build.
  const build = await buildProject(root);
  let config;
  try { config = JSON.parse(await readFile(resolve(root, 'lua.deploy.local.json'), 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error('Set a target first: npm run setup -- --target "C:/.../main.lua"');
    throw error;
  }
  if (typeof config.targetFile !== 'string' || !isAbsolute(config.targetFile) || !config.targetFile.toLowerCase().endsWith('.lua')) {
    throw new Error('targetFile must be an absolute path to a .lua file');
  }
  const target = resolve(config.targetFile);
  const project = JSON.parse(await readFile(resolve(root, 'lua.project.json'), 'utf8'));
  if (target === build.output || inside(resolve(root, project.lua.root), target)) {
    throw new Error('Deployment target must differ from the build output and source files');
  }
  const bytes = await readFile(build.output);
  const sha256 = hash(bytes);
  const current = await optionalFile(target);
  const currentHash = current === null ? null : hash(current);
  const statePath = resolve(root, '.lua-deploy-state.json');
  const stateBytes = await optionalFile(statePath);
  const state = stateBytes ? JSON.parse(stateBytes.toString('utf8')) : {};
  const key = process.platform === 'win32' ? target.toLowerCase() : target;
  const previous = state[key]?.sha256;
  const conflict = currentHash !== null && currentHash !== sha256 && currentHash !== previous;
  const plan = {
    source: build.output, target, sha256,
    action: currentHash === sha256 ? 'unchanged' : current === null ? 'create' : 'replace',
    conflict,
  };
  if (dryRun) return { ...plan, dryRun: true };
  if (conflict && !overwrite) {
    throw new Error('Target has existing or externally modified content. Review it, then use --overwrite; the old file will be backed up.');
  }
  let backup;
  if (plan.action === 'replace') {
    const backupDir = resolve(root, '.lua-deploy-backups');
    await mkdir(backupDir, { recursive: true });
    backup = resolve(backupDir, `${Date.now()}-${randomUUID()}.lua`);
    await writeFile(backup, current, { flag: 'wx' });
  }
  if (plan.action !== 'unchanged') {
    await mkdir(dirname(target), { recursive: true });
    const temporary = `${target}.${randomUUID()}.tmp`;
    try {
      await writeFile(temporary, bytes, { flag: 'wx' });
      // Stop if the target changed between inspection and replacement.
      const latest = await optionalFile(target);
      if ((latest === null ? null : hash(latest)) !== currentHash) throw new Error('Target changed during deployment; retry after reviewing it');
      await rename(temporary, target);
    } finally {
      await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
  }
  if (hash(await readFile(target)) !== sha256) throw new Error('Destination verification failed');
  state[key] = { sha256, source: relative(root, build.output).replaceAll('\\', '/'), deployedAt: new Date().toISOString() };
  await writeFile(statePath, json(state), 'utf8');
  return { ...plan, dryRun: false, backup };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const [action, ...flags] = process.argv.slice(2);
    if (!['build', 'deploy'].includes(action) || flags.some(flag => !['--dry-run', '--overwrite'].includes(flag))
      || (action === 'build' && flags.length)) {
      throw new Error('Usage: npm run build:lua OR npm run deploy:lua -- [--dry-run] [--overwrite]');
    }
    if (action === 'build') {
      const result = await buildProject();
      console.log(`Bundled ${result.moduleCount} Lua modules -> ${result.output}`);
    } else {
      const result = await deployProject(defaultRoot, { dryRun: flags.includes('--dry-run'), overwrite: flags.includes('--overwrite') });
      console.log(json(result));
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
