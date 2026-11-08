// render-og.mjs — offline OG card renderer for compliance-audit.info.
// Reads TOPICS straight out of edge/info-site/worker.js (single source of
// truth) and emits assets/og/<slug>.png per hub + assets/og/logo.png, using
// headless Chrome. Re-run whenever hub titles/frameworks change, then deploy.
//
//   "C:\Program Files\nodejs\node.exe" scripts\render-og\render-og.mjs
//
// Requires Chrome on PATH at CHROME below; no npm dependencies.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const WORKER = path.join(ROOT, 'edge', 'info-site', 'worker.js');
const OUT_DIR = path.join(ROOT, 'edge', 'info-site', 'assets', 'og');
const TMP_DIR = path.join(HERE, '.tmp');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const { allCriteria } = (
  await import(pathToFileURL(path.join(ROOT, 'src', 'a11y', 'wcagRegistry.js')))
).default;

// TOPICS is a pure data array — eval the literal out of the worker source
// rather than duplicating slugs/titles here and drifting.
const src = readFileSync(WORKER, 'utf8');
const TOPICS = eval(src.match(/const TOPICS = (\[[\s\S]*?\n\]);/)[1]);

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const SHIELD =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="42" height="42"><rect width="32" height="32" rx="6" fill="#10b981"/><path d="M16 4L6 9v7c0 5.5 4.5 10 10 10s10-4.5 10-10V9L16 4zm0 14c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="white"/></svg>';

const truncate = (s, n = 150) => {
  const t = s.trim();
  if (t.length <= n) return t;
  return t.slice(0, t.lastIndexOf(' ', n)) + '…';
};

const cardHtml = ({ title, sub, chips }) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:1200px;height:630px;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:linear-gradient(120deg,#ffffff 55%,#ecfdf5 100%);display:flex;flex-direction:column;justify-content:space-between;padding:70px 80px}
.kicker{font-family:Consolas,monospace;font-size:19px;letter-spacing:.22em;color:#059669}
.brand{display:flex;align-items:center;gap:14px;margin-top:26px}
.brand span{font-size:21px;font-weight:600;color:#0f172a;letter-spacing:-.02em}
h1{font-size:56px;font-weight:800;color:#0f172a;letter-spacing:-.03em;line-height:1.1;max-width:1020px}
.sub{font-size:24px;color:#475569;margin-top:20px;max-width:930px;line-height:1.42}
.foot{display:flex;justify-content:space-between;align-items:center}
.chips{display:flex;gap:12px}
.chip{border:1px solid #a7f3d0;color:#047857;background:#ecfdf5;border-radius:999px;padding:7px 18px;font-size:18px;font-weight:600}
.chip.s{background:#f1f5f9;color:#475569;border-color:#e2e8f0}
.dom{font-size:20px;color:#64748b;font-family:Consolas,monospace}
</style></head>
<body>
<div>
  <div class="kicker">COMPLIANCE-AUDIT.INFO / RULE REFERENCE</div>
  <div class="brand">${SHIELD}<span>Compliance Audit — rule reference</span></div>
</div>
<div>
  <h1>${esc(title)}</h1>
  <div class="sub">${esc(sub)}</div>
</div>
<div class="foot">
  <div class="chips">${chips.map((c, i) => `<span class="chip${i ? ' s' : ''}">${esc(c)}</span>`).join('')}</div>
  <div class="dom">compliance-audit.eu</div>
</div>
</body></html>`;

const logoHtml = `<!doctype html>
<html><head><meta charset="utf-8"><style>
*{box-sizing:border-box;margin:0}
body{width:512px;height:512px;font-family:'Segoe UI',system-ui,sans-serif;background:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center}
span{font-size:34px;font-weight:700;color:#0f172a;letter-spacing:-.02em;margin-top:30px}
</style></head>
<body>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="240" height="240"><rect width="32" height="32" rx="6" fill="#10b981"/><path d="M16 4L6 9v7c0 5.5 4.5 10 10 10s10-4.5 10-10V9L16 4zm0 14c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="white"/></svg>
<span>Compliance Audit</span>
</body></html>`;

mkdirSync(TMP_DIR, { recursive: true });
mkdirSync(OUT_DIR, { recursive: true });

const render = (html, outPng, w, h) => {
  const htmlPath = path.join(TMP_DIR, `${path.basename(outPng, '.png')}.html`);
  writeFileSync(htmlPath, html);
  execFileSync(CHROME, [
    '--headless',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--screenshot=${outPng}`,
    `--window-size=${w},${h}`,
    `file:///${htmlPath.replace(/\\/g, '/')}`,
  ]);
  console.log('wrote', path.relative(ROOT, outPng));
};

const CRIT = new Map(allCriteria().map((c) => [c.criterionId, c]));

for (const t of TOPICS) {
  const wcagId = t.slug.startsWith('wcag-') ? t.slug.slice(5).replace(/-/g, '.') : null;
  const crit = wcagId ? CRIT.get(wcagId) : null;
  const chips = [t.framework];
  if (crit) chips.push(`Level ${crit.level}`, 'EN 301 549');
  render(
    cardHtml({ title: t.docTitle || t.title, sub: truncate(t.rule), chips }),
    path.join(OUT_DIR, `${t.slug}.png`),
    1200,
    630
  );
}

render(logoHtml, path.join(OUT_DIR, 'logo.png'), 512, 512);

rmSync(TMP_DIR, { recursive: true, force: true });
console.log('done —', TOPICS.length + 1, 'images');
