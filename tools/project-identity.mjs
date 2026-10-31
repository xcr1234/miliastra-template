import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const marker = '-- miliastra-project: ';

export async function ensureProjectId(root) {
  const file = resolve(root, '.lua-project-id');
  let content;
  try { content = await readFile(file, 'utf8'); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    const id = randomUUID();
    try { await writeFile(file, `${id}\n`, { flag: 'wx' }); return id; }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    // Another setup/build may have initialized the same project concurrently.
    content = await readFile(file, 'utf8');
  }
  const id = content.trim();
  if (!uuid.test(id)) throw new Error(`Invalid project UUID in ${file}; restore the original ID instead of silently regenerating it`);
  return id.toLowerCase();
}

export function formatProjectIdentity({ id, name }) {
  if (!uuid.test(id) || typeof name !== 'string' || !name.trim()) throw new Error('Invalid project identity');
  // JSON keeps names with quotes or line breaks inside a single Lua comment.
  return `${marker}${JSON.stringify({ id: id.toLowerCase(), name })}`;
}

export function readProjectIdentity(source) {
  const firstLine = source.replace(/^\uFEFF/, '').split(/\r\n|\r|\n/, 1)[0];
  if (!firstLine.startsWith(marker)) return null;
  try {
    const identity = JSON.parse(firstLine.slice(marker.length));
    if (!identity || typeof identity.id !== 'string' || !uuid.test(identity.id)
      || typeof identity.name !== 'string' || !identity.name.trim()) return null;
    return { id: identity.id.toLowerCase(), name: identity.name };
  } catch { return null; }
}
