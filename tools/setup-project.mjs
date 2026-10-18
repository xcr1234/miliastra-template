import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const json = value => `${JSON.stringify(value, null, 2)}\n`;

export async function setupProject(root = defaultRoot, { proxy, targetFile } = {}) {
  root = resolve(root);
  const localPath = resolve(root, '.codex/mcp.local.json');
  let local = {};
  try { local = JSON.parse(await readFile(localPath, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (proxy !== undefined) local.proxy = proxy;
  if (local.proxy) {
    const url = new URL(local.proxy);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Proxy must be an HTTP(S) URL without credentials');
    }
  }
  if (targetFile !== undefined && (!isAbsolute(targetFile) || !targetFile.toLowerCase().endsWith('.lua'))) {
    throw new Error('Target must be an absolute path to a .lua file');
  }
  const template = await readFile(resolve(root, '.codex/config.template.toml'), 'utf8');
  // JSON string escaping also handles quotes/backslashes in TOML basic strings.
  const tomlRoot = JSON.stringify(root.replaceAll('\\', '/')).slice(1, -1);
  let config = template.replaceAll('__PROJECT_ROOT__', tomlRoot);
  if (local.proxy) {
    for (const service of ['qxqy_simulator', 'miliastra_toolbox']) {
      config += `\n[mcp_servers.${service}.env]\nHTTP_PROXY = ${JSON.stringify(local.proxy)}\nHTTPS_PROXY = ${JSON.stringify(local.proxy)}\n`;
    }
  }
  await mkdir(resolve(root, '.codex'), { recursive: true });
  await writeFile(resolve(root, '.codex/config.toml'), config, 'utf8');
  await writeFile(localPath, json(local), 'utf8');
  if (targetFile !== undefined) {
    await writeFile(resolve(root, 'lua.deploy.local.json'), json({ targetFile }), 'utf8');
  }
  return { root, configPath: resolve(root, '.codex/config.toml'), targetConfigured: targetFile !== undefined };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const options = {};
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i += 2) {
      if (args[i] === '--no-proxy') { options.proxy = ''; i -= 1; continue; }
      if (!['--proxy', '--target'].includes(args[i]) || args[i + 1] === undefined) {
        throw new Error('Usage: npm run setup -- [--proxy http://127.0.0.1:PORT | --no-proxy] [--target "C:/.../main.lua"]');
      }
      options[args[i] === '--proxy' ? 'proxy' : 'targetFile'] = args[i + 1];
    }
    const result = await setupProject(defaultRoot, options);
    console.log(`Project MCP configured: ${result.configPath}`);
    if (result.targetConfigured) console.log('Deployment target saved locally. No files have been deployed.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
