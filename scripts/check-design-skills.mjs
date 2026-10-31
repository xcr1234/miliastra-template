import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const lock = JSON.parse(await readFile(resolve(root, '.agents/design-skills.lock.json'), 'utf8'));
let checked = 0;
const failures = [];
let links = 0;
for (const skill of lock.skills) {
  for (const file of skill.files) {
    try {
      const path = resolve(root, skill.directory, file.path);
      const rel = relative(resolve(root, skill.directory), path);
      if (isAbsolute(rel) || rel.startsWith('..')) throw new Error('Path escapes skill directory');
      // All pinned resources are text; GitHub archives and Windows checkouts may use CRLF.
      const bytes = (await readFile(path, 'utf8')).replaceAll('\r\n', '\n');
      const actual = createHash('sha256').update(bytes).digest('hex');
      if (actual !== file.sha256) throw new Error('SHA-256 mismatch');
      checked++;
    } catch (error) { failures.push(`${skill.name}/${file.path}: ${error.message}`); }
  }
}
const docs = [
  'AGENTS.md', 'README.md', 'CONTRIBUTING.md', 'THIRD_PARTY_NOTICES.md',
  'docs/design-skills.md', 'docs/tool-sources.md', 'docs/knowledge-api.md', 'docs/image-fitting.md',
  ...['miliastra-knowledge', 'miliastra-knowledge-lua', 'miliastra-image-css-builder']
    .map(name => `.agents/skills/${name}/SKILL.md`),
  '.agents/skills/miliastra-image-css-builder/references/provenance.md',
  '.agents/skills/qxqy-game-studio/provenance.md',
  '.agents/skills/design-taste-frontend/SKILL.md', '.agents/skills/design-taste-frontend/provenance.md',
  '.agents/skills/impeccable/SKILL.md', '.agents/skills/impeccable/provenance.md',
  '.agents/skills/qxqy-game-studio/SKILL.md',
  ...['workflow', 'stage-approval', '01-game-design', '02-test-cases', '03-html-prototype',
    '04-art-assets', '05-lua-implementation', '06-simulator-testing', '07-device-validation']
    .map(name => `.agents/skills/qxqy-game-studio/references/${name}.md`),
];
for (const doc of docs) {
  const source = await readFile(resolve(root, doc), 'utf8');
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const href = match[1].split('#')[0];
    if (!href || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
    try {
      await access(resolve(root, dirname(doc), decodeURIComponent(href)));
      links++;
    } catch { failures.push(`${doc}: missing local link ${href}`); }
  }
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log(`Design skills: ${checked} pinned upstream files and ${links} local documentation links verified. Local adapters are maintained separately.`);
