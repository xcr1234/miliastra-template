import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { dirname, resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const online = process.argv.includes('--online');
if (process.argv.slice(2).some(flag => flag !== '--online')) throw new Error('Usage: npm run check -- [--online]');
let local = {};
try { local = JSON.parse(await readFile(resolve(root, '.codex/mcp.local.json'), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const env = { ...process.env };
if (local.proxy) Object.assign(env, { HTTP_PROXY: local.proxy, HTTPS_PROXY: local.proxy });

async function check(name, script, args, requiredTools, probe) {
  const client = new Client({ name: 'miliastra-template-check', version: '0.1.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [resolve(root, script), ...args], cwd: root, env });
  try {
    await client.connect(transport);
    const { tools } = await client.listTools();
    const names = new Set(tools.map(tool => tool.name));
    const missing = requiredTools.filter(tool => !names.has(tool));
    if (missing.length) throw new Error(`${name}: missing tools: ${missing.join(', ')}`);
    console.log(`${name}: ${tools.length} tools discovered`);
    if (probe && online) {
      const result = await client.callTool(probe);
      if (result.isError) throw new Error(`${name}: ${result.content?.[0]?.text ?? 'tool error'}`);
      const value = JSON.parse(result.content?.find(item => item.type === 'text')?.text ?? 'null');
      const rows = Array.isArray(value) ? value : value?.documents;
      if (!Array.isArray(rows) || rows.length === 0) throw new Error(`${name}: no document titles returned`);
      console.log(`${name}: remote knowledge query passed (${rows.length} document titles)`);
    }
  } finally { await client.close(); }
}

try {
  await check('simulator', 'node_modules/beyond-simulator-mcp/dist/index.js', ['--workspace', root],
    ['qxqy_project_open', 'qxqy_studio_play', 'qxqy_project_save']);
  await check('toolbox', 'tools/miliastra-toolbox-mcp.mjs', [],
    ['get_node_info', 'list_documents', 'get_document', 'rag_search', 'list_client_documents', 'get_client_document'],
    { name: 'list_client_documents', arguments: {} });
  if (!online) console.log('Remote query not requested. Use npm run check -- --online to verify network access.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
