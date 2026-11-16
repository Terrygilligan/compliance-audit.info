// validate-topics.mjs — TOPICS contract checker for edge/info-site/worker.js.
// Run: node scripts/validate-topics.mjs   (repo root)
//
// Guards the article contract so broken `related` links or malformed
// sections never reach a deploy:
//   - every related slug resolves (TOPICS article or WCAG stub slug)
//   - selfCheck has exactly 4 items, pitfalls exactly 3
//   - every citation URL is https://
//   - no duplicate slugs; framework listed in FRAMEWORK_ORDER

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'edge/info-site/worker.js'), 'utf8');
const { allCriteria } = createRequire(import.meta.url)(
  join(root, 'src/a11y/wcagRegistry.js')
);

// Extract a `const NAME = [ ... ];` array literal with a bracket counter
// that skips string literals — regex alone can't find the matching bracket.
function extractArrayConst(name) {
  const start = src.indexOf(`const ${name} = [`);
  if (start < 0) throw new Error(`${name} not found`);
  const open = src.indexOf('[', start);
  let depth = 0, quote = null;
  for (let i = open; i < src.length; i++) {
    const ch = src[i], prev = src[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth++;
    if (ch === ']' && --depth === 0) {
      return eval(src.slice(open, i + 1));
    }
  }
  throw new Error(`${name}: unterminated array`);
}

const TOPICS = extractArrayConst('TOPICS');
const FRAMEWORK_ORDER = extractArrayConst('FRAMEWORK_ORDER');

const topicSlugs = new Set();
const stubSlugs = new Set(
  allCriteria().map((c) => `wcag-${c.criterionId.replace(/\./g, '-')}`)
);

const errors = [];
for (const t of TOPICS) {
  const at = t.slug || '<missing slug>';
  if (topicSlugs.has(t.slug)) errors.push(`${at}: duplicate slug`);
  topicSlugs.add(t.slug);
  if (!FRAMEWORK_ORDER.includes(t.framework))
    errors.push(`${at}: framework '${t.framework}' missing from FRAMEWORK_ORDER`);
  if ((t.selfCheck || []).length !== 4)
    errors.push(`${at}: selfCheck has ${(t.selfCheck || []).length} items (need 4)`);
  if ((t.pitfalls || []).length !== 3)
    errors.push(`${at}: pitfalls has ${(t.pitfalls || []).length} items (need 3)`);
  for (const [label, url] of t.citations || [])
    if (!/^https:\/\//.test(url)) errors.push(`${at}: citation "${label}" is not https (${url})`);
  for (const r of t.related || [])
    if (!topicSlugs.has(r) && !stubSlugs.has(r) && !TOPICS.some((x) => x.slug === r))
      errors.push(`${at}: related slug '${r}' resolves to nothing`);
}

if (errors.length) {
  console.error(`validate-topics: ${errors.length} problem(s)\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`validate-topics: OK — ${TOPICS.length} TOPICS, ${stubSlugs.size} WCAG stub slugs, all related resolve`);
