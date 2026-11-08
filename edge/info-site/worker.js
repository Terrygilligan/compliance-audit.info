/**
 * compliance-info-site — public trust & information surface for
 * compliance-audit.info (v3). Same livery as the portal (emerald/slate,
 * border-slate-200 cards, mono kickers), zero third-party assets, no JS
 * required.
 *
 * v3 spec: docs/handover/plans/plan-info-v3-execution.md —
 *   canonical article path is /rules/<slug> (/t/<slug> → 301), true 404s
 *   on unknown /rules/*, edge-served robots.txt/sitemap.xml/llms.txt,
 *   /rules index page, OG via the ASSETS binding, JSON-LD (WebSite +
 *   Organization on /, TechArticle + BreadcrumbList on /rules/*),
 *   ~55 programmatic WCAG stubs from src/a11y/wcagRegistry.js (noindex
 *   until hand-polished), zero-JS telemetry pings on indexable routes.
 *
 * Node status is fetched SERVER-SIDE at request time from the run.app
 * /health endpoints (public, exempt from edge shield) — no CORS, no
 * client-side calls. A node being down must never 500 this page: that is
 * precisely what a status surface exists to show.
 *
 * www.* → 301 apex. Unknown non-/rules paths → 301 to "/".
 */

import { allCriteria } from '../../src/a11y/wcagRegistry.js';
import { LOCALES, DEFAULT_LOCALE, localeData, t, localizeTopic, isActive } from '../../src/i18n/index.js';

const EU_HEALTH = 'https://compliance-audit-prod-355879683660.europe-west1.run.app/health';
const UK_HEALTH = 'https://compliance-audit-uk-355879683660.europe-west2.run.app/health';
const PORTAL = 'https://compliance-audit.eu';
const APP = 'https://app.compliance-audit.eu';
const PROOF = 'https://compliance-audit.eu/proof';
const TRUST = 'https://compliance-audit.eu/trust';
const SCAN = 'https://compliance-audit.eu/scan';
const VERIFY = 'https://compliance-audit.eu/verify';
const ORIGIN = 'https://compliance-audit.info';
const TELEMETRY_URL = 'https://api.compliance-audit.eu/v1/telemetry/heartbeat';

// Registry snapshot date — bump when wcagRegistry content is re-synced into
// stubs; used as sitemap lastmod for programmatic pages.
const REGISTRY_DATE = '2026-11-02';
// Authoring date for the 12 hand-written TOPICS articles.
const TOPICS_DATE = '2026-11-01';

// Legacy /t/ slugs that merge into their bare wcag-<id> stub (owner-locked
// slug merge — one page per criterion).
// --- Locale routing ----------------------------------------------------------
// EN serves at root (prefix:''); other locales under /<code>/. Inactive
// locales 301 to their EN equivalent — a locale only goes live once its
// translation files are committed and reviewed (see src/i18n/).
function resolveLocale(pathname) {
  for (const [code, cfg] of Object.entries(LOCALES)) {
    if (!cfg.prefix) continue;
    if (pathname === cfg.prefix || pathname.startsWith(`${cfg.prefix}/`)) {
      return { locale: code, path: pathname.slice(cfg.prefix.length) || '/' };
    }
  }
  return { locale: DEFAULT_LOCALE, path: pathname };
}

function locPath(locale, path) {
  return `${LOCALES[locale]?.prefix || ''}${path}`;
}

// hreflang alternates for a resource: every active locale's equivalent URL +
// x-default → EN. Returned as [hreflang, absolute-url] pairs for <link> tags.
function alternatesFor(path) {
  const pairs = [['x-default', `${ORIGIN}${locPath(DEFAULT_LOCALE, path)}`]];
  for (const [code] of Object.entries(LOCALES)) {
    if (isActive(code)) pairs.push([code, `${ORIGIN}${locPath(code, path)}`]);
  }
  return pairs;
}

const T_SLUG_MERGES = {
  'wcag-2-1-1-keyboard': 'wcag-2-1-1',
  'wcag-1-4-3-contrast': 'wcag-1-4-3',
  'wcag-4-1-2-name-role-value': 'wcag-4-1-2',
};

const SECURITY_HEADERS = {
  'content-type': 'text/html; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  // Zero third-party anything — same promise the product makes.
  'content-security-policy':
    "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
};

// --- Lucide icons (ISC) — inlined paths, 24x24 stroke=2 ----------------------
const ICONS = {
  shield:
    '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  mapPin:
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  eyeOff:
    '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.939 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  cookie:
    '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>',
  fingerprint:
    '<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>',
  server:
    '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  fileJson:
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/>',
  lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  fileText:
    '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  scale:
    '<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
  a11y:
    '<circle cx="16" cy="4" r="1"/><path d="m18 19 1-7-6 1"/><path d="m5 8 3-3 5.5 3-2.36 3.5"/><path d="M4.24 14.5a5 5 0 0 0 6.88 6"/><path d="M13.76 17.5a5 5 0 0 0-6.88-6"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  gitBranch:
    '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};

function icon(name, cls) {
  // width/height are a floor — a bare icon must never balloon to fill its
  // container; .ic overrides via CSS where a different size is wanted.
  return `<svg class="${cls}" width="14" height="14" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

// The brand mark — same emerald square + white shield as portal icon.svg.
const BRAND_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#10b981"/><path d="M16 4L6 9v7c0 5.5 4.5 10 10 10s10-4.5 10-10V9L16 4zm0 14c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z" fill="white"/></svg>';

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%2310b981'/%3E%3Cpath d='M16 4L6 9v7c0 5.5 4.5 10 10 10s10-4.5 10-10V9L16 4zm0 14c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3z' fill='white'/%3E%3C/svg%3E";

// --- Livery — the portal's design system, hand-ported (no framework, no CDN) --
const CSS = `
:root{color-scheme:light}
*{box-sizing:border-box;margin:0}
body{font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#0f172a;background:#f8fafc;-webkit-font-smoothing:antialiased}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.wrap{max-width:64rem;margin:0 auto;padding:0 1.5rem}
header{border-bottom:1px solid #e2e8f0;background:#fff}
header .wrap{height:3.5rem;display:flex;align-items:center;justify-content:space-between}
.brand{display:flex;align-items:center;gap:.625rem;text-decoration:none;color:#0f172a}
.brand span{font-weight:600;letter-spacing:-.025em;font-size:.875rem}
.hd-right{display:flex;align-items:center;gap:1rem}
.tag{font-size:11px;color:#94a3b8;font-family:ui-monospace,monospace}
.btn{display:inline-flex;align-items:center;gap:.5rem;font-size:.875rem;font-weight:500;padding:.625rem 1rem;border-radius:.5rem;text-decoration:none;white-space:nowrap;transition:background .15s,border-color .15s,color .15s}
.btn svg{width:1rem;height:1rem;flex-shrink:0}
.btn-sm{padding:.375rem .75rem;font-size:.75rem}
.btn-em{background:#10b981;color:#fff}.btn-em:hover{background:#34d399}
.btn-ghost{border:1px solid #cbd5e1;color:#334155}.btn-ghost:hover{border-color:#94a3b8}
.btn-dark{background:#0f172a;color:#fff;border-radius:9999px}.btn-dark:hover{background:#334155}
.hero{background:#fff;border-bottom:1px solid #e2e8f0}
.hero .wrap{padding:2.5rem 1.5rem}
.kicker{font-size:11px;font-family:ui-monospace,monospace;color:#94a3b8;margin-bottom:.75rem}
h1{font-size:1.875rem;font-weight:700;letter-spacing:-.025em;color:#0f172a;max-width:42rem}
@media(min-width:768px){h1{font-size:2.25rem}}
.sub{margin-top:.75rem;color:#475569;line-height:1.625;max-width:42rem;font-size:.9375rem}
.cta-row{margin-top:1.25rem;display:flex;flex-wrap:wrap;gap:.75rem;align-items:center}
.strip{border-bottom:1px solid #e2e8f0;background:rgba(248,250,252,.6)}
.strip .wrap{padding:1.5rem;display:grid;grid-template-columns:repeat(2,1fr);gap:1rem}
@media(min-width:768px){.strip .wrap{grid-template-columns:repeat(4,1fr)}}
.stat{background:#fff;border:1px solid #e2e8f0;border-radius:.5rem;padding:1rem}
.stat-l{display:flex;align-items:center;gap:.5rem;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:.5rem}
.stat-l svg{width:.875rem;height:.875rem;color:#10b981}
.stat-v{font-size:1.25rem;font-weight:700;color:#0f172a;font-family:ui-monospace,monospace}
.stat-s{font-size:11px;color:#64748b;margin-top:.125rem}
section .wrap{padding:3rem 1.5rem}
.sec-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem}
h2{font-size:1.125rem;font-weight:600;color:#0f172a}
.sec-sub{font-size:.75rem;color:#64748b;margin-top:.125rem}
.grid2{display:grid;gap:1rem}
@media(min-width:768px){.grid2{grid-template-columns:repeat(2,1fr)}}
.grid3{display:grid;gap:1rem}
@media(min-width:768px){.grid3{grid-template-columns:repeat(3,1fr)}}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:.5rem;padding:1.25rem}
.card-h{display:flex;align-items:center;gap:.625rem;margin-bottom:.5rem}
.card-h .ic{padding:.375rem;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:.25rem;display:inline-flex}
.card-h .ic svg{width:1rem;height:1rem;color:#059669}
.card-h h3{font-size:.875rem;font-weight:600;color:#0f172a}
.card p{font-size:.75rem;color:#475569;line-height:1.625}
.chip{display:inline-flex;align-items:center;gap:.25rem;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;border:1px solid;border-radius:.25rem;padding:.125rem .375rem}
.chip-g{background:#ecfdf5;color:#047857;border-color:#a7f3d0}
.chip-s{background:#f1f5f9;color:#475569;border-color:#e2e8f0}
.chip-r{background:#fef2f2;color:#b91c1c;border-color:#fecaca}
.chip svg{width:.75rem;height:.75rem}
.f-links a svg{width:.875rem;height:.875rem;vertical-align:-2px}
.badges .chip svg{width:.75rem;height:.75rem}
.node{display:flex;flex-direction:column;gap:.375rem}
.node-top{display:flex;align-items:center;justify-content:space-between}
.node-name{font-size:.875rem;font-weight:600;color:#0f172a;display:flex;align-items:center;gap:.5rem}
.node-name svg{width:1rem;height:1rem;color:#10b981}
.node-meta{font-size:11px;color:#64748b;font-family:ui-monospace,monospace}
.note{margin-top:.75rem;font-size:11px;font-family:ui-monospace,monospace;color:#94a3b8}
.cta-band{background:#0f172a;border-radius:.5rem;padding:1.25rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;margin:0 1.5rem 3rem}
.cta-band p{font-size:.875rem;color:#cbd5e1;max-width:36rem;line-height:1.625}
.cta-band a{display:inline-flex;align-items:center;gap:.375rem;font-size:.875rem;font-weight:500;color:#34d399;text-decoration:none}
.cta-band a:hover{color:#6ee7b7}
.cta-band svg{width:1rem;height:1rem}
footer{border-top:1px solid #e2e8f0;background:#f8fafc}
footer .wrap{padding:1.25rem 1.5rem;font-size:11px;color:#64748b;display:flex;flex-direction:column;gap:.75rem}
.f-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem}
.badges{display:flex;flex-wrap:wrap;gap:.375rem}
.f-links{display:flex;align-items:center;gap:1rem}
.f-links a{color:#64748b;text-decoration:none}
.f-links a:hover{color:#334155}
`;

// --- Compliance rules index -------------------------------------------------
// One object = one article at /t/<slug>. `framework` groups the index page;
// keep copy tight and accurate — this is a reference surface, not a blog.
const TOPICS = [
  {
    slug: 'gdpr-art-5-minimisation', framework: 'GDPR', chip: 'chip-g',
    docTitle: 'GDPR Art. 5 — Data minimisation',
    title: 'Art. 5 — Data minimisation',
    context: 'Article 5(1)(c) sits at the top of GDPR\u2019s principles list because every other obligation flows from it — you cannot breach-protect, retention-manage, or fulfil a DSAR on data you never collected. Regulators read minimisation as an engineering requirement, not a privacy-policy sentence: enforcement consistently punishes collection that outlives its stated purpose — excessive form fields, retained location pings, "just in case" analytics payloads.',
    rule: 'Personal data must be "adequate, relevant and limited to what is necessary" for the stated purpose. Collecting more than you need is non-compliant by itself, whatever your consent banner says.',
    build: 'Collect less. Strip identifiers at the boundary, before storage or logging — a field you never store can never leak, be breached, or need a DSAR.',
    selfCheck: [
      'Can you name the declared purpose for every persisted field — and would deleting it break that purpose?',
      'Do ingestion paths drop unknown keys before storage, or does your schema accept arbitrary payloads?',
      'Are log and analytics payloads filtered at the boundary, not just trusted internally?',
      'Is retention defined per field or data class somewhere other than someone\u2019s memory?',
    ],
    pitfalls: [
      'Minimising at the UI while the API still accepts the same fields "for debugging" — the server boundary is what counts.',
      'Treating analytics as exempt: event payloads are personal data too, and "we might need it later" is not a purpose.',
      'Collecting full objects then redacting in the warehouse — the PII already lived in your logs.',
    ],
    citations: [
      ['GDPR consolidated text — Art. 5 (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679'],
      ['GDPR.eu article mirror — Art. 5', 'https://gdpr-info.eu/art-5-gdpr/'],
    ],
    related: ['gdpr-art-17-erasure', 'gdpr-art-32-security', 'eprivacy-cookies', 'data-residency'],
    engine: 'POST /v1/sanitize — boundary redaction of SSN, email, phone, card and key fields before data reaches storage.',
  },
  {
    slug: 'gdpr-art-17-erasure', framework: 'GDPR', chip: 'chip-g',
    docTitle: 'GDPR Art. 17 — Right to erasure',
    title: 'Art. 17 — Right to erasure',
    context: 'Article 17 is where privacy programs meet their write path. "Without undue delay" means days in practice, and "taking into account available technology" means your architecture is the excuse — or the defense. Controllers must also notify downstream recipients, so deletion is not a row problem; it is a propagation problem across replicas, caches, exports, and backups.',
    rule: 'On a valid request you must delete personal data "without undue delay" — every copy, in every store you control. A tombstone in the auth table while rows persist elsewhere is not erasure.',
    build: 'Deletion has to be a cascade with a defined blast radius: user-owned artifacts destroyed, shared tenant data left intact, and the operation idempotent so retries are safe.',
    selfCheck: [
      'Does a single request cascade to every store, replica, cache, and search index holding the subject\u2019s data?',
      'Are backups covered — via rotation expiry or crypto-shredding of per-user keys?',
      'Can retries of the same request run safely (idempotent) without resurrecting data?',
      'Do you emit a completion artifact — a record that erasure happened, without keeping the erased data?',
    ],
    pitfalls: [
      'Soft-delete flags: a tombstoned row still containing the data is not erasure — regulators treat it as a lie, not a shortcut.',
      'Orphaned copies: deleting the primary while read-replicas, BI exports, and search indexes keep the records.',
      'Reversible "anonymisation" — a salted hash of an email is still personal data while you hold the salt.',
    ],
    citations: [
      ['GDPR consolidated text — Art. 17 (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679'],
      ['GDPR.eu article mirror — Art. 17', 'https://gdpr-info.eu/art-17-gdpr/'],
    ],
    related: ['gdpr-art-5-minimisation', 'gdpr-art-33-breach', 'gdpr-art-32-security', 'data-residency'],
    engine: 'Destructive anonymization on UserDeleted — identifying fields overwritten, never reversibly hashed, across both sovereign partitions.',
  },
  {
    slug: 'gdpr-art-32-security', framework: 'GDPR', chip: 'chip-g',
    docTitle: 'GDPR Art. 32 — Security of processing',
    title: 'Art. 32 — Security of processing',
    context: 'Article 32 is the "show me" article: it does not mandate specific technology, it mandates demonstrability. The listed measures — pseudonymisation, confidentiality and integrity of systems, restoration ability, regular testing — are exactly what an assessor asks evidence for, and the "regularly tested" clause is what makes a one-off penetration report insufficient.',
    rule: 'You must implement "appropriate technical and organisational measures" — encryption, integrity, resilience, and the ability to demonstrate them on demand.',
    build: 'Security claims need evidence. Tamper-evident logging, scoped credentials, and verifiable integrity proofs are the artifacts an assessor actually asks for.',
    selfCheck: [
      'Could you produce evidence of security controls from the last 90 days — not just the policy that mandates them?',
      'Are credentials scoped and short-lived enough that a leak has a bounded blast radius?',
      'Is integrity verifiable — can you detect tampering inside your own audit trail?',
      'Do you test restores, or only backups?',
    ],
    pitfalls: [
      'Compliance-by-inventory: a spreadsheet of controls is not a technical measure — assessors want executed evidence.',
      'Encrypting storage while PII leaks through logs, error reports, and analytics side-channels.',
      'An "append-only" audit trail you can still UPDATE is decoration, not a control.',
    ],
    citations: [
      ['GDPR consolidated text — Art. 32 (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679'],
      ['GDPR.eu article mirror — Art. 32', 'https://gdpr-info.eu/art-32-gdpr/'],
    ],
    related: ['gdpr-art-33-breach', 'headers-csp', 'gdpr-art-17-erasure', 'dora-resilience'],
    engine: 'Hash-chained append-only audit vault with signed exports — integrity you verify cryptographically, not attest.',
  },
  {
    slug: 'gdpr-art-33-breach', framework: 'GDPR', chip: 'chip-g',
    docTitle: 'GDPR Art. 33 — 72-hour breach notification',
    title: 'Art. 33 — 72-hour breach notification',
    context: 'The 72-hour clock starts at "awareness" — read in guidance as the moment you had reasonable certainty a breach occurred, not when forensics conclude. Most organisations that miss the deadline did not lack tooling; they lacked an incident record that existed before the incident, so day one went to reconstructing events instead of reporting them.',
    rule: 'A personal-data breach must be reported to the supervisory authority within 72 hours of becoming aware — "where feasible". The clock is unforgiving if you discover late.',
    build: 'You need an incident record that exists before the incident: severity, detection time, containment, and a computed notification deadline — not a wiki page written during the panic.',
    selfCheck: [
      'Does detection timestamp the moment of awareness — not the moment forensics finished?',
      'Is the notification deadline computed automatically at incident creation?',
      'Can you answer "what data, how many subjects, which systems" in hours, not days?',
      'Is there a documented severity line between reportable and record-only incidents?',
    ],
    pitfalls: [
      'Treating "forensics complete" as the deadline start — awareness is earlier, and the clock is unforgiving.',
      'No incident ledger: reconstructing the timeline from chat threads under regulator scrutiny.',
      'Reporting every anomaly "to be safe" — over-reporting trains regulators to see noise, and still leaves you with records to maintain.',
    ],
    citations: [
      ['GDPR consolidated text — Art. 33 (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679'],
      ['GDPR.eu article mirror — Art. 33', 'https://gdpr-info.eu/art-33-gdpr/'],
    ],
    related: ['gdpr-art-32-security', 'gdpr-art-17-erasure', 'dora-resilience', 'data-residency'],
    engine: 'Incident ledger with Art. 33 deadlines computed at creation — the record exists when the regulator asks for it.',
  },
  {
    slug: 'eprivacy-cookies', framework: 'ePrivacy', chip: 'chip-g',
    docTitle: 'ePrivacy — cookie and tracking consent rules',
    title: 'ePrivacy — the cookie rule',
    context: 'The ePrivacy Directive — the "cookie law" — predates GDPR and is stricter in one way: consent is required for storing or accessing anything on the user\u2019s device, whether or not it is personal data. The "strictly necessary" exemption is narrow: session auth, CSRF tokens, load-balancer stickiness, shopping carts. Analytics and marketing pixels never qualify, and regulators — the CNIL especially — have fined major properties for scripts that fired before consent.',
    rule: 'Storing or accessing information on a user\u2019s device requires prior consent — except what is "strictly necessary" for the service the user asked for. Analytics and marketing pixels are never strictly necessary.',
    build: 'Either gate every non-essential script behind an opt-in banner, or ship nothing that needs one. Session auth and CSRF tokens are exempt; GA4 is not.',
    selfCheck: [
      'Does any non-essential storage or read happen before an affirmative opt-in? Third-party tags count.',
      'Is "reject" as easy as "accept" — same layer, same number of clicks?',
      'Have you audited localStorage/sessionStorage and fingerprinting, not just document.cookie?',
      'Is the consent-state record itself classified as strictly necessary?',
    ],
    pitfalls: [
      'Pre-consent pixels: a tag-manager analytics trigger firing on page load has already breached.',
      'Cookie walls misread as consent — nudging UX is dark-pattern territory under both ePrivacy and GDPR.',
      'Fingerprinting as a workaround: reading device identifiers without cookies is still "accessing information on the device".',
    ],
    citations: [
      ['ePrivacy Directive 2002/58/EC — consolidated (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058'],
    ],
    related: ['gdpr-art-5-minimisation', 'data-residency', 'gdpr-art-32-security'],
    engine: 'Zero third-party tracking by construction — functional sessions plus a first-party heartbeat only.',
  },
  {
    slug: 'wcag-2-1-1', framework: 'WCAG 2.2', chip: 'chip-s',
    docTitle: 'WCAG 2.1.1 — Keyboard operability',
    title: 'WCAG 2.1.1 — Keyboard operability',
    context: 'Level A keyboard operability separates "accessible in theory" from "accessible in fact". When it fails, it fails totally — a keyboard user cannot work around a dead menu the way they might squint past weak contrast. It is also where automated checks and real browsers diverge: a static check can see a click handler; only a real traversal sees a trap.',
    rule: 'All functionality must be operable through a keyboard interface, with no keyboard traps. Level A — failing it blocks users wholesale, not just inconveniently.',
    build: 'Every interactive element needs a reachable focus order and working focus styles. A widget that only works on hover, or that swallows Tab forever, fails this criterion.',
    selfCheck: [
      'Can you complete every task using only Tab, Shift+Tab, Enter, Escape, and arrow keys?',
      'Do modals trap focus inside — and return it to the trigger on close?',
      'Do hover-only controls have focus and keyboard equivalents?',
      'Can you reach and activate the page\u2019s least-used widget — footer toggles, overflow menus, chart controls?',
    ],
    pitfalls: [
      'The modal that leaks focus: Tab escapes to page content hidden behind the overlay.',
      'Custom widgets built on divs with onClick — no role, no key handler, invisible to keyboards and AT alike.',
      'Traps inside embedded content — a third-party widget that swallows keys is your failure, not theirs.',
    ],
    citations: [
      ['W3C — Understanding SC 2.1.1 Keyboard', 'https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html'],
      ['EN 301 549 — ETSI standards index', 'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/'],
    ],
    related: ['wcag-2-4-7', 'wcag-2-4-3', 'wcag-4-1-2', 'wcag-2-1-2'],
    engine: 'Tier-2 runner keyboard-reach probe — real-browser traversal, with presentational-utility exemptions for genuinely inert embeds.',
  },
  {
    slug: 'wcag-1-4-3', framework: 'WCAG 2.2', chip: 'chip-s',
    docTitle: 'WCAG 1.4.3 — Contrast minimum',
    title: 'WCAG 1.4.3 — Contrast minimum',
    context: 'Contrast minimum is the most commonly failed machine-detectable criterion on the web — WebAIM\u2019s Million report finds low-contrast text on the majority of homepages year after year. It is Level AA, the EN 301 549 conformance target, and it is uniquely fixable at the token layer: one low-contrast slate in a design system\u2019s palette fails every component that inherits it.',
    rule: 'Text needs 4.5:1 contrast against its background (3:1 for large text). Level AA — the most common machine-detectable failure on the web.',
    build: 'Fix it in the design tokens, not page by page — one low-contrast slate on a brand palette fails every page that uses it.',
    selfCheck: [
      'Do all text/background pairs clear 4.5:1 — 3:1 for large text (≥18pt or ≥14pt bold)?',
      'Does placeholder text pass? Placeholders count as text.',
      'Do hover, focus, and disabled states hold — states change computed contrast?',
      'Are ratios verified on rendered output, not just the design file?',
    ],
    pitfalls: [
      'The default gray: a #999-on-white "subtle" slate is the most common failure pattern in design systems.',
      'Text over imagery: a scrim that passes in the mockup fails at the image\u2019s light edges.',
      'axe alone is not conclusive — contrast over gradients and images needs visual judgement, not just DOM pairs.',
    ],
    citations: [
      ['W3C — Understanding SC 1.4.3 Contrast (Minimum)', 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html'],
      ['WebAIM Million — annual accessibility analysis', 'https://webaim.org/projects/million/'],
    ],
    related: ['wcag-1-4-11', 'wcag-1-4-12', 'wcag-1-4-1', 'wcag-2-1-1'],
    engine: 'axe contrast checks inside the Tier-2 audit run, rolled up into the criterion-level conformance report.',
  },
  {
    slug: 'wcag-4-1-2', framework: 'WCAG 2.2', chip: 'chip-s',
    docTitle: 'WCAG 4.1.2 — Name, role, value',
    title: 'WCAG 4.1.2 — Name, role, value',
    context: '4.1.2 keeps custom components honest: assistive technology cannot operate what it cannot name. Every control needs an accessible name, a programmatic role, and states that update live. It is Level A, and it is where bespoke date-pickers, toggles, and mega-menus break — the DOM looks right while the accessibility tree is empty.',
    rule: 'UI components must expose their name, role, state and value to assistive technology. Level A — the criterion custom widgets most often break.',
    build: 'Prefer semantic HTML; when you must go custom, ARIA roles and states are part of the component contract, not an afterthought.',
    selfCheck: [
      'Does every interactive element expose a name, role, and current state to the accessibility tree?',
      'Do ARIA states — aria-expanded, aria-checked, aria-selected — actually change on interaction?',
      'Are icon-only buttons labelled — aria-label or visually-hidden text?',
      'Does validation status reach AT — aria-invalid, live-region announcements?',
    ],
    pitfalls: [
      'ARIA present but never wired: aria-expanded="false" on a menu that is visibly open.',
      'Div-buttons: if it needs a click handler it is a component — without role and key handling it fails.',
      'Icon glyphs as names: a font-icon character is not an accessible name.',
    ],
    citations: [
      ['W3C — Understanding SC 4.1.2 Name, Role, Value', 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html'],
      ['WAI-ARIA Authoring Practices (APG)', 'https://www.w3.org/WAI/ARIA/apg/'],
    ],
    related: ['wcag-1-3-1', 'wcag-2-1-1', 'wcag-3-3-2', 'wcag-2-4-7'],
    engine: 'axe ruleset detection in the audit run — missing accessible names and misused roles surface as findings.',
  },
  {
    slug: 'headers-csp', framework: 'Security headers', chip: 'chip-s',
    docTitle: 'Content-Security-Policy — security headers reference',
    title: 'Content-Security-Policy',
    context: 'CSP occupies a special place in assessments: not a regulation, but the first evidence artifact a perimeter check produces. It declares which origins may load scripts, styles, frames, and connections — turning "we do not allow injected code" from a claim into an enforced policy. With XSS still a dominant vulnerability class, a missing or permissive CSP reads to an assessor as "XSS defense here is aspirational".',
    rule: 'CSP is not a regulation, but it is the header regulators and assessors look for as evidence of XSS defense-in-depth — and the first thing a perimeter scan checks.',
    build: 'Declare allowed script/style/connect sources explicitly. A permissive or missing CSP means injected markup can phone home freely.',
    selfCheck: [
      'Does script-src actually restrict origins — or is the policy "default-src *" theatre?',
      'Are unsafe-inline / unsafe-eval still present where a nonce or hash could replace them?',
      'Does it set frame-ancestors (clickjacking) and base-uri (base-tag injection)?',
      'Is there a reporting endpoint — and does anyone read the reports?',
    ],
    pitfalls: [
      'Report-only forever: a Content-Security-Policy-Report-Only header enforces nothing.',
      'Allowlisting a CDN that hosts user content — effectively allowlisting the internet.',
      'CSP in a meta tag cannot restrict frame-ancestors — it must be a response header.',
    ],
    citations: [
      ['W3C — Content Security Policy Level 3', 'https://www.w3.org/TR/CSP3/'],
      ['OWASP — Content Security Policy cheat sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html'],
    ],
    related: ['gdpr-art-32-security', 'dora-resilience', 'eprivacy-cookies'],
    engine: 'Perimeter header checks — shield headers and CSP posture are verified from the edge, no code access needed.',
  },
  {
    slug: 'eu-ai-act-inventory', framework: 'EU AI Act', chip: 'chip-s',
    docTitle: 'EU AI Act — model inventory and risk tiers',
    title: 'AI Act — model inventory & risk tiers',
    context: 'The AI Act (Regulation 2024/1689) is risk-tiered: prohibited practices, high-risk systems with heavy obligations, limited-risk transparency duties, minimal-risk free use — plus a separate regime for general-purpose models. Every obligation assumes you can first answer one question: which AI systems do you run, and in what role? A provider and a deployer of the same model carry different duties — most organisations are both.',
    rule: 'Providers and deployers must know which AI systems they operate, classify them by risk tier, and maintain the documentation trail proportionate to that tier.',
    build: 'Start with a registry: model, provider, risk tier, data provenance, oversight control. You cannot document what you have not inventoried.',
    selfCheck: [
      'Is there a registry of every AI system in production — model, provider, version, use-case?',
      'Is each entry classified by role (provider vs deployer) and risk tier?',
      'Are prohibited practices affirmatively ruled out and documented?',
      'Does the registry emit audit events on registration and tier changes?',
    ],
    pitfalls: [
      '"We don\u2019t do AI": embedded vendor features — CV screening, support chatbots, code assistants — make you a deployer anyway.',
      'Tier-by-instinct: risk classification is defined in the Annexes, not by gut feel.',
      'A registry kept in a slide deck goes stale — the inventory is an operational record, not a presentation.',
    ],
    citations: [
      ['AI Act — Regulation (EU) 2024/1689 (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689'],
    ],
    related: ['gdpr-art-5-minimisation', 'gdpr-art-32-security', 'dora-resilience', 'data-residency'],
    engine: 'Model registry endpoints — risk-tiered inventory with audit events on registration and tier changes.',
  },
  {
    slug: 'dora-resilience', framework: 'DORA', chip: 'chip-s',
    docTitle: 'DORA — ICT resilience requirements',
    title: 'DORA — ICT resilience',
    context: 'DORA (Regulation 2022/2554) applies to financial entities and their ICT third-party providers — which pulls SaaS vendors into scope through their customers\u2019 registers of information. Its core demand is provable resilience: classified incident handling, continuity testing, and a ledger of what broke and when. If you sell into EU finance, your customers\u2019 DORA register now includes you.',
    rule: 'Financial entities and their ICT providers must demonstrate operational resilience: incident handling, continuity, and the records to prove both.',
    build: 'Resilience is an architecture: circuit-breakers on external dependencies, dead-letter queues on async flows, and a ledger of what broke and when.',
    selfCheck: [
      'Do external dependencies fail closed — breakers, timeouts, dead-letters — or fail by hanging?',
      'Is there an incident ledger with severity classification, not a postmortem wiki?',
      'Can you evidence continuity testing — restores and failover — on a schedule?',
      'Are your ICT dependencies registered — would you appear correctly in a customer\u2019s register of information?',
    ],
    pitfalls: [
      'Resilience-by-uptime-number: "99.9%" is not evidence — incident records and tested recovery are.',
      'Retry storms masquerading as resilience: retries without a breaker turn a partial outage into a full one.',
      'Assuming DORA is the bank\u2019s problem — ICT providers get pulled in via contracts and registers.',
    ],
    citations: [
      ['DORA — Regulation (EU) 2022/2554 (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022R2554'],
    ],
    related: ['gdpr-art-33-breach', 'gdpr-art-32-security', 'data-residency', 'eu-ai-act-inventory'],
    engine: 'Redis-backed circuit breaker states, incident ledger, and dead-letter topics — resilience as records, not promises.',
  },
  {
    slug: 'data-residency', framework: 'Data residency', chip: 'chip-g',
    docTitle: 'EU/UK data residency — sovereign partitions',
    title: 'Sovereign partitions',
    context: 'GDPR\u2019s free-flow principle applies inside the EEA; Chapter V mechanisms — adequacy decisions, SCCs, binding corporate rules — govern exits. Since Schrems II, "where does it live" is an architecture question, not a marketing one. Enforcement repeatedly shows "data stays in the EU" claims failing at the support-tool, analytics, and disaster-recovery layers even when the primary database is genuinely European.',
    rule: 'GDPR lets data flow freely inside the EU; moving it elsewhere needs a Chapter V mechanism. For many buyers, "stays in Europe" is a hard procurement gate, not a preference.',
    build: 'Bind data to regions at the database layer, not the app layer — a misrouted write is a residency breach regardless of what the marketing page says.',
    selfCheck: [
      'Can you enumerate every system touching personal data — support tools, telemetry, error trackers, backups included?',
      'Is residency enforced at the routing and auth layer, or by convention in app code?',
      'Do admin and support access paths get the same treatment as data flows?',
      'Can a write ever land in the wrong region — is there a per-tenant home-partition guarantee?',
    ],
    pitfalls: [
      'Primary-in-EU, exhaust-everywhere: US-region error tracking and support tooling quietly defeats the residency story.',
      'Failover to "the other region" — a DR plan replicating outside the EEA is a residency breach waiting for a bad day.',
      'Region claims on the marketing page the database layer cannot verify.',
    ],
    citations: [
      ['GDPR consolidated text — Chapter V transfers (EUR-Lex)', 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679'],
      ['GDPR.eu mirror — Chapter 5', 'https://gdpr-info.eu/chapter-5/'],
    ],
    related: ['gdpr-art-5-minimisation', 'gdpr-art-17-erasure', 'dora-resilience', 'gdpr-art-32-security'],
    engine: 'Dual-node architecture: every tenant\u2019s data lives on exactly one partition — europe-west1 (Belgium) or europe-west2 (London) — routed and refused cross-border by the auth layer.',
  },
];

const FRAMEWORK_ORDER = ['GDPR', 'ePrivacy', 'WCAG 2.2', 'Security headers', 'EU AI Act', 'DORA', 'Data residency'];

TOPICS.forEach((t) => { t.updated = TOPICS_DATE; });

// --- Programmatic WCAG stubs (Phase C, HCS-safe) ----------------------------
// One stub per WCAG 2.2 A/AA criterion from the engine's own registry.
// The three hand-written TOPICS above cover 2.1.1 / 1.4.3 / 4.1.2 — the
// resolver prefers a TOPICS article whenever a stub slug collides.
const WCAG_CRITERIA = allCriteria();
const WCAG_BY_SLUG = new Map(
  WCAG_CRITERIA.map((c) => [`wcag-${c.criterionId.replace(/\./g, '-')}`, c])
);
const WCAG_PRINCIPLES = ['perceivable', 'operable', 'understandable', 'robust'];

// Hand-polished stub notes — extra value beyond the registry fields. A stub
// is indexable only while it has notes here OR a TOPICS article covers it
// (HCS-safe: no thin programmatic page gets indexed).
const STUB_NOTES = {
  '1.1.1': {
    example:
      'Correct: <img src="chart.png" alt="Q3 retention: 84%">. Incorrect: alt="" on a chart that carries meaning, or alt="chart.png" describing the file not the content.',
    pitfall:
      'Decorative images must have EMPTY alt — giving them text forces screen readers to announce noise.',
  },
  '1.3.1': {
    example:
      'Correct: <ul><li> for lists, <th scope="col"> for header cells, <label for> for inputs. Incorrect: div-soup styled to look like a table — visuals carry structure assistive tech cannot see.',
    pitfall:
      'The most-failed structural criterion on the web: if the relationship is only conveyed visually (position, grouping, font size), it fails.',
  },
  '2.4.3': {
    example:
      'Correct: DOM order matches visual order so Tab moves predictably. Incorrect: positive tabindex values or a modal rendered last-in-DOM — focus jumps erratically around the page.',
    pitfall: 'Never use tabindex="1" or higher — fix the DOM order instead.',
  },
  '2.4.4': {
    example:
      'Correct: <a href="/report">Download the Q3 accessibility report</a>. Incorrect: "click here" / "read more" — the link text alone must convey its purpose out of context.',
    pitfall:
      'Screen-reader users navigate by links list — a page full of "click here" gives them a list of identical, meaningless entries.',
  },
  '2.4.7': {
    example:
      'Correct: a visible :focus-visible outline on every interactive element. Incorrect: outline:none with no replacement — keyboard users lose their place entirely.',
    pitfall:
      'Removing the default outline without a visible replacement is the single most common 2.4.7 failure.',
  },
  '3.1.1': {
    example:
      'Correct: <html lang="en"> (or lang="de" for German content). Incorrect: no lang attribute — screen readers guess the language and mispronounce everything.',
    pitfall:
      'One attribute on the root element covers the whole page — the cheapest WCAG fix that exists.',
  },
  '3.3.2': {
    example:
      'Correct: <label for="email">Email</label><input id="email">. Incorrect: a bare placeholder attribute — it disappears on focus and is not an accessible name.',
    pitfall: 'Placeholder text is not a label — it fails as soon as the user starts typing.',
  },
  '1.2.2': {
    example:
      'Correct: synchronised captions covering all speech and meaningful sound on prerecorded video — a <track kind="captions"> element or reviewed burned-in text. Incorrect: auto-generated captions published unreviewed, or claiming the video is "just decoration" when it carries information.',
    pitfall: 'Auto-captions are a draft, not a deliverable — unreviewed machine captions fail because their errors change meaning.',
  },
  '1.4.1': {
    example:
      'Correct: an invalid field shows a red border AND an icon with text ("Email is required"). Incorrect: colour as the only signal — a red-bordered field with no message, or a chart whose series differ only by hue.',
    pitfall: '"It is also in the legend" does not save a chart where two series differ only by colour — add pattern, shape, or direct labels.',
  },
  '1.4.4': {
    example:
      'Correct: at 200% zoom every control and block of text stays readable and usable with no loss of content or functionality. Incorrect: fixed-height containers that clip enlarged text, or zoom pinned via the viewport meta tag.',
    pitfall: 'maximum-scale=1 or user-scalable=no in the viewport tag is an instant failure on mobile — never pin user zoom.',
  },
  '1.4.10': {
    example:
      'Correct: at a 320 CSS-pixel width the page reflows vertically with no horizontal scrolling. Incorrect: a two-column layout that forces sideways scrolling, or data tables with no overflow handling.',
    pitfall: 'Test at a real 320px viewport, not just device emulation — sticky headers and wide tables are the usual offenders.',
  },
  '1.4.11': {
    example:
      'Correct: input borders, focus indicators, meaningful icons, and control boundaries hit 3:1 against adjacent colours. Incorrect: a 1.5:1 input border "because it is subtle", or a focus ring that disappears on the brand background.',
    pitfall: 'Focus indicators are the silent failure — a barely-visible 1.8:1 ring technically "exists" but fails this criterion.',
  },
  '1.4.12': {
    example:
      'Correct: content survives user stylesheet overrides — line-height 1.5\u00d7, letter-spacing 0.12em, word-spacing 0.16em, paragraph spacing 2\u00d7 — with nothing clipped or overlapped. Incorrect: fixed-height text blocks that truncate when spacing grows.',
    pitfall: 'overflow:hidden plus a fixed height is the classic fail — text spacing must be able to expand.',
  },
  '2.1.2': {
    example:
      'Correct: Tab into any component and Shift+Tab, Escape, or arrows always get you out — modals release focus on close. Incorrect: focus stuck inside an iframe widget or a rich-text editor with no documented exit.',
    pitfall: 'Embedded third-party widgets are your trap too — if a user cannot leave a captcha or editor by keyboard alone, the page fails.',
  },
  '2.4.1': {
    example:
      'Correct: a "Skip to content" link as the first focusable element, plus landmark regions (<main>, <nav>) for AT users. Incorrect: forty navigation links to Tab through on every single page.',
    pitfall: 'Landmarks without a skip link help screen readers but not sighted keyboard users — use both.',
  },
  '2.4.2': {
    example:
      'Correct: a unique, descriptive <title> per page ("Contrast minimum — WCAG 1.4.3 — Compliance Audit"). Incorrect: the same site name on every route, or a title describing the app rather than the view.',
    pitfall: 'SPAs that never update document.title on route change leave users stranded — the title is the page\u2019s identity in history and tab lists.',
  },
  '2.4.6': {
    example:
      'Correct: headings describe the section they open and labels describe their control ("Search", "Filter by status"). Incorrect: a "Details" heading over a pricing table, or duplicate "Edit" labels on unrelated actions.',
    pitfall: 'Descriptive is not the same as unique — the criterion wants topic-describing headings, not merely non-empty ones.',
  },
  '2.5.3': {
    example:
      'Correct: the visible "Download" text is contained in the accessible name — aria-label="Download Q3 report" includes the visible words. Incorrect: a visible "Download" button with aria-label="Get file" — a speech user saying "click Download" hits nothing.',
    pitfall: 'The accessible name should start with the visible label — voice-control users only ever see the visible text.',
  },
  '2.5.8': {
    example:
      'Correct: pointer targets are at least 24\u00d724 CSS pixels, or spaced so a 24px circle fits between adjacent centres. Incorrect: 12px icon buttons packed into a toolbar, or dense pagination dots.',
    pitfall: 'Inline text links inside paragraphs are exempt — icon buttons and pagination dots are not, and spacing counts toward the size.',
  },
  '3.3.1': {
    example:
      'Correct: the error is identified in text and tied to its field — "Email: enter an address like name@example.com". Incorrect: only a red border, or a summary banner that never says which fields failed.',
    pitfall: 'Colour alone never identifies an error — the message must name the field and the problem.',
  },
  '4.1.3': {
    example:
      'Correct: status updates are announced via role="status" or an aria-live region — "3 results", "Saved" — without moving focus. Incorrect: toast notifications that appear visually but never reach the accessibility tree.',
    pitfall: 'The live region must exist before the message renders — injecting region and message in the same tick announces nothing.',
  },
};

// Indexable WCAG slugs = the 3 manual TOPICS + stubs carrying STUB_NOTES.
const POLISHED_WCAG = new Set(
  WCAG_CRITERIA.filter((c) => STUB_NOTES[c.criterionId])
    .map((c) => `wcag-${c.criterionId.replace(/\./g, '-')}`)
);

// W3C Understanding doc slugs are the criterion name lowercased/kebab-cased
// with parenthetical qualifiers flattened in — e.g. "Link Purpose (In
// Context)" → link-purpose-in-context. Holds across the 2.2 A/AA set.
function understandingSlug(name) {
  return name
    .toLowerCase()
    .replace(/[()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Same-principle neighbours first, then registry-adjacent criteria — a stub's
// most useful onward hops are the criteria auditors hit together.
function relatedCriteria(c, L, n = 4) {
  const slugOf = (x) => `wcag-${x.criterionId.replace(/\./g, '-')}`;
  const isIndexable = (x) => POLISHED_WCAG.has(slugOf(x)) || TOPICS.some((t) => t.slug === slugOf(x));
  const idx = WCAG_CRITERIA.findIndex((x) => x.criterionId === c.criterionId);
  const candidates = [
    ...WCAG_CRITERIA.filter((x) => x.principle === c.principle && x.criterionId !== c.criterionId && isIndexable(x)),
    WCAG_CRITERIA[idx - 1],
    WCAG_CRITERIA[idx + 1],
    WCAG_CRITERIA[idx - 2],
    WCAG_CRITERIA[idx + 2],
    ...WCAG_CRITERIA.filter((x) => x.principle === c.principle && x.criterionId !== c.criterionId),
  ].filter(Boolean);
  const seen = new Set();
  return candidates
    .filter((x) => x.criterionId !== c.criterionId && !seen.has(x.criterionId) && seen.add(x.criterionId))
    .slice(0, n)
    .map((x) => ({ slug: slugOf(x), title: `WCAG ${x.criterionId} — ${L.names[x.criterionId] || x.name}` }));
}

function stubArticle(c, L) {
  const slug = `wcag-${c.criterionId.replace(/\./g, '-')}`;
  // Indexable-in-locale requires notes written FOR that locale — never fall
  // back to English notes for polish status (honesty rule).
  const notes = (L.locale === DEFAULT_LOCALE ? STUB_NOTES : L.notes)[c.criterionId];
  const name = L.names[c.criterionId] || c.name;
  const level = t(L.strings, 'stub.level', { level: c.level });
  const en = c.en301549Clause
    ? t(L.strings, 'stub.enMapped', { clause: c.en301549Clause })
    : t(L.strings, 'stub.enUnmapped');
  const auto = c.fullyAutomated
    ? t(L.strings, 'stub.auto.full')
    : c.tier && c.tier.length
      ? t(L.strings, 'stub.auto.partial', { tiers: c.tier.join('/') })
      : t(L.strings, 'stub.auto.manual');
  const sources = [
    [t(L.strings, 'stub.sourceW3c', { id: c.criterionId, name }), `https://www.w3.org/WAI/WCAG22/Understanding/${understandingSlug(c.name)}.html`],
  ];
  if (c.en301549Clause) {
    sources.push([t(L.strings, 'stub.sourceEn', { clause: c.en301549Clause }), 'https://www.etsi.org/deliver/etsi_en/301500_301599/301549/']);
  }
  return {
    slug,
    framework: 'WCAG 2.2',
    chip: 'chip-s',
    docTitle: `WCAG ${c.criterionId} ${name} (${level})`,
    title: `WCAG ${c.criterionId} — ${name}`,
    rule: t(L.strings, 'stub.rule', {
      id: c.criterionId, name, level, en,
      principle: t(L.strings, `principle.${c.principle}.name`),
    }),
    build: notes
      ? `${notes.example} ${notes.pitfall}`
      : t(L.strings, 'stub.buildGeneric'),
    engine: t(L.strings, 'stub.engine', { auto }),
    sources,
    related: relatedCriteria(c, L),
    stub: true,
    polished: Boolean(notes),
    updated: REGISTRY_DATE,
    criterion: c,
  };
}

function resolveArticle(slug, L) {
  const t0 = TOPICS.find((x) => x.slug === slug);
  if (t0) return { article: localizeTopic(t0, L.topics), polished: true };
  const c = WCAG_BY_SLUG.get(slug);
  if (c) {
    const stub = stubArticle(c, L);
    return { article: stub, polished: stub.polished };
  }
  return null;
}

// --- SEO / discovery helpers -------------------------------------------------

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function jsonLd(obj) {
  return `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
}

function breadcrumbLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${ORIGIN}${url}`,
    })),
  };
}

function orgLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${ORIGIN}/#org`,
    name: 'Sovereign Compliance Engine',
    url: PORTAL,
    logo: `${ORIGIN}/og/logo.png`,
    description:
      'Independent EU-based compliance verification engine — perimeter checks, WCAG conformance, GDPR erasure and tamper-evident audit trails on sovereign EU/UK infrastructure.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@compliance-audit.eu',
    },
    sameAs: [
      'https://compliance-audit.eu',
      'https://github.com/Terrygilligan',
      'https://github.com/Terrygilligan/compliance-audit-verify-action',
    ],
  };
}

// Shared <head> extras: canonical + OG + robots + JSON-LD. ogImage is a path
// under /og/ served by the ASSETS binding. type='article' adds article:* OG
// tags — pass published/modified dates when using it.
function headMeta({
  title,
  desc,
  canonical,
  og = '/og/site.png',
  robots = 'index, follow',
  type = 'website',
  published,
  modified,
  section,
  ld = [],
  locale = DEFAULT_LOCALE,
  alternates = [],
}) {
  const article =
    type === 'article'
      ? `<meta property="article:published_time" content="${published}">
<meta property="article:modified_time" content="${modified || published}">
${section ? `<meta property="article:section" content="${esc(section)}">` : ''}`
      : '';
  const ogAlt = Object.entries(LOCALES)
    .filter(([code, cfg]) => code !== locale && cfg.active)
    .map(([, cfg]) => `<meta property="og:locale:alternate" content="${cfg.ogLocale}">`)
    .join('\n');
  const hreflang = alternates
    .map(([hl, u]) => `<link rel="alternate" hreflang="${hl}" href="${u}">`)
    .join('\n');
  return `<title>${esc(title)}</title>
<meta name="description" content="${esc(desc).slice(0, 160)}">
<link rel="canonical" href="${ORIGIN}${canonical}">
${hreflang}
<meta name="robots" content="${robots}">
<meta property="og:type" content="${type}">
<meta property="og:site_name" content="Compliance Audit reference">
<meta property="og:locale" content="${LOCALES[locale]?.ogLocale || 'en_GB'}">
${ogAlt}
<meta property="og:url" content="${ORIGIN}${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc).slice(0, 200)}">
<meta property="og:image" content="${ORIGIN}${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(title)}">
${article}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc).slice(0, 200)}">
<meta name="twitter:image" content="${ORIGIN}${og}">
${ld.map(jsonLd).join('\n')}`;
}

// FNV-1a 32-bit content hash — weak ETag so crawlers/proxies can revalidate
// with If-None-Match and get a 304 instead of a full body.
function etag(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `W/"${(h >>> 0).toString(16)}"`;
}

// HTML response with validators: weak ETag (304 on If-None-Match) +
// Last-Modified. `extra` merges per-route headers (e.g. x-robots-tag).
function htmlResponse(request, html, { status = 200, lastModified, extra = {} } = {}) {
  const tag = etag(html);
  const headers = {
    ...SECURITY_HEADERS,
    etag: tag,
    ...(lastModified ? { 'last-modified': lastModified } : {}),
    ...extra,
  };
  if (request.headers.get('if-none-match') === tag) {
    return new Response(null, { status: 304, headers });
  }
  return new Response(html, { status, headers });
}

// Zero-JS telemetry: forward the real visitor's cf-connecting-ip + referer in
// the body — the engine's heartbeat accepts {ip, ref} for edge beacons; without
// it our own egress IP would dedup all visitors into PoP buckets. waitUntil so
// the response never waits on telemetry.
function ping(request, ctx, path) {
  const body = JSON.stringify({
    path,
    ip: request.headers.get('cf-connecting-ip') || undefined,
    ref: request.headers.get('referer') || undefined,
    ua: request.headers.get('user-agent') || undefined,
  });
  ctx.waitUntil(
    fetch(TELEMETRY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
    }).catch(() => {})
  );
}

const TEXT_HEADERS = { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=60' };
const XML_HEADERS = { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=60' };

function robotsTxt() {
  return `# compliance-audit.info — public reference surface; everything is indexable.
# Search and AI crawlers alike are welcome — /llms.txt maps the content for
# agents and cross-references the engine API surface (api.compliance-audit.eu).
User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;
}

function sitemapXml() {
  const urls = [
    { loc: '/', priority: '1.0', changefreq: 'weekly', lastmod: TOPICS_DATE },
    { loc: '/rules', priority: '0.9', changefreq: 'weekly', lastmod: REGISTRY_DATE },
    ...TOPICS.map((t) => ({ loc: `/rules/${t.slug}`, priority: '0.8', changefreq: 'monthly', lastmod: t.updated })),
    // Indexable stubs only — submitting noindex URLs wastes crawl budget and
    // floods GSC with "submitted URL marked noindex" warnings. Unpolished
    // stubs stay crawlable via /rules links and join here when STUB_NOTES land.
    ...[...POLISHED_WCAG]
      .filter((s) => !TOPICS.some((t) => t.slug === s))
      .map((s) => ({ loc: `/rules/${s}`, priority: '0.7', changefreq: 'monthly', lastmod: REGISTRY_DATE })),
  ];
  const alts = (p) =>
    alternatesFor(p)
      .map(([hl, u]) => `    <xhtml:link rel="alternate" hreflang="${hl}" href="${u}"/>`)
      .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (u) => `  <url>
    <loc>${ORIGIN}${u.loc}</loc>
${alts(u.loc)}
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
}

function llmsTxt() {
  return `# compliance-audit.info — compliance rules reference

> Public technical reference for the Sovereign Compliance Engine
> (compliance-audit.eu): regulatory rules explained as build requirements,
> plus the complete WCAG 2.2 A/AA success-criteria catalog. The engine
> verifies these surfaces from the perimeter — no source-code access.

## Hand-written rule hubs (/rules/<slug>)
${TOPICS.map((t) => `- [${t.title}](${ORIGIN}/rules/${t.slug}) — ${t.framework}`).join('\n')}

## WCAG 2.2 success criteria
- ${WCAG_CRITERIA.length} A/AA criteria at ${ORIGIN}/rules/wcag-<id> (e.g. ${ORIGIN}/rules/wcag-2-1-1)

## Live API (spoke: compliance-audit.eu)
- [Health](https://api.compliance-audit.eu/health) — node/partition health
- POST /v1/sanitize — PII redaction (SSN, card, email, phone, keys)
- POST /v1/audit — WCAG 2.2 accessibility audit
- POST /v1/assess — compliance assessment
- GET /badges/:id.svg — HMAC-signed compliance badges
- POST /v1/demo/keys — free demo key (developer beta)

## Product surfaces
- [Portal](${PORTAL}) · [Trust](${TRUST}) · [Proof](${PROOF}) · [Verify](${PORTAL}/verify)
`;
}

async function nodeHealth(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) return { ok: false };
    const j = await res.json();
    return { ok: true, status: j.status, region: j.audit?.region || '', db: j.database || '', location: j.audit?.location || '' };
  } catch {
    return { ok: false };
  }
}

// Isolate-scoped health cache — 60s TTL so a homepage hit doesn't pay two
// Cloud Run round-trips (worst case was 2.5s of timeout stalls). The cache
// holds whatever the probes actually said — a down node still renders
// UNREACHABLE, just 60s stale at most.
let healthCache = null;
async function nodeHealthCached() {
  if (healthCache && Date.now() - healthCache.ts < 60_000) return healthCache;
  const [eu, uk] = await Promise.all([
    nodeHealth(EU_HEALTH).catch(() => ({ ok: false })),
    nodeHealth(UK_HEALTH).catch(() => ({ ok: false })),
  ]);
  healthCache = { ts: Date.now(), eu, uk };
  return healthCache;
}

function nodeCard(name, zone, h, S) {
  const chip = h.ok
    ? `<span class="chip chip-g">${icon('check', '')} ${t(S, 'home.status.operational')}</span>`
    : `<span class="chip chip-r">${t(S, 'home.status.unreachable')}</span>`;
  const meta = h.ok
    ? `${h.db} · ${h.region} · ${h.location}`
    : t(S, 'home.status.noresp', { zone });
  return `<div class="card node">
    <div class="node-top"><span class="node-name">${icon('server', '')} ${name}</span>${chip}</div>
    <div class="node-meta">${meta}</div>
  </div>`;
}

function commitment(ic, title, body) {
  return `<div class="card"><div class="card-h"><span class="ic">${icon(ic, '')}</span><h3>${title}</h3></div><p>${body}</p></div>`;
}

function topicPage(article, generatedAt, { polished = true, L } = {}) {
  const t0 = article;
  const S = L.strings;
  const canonical = `${locPath(L.locale, `/rules/${t0.slug}`)}`;
  const ogImage = `${ORIGIN}${t0.stub ? '/og/wcag.png' : `/og/${t0.slug}.png`}`;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: t0.title,
    description: t0.rule.slice(0, 200),
    inLanguage: L.locale,
    isAccessibleForFree: true,
    image: ogImage,
    datePublished: t0.updated,
    dateModified: t0.updated,
    about: t0.framework,
    author: { '@id': `${ORIGIN}/#org` },
    publisher: { '@id': `${ORIGIN}/#org` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${ORIGIN}${canonical}` },
  };
  const crumbs = breadcrumbLd([
    [t(S, 'crumb.home'), locPath(L.locale, '/')],
    [t(S, 'crumb.rules'), locPath(L.locale, '/rules')],
    [t0.title, canonical],
  ]);
  const sources = t0.citations || t0.sources || [];
  const related = (t0.related || [])
    .map((r) => (typeof r === 'string' ? resolveArticle(r, L)?.article : r))
    .filter(Boolean)
    .map((a) => ({ slug: a.slug, title: a.title }));
  const checklist = (title, items, marker) => `<div class="card rule"><h3>${title}</h3><ul class="rule-list">${items
    .map((i) => `<li>${marker} ${esc(i)}</li>`)
    .join('')}</ul></div>`;
  const shortTitle = t0.stub && t0.criterion ? `WCAG ${t0.criterion.criterionId}` : t0.title;
  const reviewed = t0.stub
    ? t(S, 'article.reviewedStub', { date: t0.updated })
    : t(S, 'article.reviewed', { date: t0.updated });
  const home = locPath(L.locale, '/');
  const rulesHome = locPath(L.locale, '/rules');
  return `<!DOCTYPE html>
<html lang="${L.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: `${t0.docTitle || t0.title} — ${t(S, 'meta.suffix')}`,
  desc: t0.rule,
  canonical,
  og: t0.stub ? '/og/wcag.png' : `/og/${t0.slug}.png`,
  type: 'article',
  published: t0.updated,
  modified: t0.updated,
  section: t0.framework,
  robots: polished ? 'index, follow' : 'noindex, follow',
  ld: [articleLd, crumbs, orgLd()],
  locale: L.locale,
  alternates: alternatesFor(`/rules/${t0.slug}`),
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}
.back{font-size:.75rem;color:#64748b;text-decoration:none;display:inline-flex;align-items:center;gap:.25rem;margin-bottom:1rem}
.back:hover{color:#334155}
.rule h3{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:.375rem}
.rule p{font-size:.875rem;color:#334155;line-height:1.7}
.rule-list{margin:.25rem 0 0;padding-left:1rem;list-style:none}
.rule-list li{font-size:.8125rem;color:#334155;line-height:1.65;margin-bottom:.5rem}
.rule-list li a{color:#059669;text-decoration:none}
.rule-list li a:hover{text-decoration:underline}
.rule-eng{margin-top:1rem;padding:.875rem 1rem;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:.5rem}
.rule-eng p{color:#065f46;font-size:.8125rem}
.cta-actions{display:flex;gap:1.25rem;flex-wrap:wrap;align-items:center}
</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="${home}">${BRAND_SVG}<span>${t(S, 'chrome.brand')}</span></a>
  <div class="hd-right"><span class="tag">${t(S, 'chrome.tag.reference')}</span><a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">${t(S, 'chrome.engine')} ${icon('arrowRight', '')}</a></div>
</div></header>
<section><div class="wrap" style="padding-top:2.5rem">
  <nav aria-label="Breadcrumb" class="back"><a href="${home}" style="color:#64748b;text-decoration:none">${t(S, 'crumb.home')}</a> / <a href="${rulesHome}" style="color:#64748b;text-decoration:none">${t(S, 'crumb.rules')}</a> / ${esc(t0.title)}</nav>
  <div class="kicker">${t0.framework.toUpperCase()} / ${t(S, 'article.kicker')}</div>
  <h1 style="font-size:1.875rem">${esc(t0.title)}</h1>
  ${t0.context ? `<p class="sub">${esc(t0.context)}</p>` : ''}
  <div class="grid2" style="margin-top:1.5rem">
    <div class="card rule"><h3>${t(S, 'article.rule')}</h3><p>${esc(t0.rule)}</p></div>
    <div class="card rule"><h3>${t(S, 'article.build')}</h3><p>${esc(t0.build)}</p></div>
  </div>
  ${t0.selfCheck || t0.pitfalls ? `<div class="grid2" style="margin-top:1rem">
    ${t0.selfCheck ? checklist(t(S, 'article.selfcheck'), t0.selfCheck, icon('check', '')) : ''}
    ${t0.pitfalls ? checklist(t(S, 'article.pitfalls'), t0.pitfalls, icon('zap', '')) : ''}
  </div>` : ''}
  <div class="card rule-eng"><h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#065f46;margin-bottom:.25rem">${t(S, 'article.engine')}</h3><p>${esc(t0.engine)}</p></div>
  ${sources.length || related.length ? `<div class="grid2" style="margin-top:1rem">
    ${sources.length ? `<div class="card rule"><h3>${t(S, 'article.sources')}</h3><ul class="rule-list">${sources
      .map(([l, u]) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${esc(l)} ${icon('arrowRight', '')}</a></li>`)
      .join('')}</ul></div>` : ''}
    ${related.length ? `<div class="card rule"><h3>${t(S, 'article.related')}</h3><ul class="rule-list">${related
      .map((r) => `<li><a href="${locPath(L.locale, `/rules/${r.slug}`)}">${esc(r.title)}</a></li>`)
      .join('')}</ul></div>` : ''}
  </div>` : ''}
  <p class="note" style="margin-top:1rem">${reviewed}</p>
</div></section>
<div class="wrap"><div class="cta-band">
  <p>${esc(t(S, 'article.cta.text', { topic: shortTitle }))}</p>
  <div class="cta-actions">
    <a href="${PROOF}" target="_blank" rel="noopener noreferrer">${t(S, 'cta.proof')} ${icon('arrowRight', '')}</a>
    <a href="${SCAN}" target="_blank" rel="noopener noreferrer">${t(S, 'cta.scan')} ${icon('arrowRight', '')}</a>
  </div>
</div></div>
<footer><div class="wrap"><div class="f-row">
  <span>${t(S, 'footer.generated', { date: generatedAt })}</span>
  <div class="f-links"><a href="${TRUST}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.trust')}</a><a href="${SCAN}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.scan')}</a><a href="${VERIFY}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.verify')}</a><a href="mailto:support@compliance-audit.eu">support@compliance-audit.eu</a><a href="${APP}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.signin')}</a></div>
</div></div></footer>
</body>
</html>`;
}

function indexSection(L) {
  const S = L.strings;
  return `<section id="index" style="background:#fff;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0"><div class="wrap">
  <div class="sec-head"><div><h2>${t(S, 'home.index.h2')}</h2><p class="sec-sub">${t(S, 'home.index.sub')}</p></div></div>
  ${FRAMEWORK_ORDER.map((f) => `
    <h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:1.25rem 0 .5rem">${t(S, `fw.${f}`)}</h3>
    <div class="grid2">
      ${TOPICS.filter((x) => x.framework === f).map((x) => localizeTopic(x, L.topics)).map((x) => `
        <a href="${locPath(L.locale, `/rules/${x.slug}`)}" class="card" style="text-decoration:none;display:block">
          <div class="card-h"><h3 style="color:#0f172a">${esc(x.title)}</h3></div>
          <p style="color:#475569">${esc(x.rule.slice(0, 110))}…</p>
        </a>`).join('')}
    </div>`).join('')}
</div></section>`;
}

function rulesIndexPage(generatedAt, L) {
  const S = L.strings;
  const hubFrameworks = FRAMEWORK_ORDER.filter((f) => f !== 'WCAG 2.2');
  const wcagCard = (slug, name, level, polished) => `
    <a href="${locPath(L.locale, `/rules/${slug}`)}" class="card" style="text-decoration:none;display:block">
      <div class="card-h" style="justify-content:space-between">
        <h3 style="color:#0f172a">${esc(name)}</h3>
        <span class="chip ${polished ? 'chip-g' : 'chip-s'}">${t(S, 'stub.level', { level })}${polished ? ` · ${t(S, 'rules.indepth')}` : ''}</span>
      </div>
    </a>`;
  return `<!DOCTYPE html>
<html lang="${L.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: t(S, 'meta.rules.title', { site: t(S, 'meta.suffix') }),
  desc: t(S, 'meta.rules.desc'),
  canonical: locPath(L.locale, '/rules'),
  ld: [breadcrumbLd([[t(S, 'crumb.home'), locPath(L.locale, '/')], [t(S, 'crumb.rules'), locPath(L.locale, '/rules')]]), orgLd()],
  locale: L.locale,
  alternates: alternatesFor('/rules'),
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="${locPath(L.locale, '/')}">${BRAND_SVG}<span>${t(S, 'chrome.brand')}</span></a>
  <div class="hd-right"><span class="tag">${t(S, 'chrome.tag.index')}</span><a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">${t(S, 'chrome.engine')} ${icon('arrowRight', '')}</a></div>
</div></header>
<section><div class="wrap" style="padding-top:2.5rem">
  <div class="kicker">${t(S, 'rules.kicker')}</div>
  <h1 style="font-size:1.875rem">${t(S, 'rules.h1')}</h1>
  <p class="sub">${t(S, 'rules.sub')}</p>

  ${hubFrameworks.map((f) => `
    <h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:1.75rem 0 .5rem">${t(S, `fw.${f}`)}</h3>
    <div class="grid2">
      ${TOPICS.filter((x) => x.framework === f).map((x) => localizeTopic(x, L.topics)).map((x) => `
        <a href="${locPath(L.locale, `/rules/${x.slug}`)}" class="card" style="text-decoration:none;display:block">
          <div class="card-h"><h3 style="color:#0f172a">${esc(x.title)}</h3></div>
          <p style="color:#475569">${esc(x.rule.slice(0, 110))}…</p>
        </a>`).join('')}
    </div>`).join('')}

  <h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:1.75rem 0 .5rem">${t(S, 'rules.wcagHead', { count: WCAG_CRITERIA.length })}</h3>
  ${WCAG_PRINCIPLES.map((p) => `
    <h4 style="font-size:.8125rem;font-weight:600;color:#334155;margin:1rem 0 .25rem">${t(S, `principle.${p}.label`)}</h4>
    <p style="font-size:.75rem;color:#64748b;margin:0 0 .5rem;max-width:44rem">${t(S, `principle.${p}.blurb`)}</p>
    <div class="grid3">
      ${WCAG_CRITERIA.filter((c) => c.principle === p).map((c) => {
        const slug = `wcag-${c.criterionId.replace(/\./g, '-')}`;
        const polished = TOPICS.some((x) => x.slug === slug) || POLISHED_WCAG.has(slug);
        return wcagCard(slug, `${c.criterionId} ${L.names[c.criterionId] || c.name}`, c.level, polished);
      }).join('')}
    </div>`).join('')}
</div></section>
<footer><div class="wrap"><div class="f-row">
  <span>${t(S, 'footer.generated', { date: generatedAt })}</span>
  <div class="f-links"><a href="${TRUST}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.trust')}</a><a href="${SCAN}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.scan')}</a><a href="${VERIFY}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.verify')}</a><a href="mailto:support@compliance-audit.eu">support@compliance-audit.eu</a><a href="${APP}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.signin')}</a></div>
</div></div></footer>
</body>
</html>`;
}

function notFoundPage(generatedAt, L) {
  const S = L.strings;
  return `<!DOCTYPE html>
<html lang="${L.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: t(S, 'meta.404.title', { site: t(S, 'meta.suffix') }),
  desc: t(S, 'meta.404.desc'),
  canonical: locPath(L.locale, '/404'),
  og: '/og/site.png',
  robots: 'noindex, nofollow',
  locale: L.locale,
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="${locPath(L.locale, '/')}">${BRAND_SVG}<span>${t(S, 'chrome.brand')}</span></a>
  <div class="hd-right"><span class="tag">${t(S, 'chrome.tag.404')}</span><a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">${t(S, 'chrome.engine')} ${icon('arrowRight', '')}</a></div>
</div></header>
<section><div class="wrap" style="padding-top:4rem;padding-bottom:4rem">
  <div class="kicker">${t(S, '404.kicker')}</div>
  <h1 style="font-size:1.875rem">${t(S, '404.h1')}</h1>
  <p class="sub">${t(S, '404.sub', { count: WCAG_CRITERIA.length })}</p>
  <div class="cta-row">
    <a class="btn btn-em" href="${locPath(L.locale, '/rules')}">${t(S, '404.ctaIndex')} ${icon('arrowRight', '')}</a>
    <a class="btn btn-ghost" href="${locPath(L.locale, '/')}">${t(S, '404.ctaHome')}</a>
  </div>
</div></section>
<footer><div class="wrap"><div class="f-row">
  <span>${t(S, 'footer.generated', { date: generatedAt })}</span>
  <div class="f-links"><a href="${TRUST}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.trust')}</a><a href="${SCAN}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.scan')}</a><a href="${VERIFY}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.verify')}</a><a href="mailto:support@compliance-audit.eu">support@compliance-audit.eu</a></div>
</div></div></footer>
</body>
</html>`;
}

function page(eu, uk, generatedAt, L) {
  const S = L.strings;
  const zip = (icons, rows) => icons.map((ic, i) => [ic, ...rows[i]]);
  const standards = zip(['scale', 'zap', 'server', 'a11y'], t(S, 'home.standards'));
  const commitments = zip(['eyeOff', 'cookie', 'fingerprint', 'trash', 'database', 'lock'], t(S, 'home.commitments'));
  const stats = [
    ['fileJson', '5+', 'home.stats.pii'],
    ['lock', 'HMAC-SHA256', 'home.stats.badge'],
    ['activity', '6 tiers', 'home.stats.retention'],
    ['mapPin', 'EU + UK', 'home.stats.residency'],
  ].map(([ic, v, k]) => [ic, t(S, k)[0], v, t(S, k)[1]]);

  return `<!DOCTYPE html>
<html lang="${L.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: t(S, 'meta.home.title'),
  desc: t(S, 'meta.home.desc'),
  canonical: locPath(L.locale, '/'),
  ld: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Compliance Audit reference',
      url: ORIGIN,
      inLanguage: L.locale,
      publisher: { '@id': `${ORIGIN}/#org` },
    },
    orgLd(),
  ],
  locale: L.locale,
  alternates: alternatesFor('/'),
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="${locPath(L.locale, '/')}">${BRAND_SVG}<span>${t(S, 'chrome.brand')}</span></a>
  <div class="hd-right">
    <span class="tag">${t(S, 'chrome.tag.info')}</span>
    <a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">${t(S, 'chrome.engine')} ${icon('arrowRight', '')}</a>
  </div>
</div></header>

<section class="hero"><div class="wrap">
  <div class="kicker">${t(S, 'home.kicker')}</div>
  <h1>${t(S, 'home.h1')}</h1>
  <p class="sub">${esc(t(S, 'home.sub.a'))} <a href="${PORTAL}" style="color:#059669" target="_blank" rel="noopener noreferrer">compliance-audit.eu</a>${esc(t(S, 'home.sub.b'))}</p>
  <div class="cta-row">
    <a class="btn btn-em" href="${PORTAL}" target="_blank" rel="noopener noreferrer">${t(S, 'cta.openEngine')} ${icon('arrowRight', '')}</a>
    <a class="btn btn-ghost" href="${PROOF}" target="_blank" rel="noopener noreferrer">${t(S, 'cta.proof')}</a>
    <a class="btn btn-dark" href="https://github.com/Terrygilligan/compliance-audit-engine" target="_blank" rel="noopener noreferrer">${icon('gitBranch', '')} ${t(S, 'home.cta.github')}</a>
  </div>
</div></section>

<section class="strip"><div class="wrap">
  ${stats.map(([ic, l, v, s]) => `<div class="stat"><div class="stat-l">${icon(ic, '')} ${l}</div><div class="stat-v">${v}</div><div class="stat-s">${s}</div></div>`).join('')}
</div></section>

<section><div class="wrap">
  <div class="sec-head"><div><h2>${t(S, 'home.status.h2')}</h2><p class="sec-sub">${t(S, 'home.status.sub')}</p></div><span class="chip chip-g">${t(S, 'home.status.live')}</span></div>
  <div class="grid2">
    ${nodeCard(t(S, 'home.status.eu'), 'europe-west1', eu, S)}
    ${nodeCard(t(S, 'home.status.uk'), 'europe-west2', uk, S)}
  </div>
  <p class="note">${t(S, 'home.status.note', { date: generatedAt })}</p>
</div></section>

<section style="background:#fff;border-top:1px solid #e2e8f0"><div class="wrap">
  <div class="sec-head"><div><h2>${t(S, 'home.verifies.h2')}</h2><p class="sec-sub">${t(S, 'home.verifies.sub')}</p></div></div>
  <div class="grid2">
    ${standards.map(([ic, tt, b]) => commitment(ic, tt, b)).join('')}
  </div>
</div></section>

${indexSection(L)}

<section><div class="wrap">
  <div class="sec-head"><div><h2>${t(S, 'home.data.h2')}</h2><p class="sec-sub">${t(S, 'home.data.sub')}</p></div></div>
  <div class="grid2">
    ${commitments.map(([ic, tt, b]) => commitment(ic, tt, b)).join('')}
  </div>
</div></section>

<div class="wrap"><div class="cta-band">
  <p>${t(S, 'home.cta.band')}</p>
  <a href="${PROOF}" target="_blank" rel="noopener noreferrer">${t(S, 'cta.proof')} ${icon('arrowRight', '')}</a>
</div></div>

<footer><div class="wrap">
  <div class="f-row">
    <span>${t(S, 'footer.tagline.a')} <a href="${PORTAL}" style="color:#059669" target="_blank" rel="noopener noreferrer">compliance-audit.eu</a>.</span>
    <div class="badges">
      <span class="chip chip-g">${icon('mapPin', '')} ${t(S, 'footer.badges.eu')}</span>
      <span class="chip chip-g">${icon('mapPin', '')} ${t(S, 'footer.badges.uk')}</span>
      <span class="chip chip-g">${icon('shield', '')} ${t(S, 'footer.badges.tracking')}</span>
    </div>
  </div>
  <div class="f-row">
    <div class="f-links mono"><span>${t(S, 'footer.mono.firestore')}</span><span>${t(S, 'footer.mono.partitions')}</span></div>
    <div class="f-links">
      <a href="${TRUST}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.trust')}</a>
      <a href="${SCAN}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.scan')}</a>
      <a href="${VERIFY}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.verify')}</a>
      <a href="mailto:support@compliance-audit.eu">${icon('mail', '')} support@compliance-audit.eu</a>
      <a href="${APP}" target="_blank" rel="noopener noreferrer">${t(S, 'footer.signin')}</a>
    </div>
  </div>
</div></footer>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // www → apex
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      url.search = '';
      return Response.redirect(url.toString(), 301);
    }

    // Path normalization: strip trailing slashes, lowercase path — one
    // canonical form per resource.
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith('/')) {
      return Response.redirect(`${url.origin}${pathname.slice(0, -1)}${url.search}`, 301);
    }
    if (pathname !== pathname.toLowerCase()) {
      return Response.redirect(`${url.origin}${pathname.toLowerCase()}${url.search}`, 301);
    }

    // Legacy /t/<slug> → /rules/<slug> (suffix-drop for merged WCAG topics).
    if (pathname.startsWith('/t/')) {
      const slug = pathname.slice(3);
      return Response.redirect(`${url.origin}/rules/${T_SLUG_MERGES[slug] || slug}`, 301);
    }

    // Edge-served discovery endpoints.
    if (pathname === '/robots.txt') {
      return new Response(robotsTxt(), { status: 200, headers: TEXT_HEADERS });
    }
    if (pathname === '/sitemap.xml') {
      return new Response(sitemapXml(), { status: 200, headers: XML_HEADERS });
    }
    if (pathname === '/llms.txt') {
      return new Response(llmsTxt(), { status: 200, headers: TEXT_HEADERS });
    }

    // Browsers/crawlers probe /favicon.ico directly — serve the brand mark
    // instead of burning a redirect to the homepage.
    if (pathname === '/favicon.ico') {
      return new Response(BRAND_SVG, {
        status: 200,
        headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=86400, immutable' },
      });
    }

    // OG binaries via the ASSETS binding; unknown assets 404 plainly.
    if (pathname.startsWith('/og/')) {
      if (env && env.ASSETS) return env.ASSETS.fetch(request);
      return new Response('not found', { status: 404, headers: TEXT_HEADERS });
    }

    // Locale resolution — EN at root; /<code>/ prefixes serve their dict.
    // Inactive locales 301 to the EN equivalent until translations land.
    const { locale, path: lp } = resolveLocale(pathname);
    if (!isActive(locale)) {
      return Response.redirect(`${url.origin}${lp}${url.search}`, 301);
    }
    const L = localeData(locale);
    pathname = lp;

    // Hour-quantized — a second-resolution timestamp would defeat ETags.
    const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 14) + ':00 UTC';
    const lastModified = (d) => new Date(`${d}T00:00:00Z`).toUTCString();

    // /rules — index page (indexable HTML → ping).
    if (pathname === '/rules') {
      ping(request, ctx, url.pathname);
      return htmlResponse(request, rulesIndexPage(generatedAt, L), { lastModified: lastModified(REGISTRY_DATE) });
    }

    // /rules/<slug> — manual article or WCAG stub; unknown → true 404.
    if (pathname.startsWith('/rules/')) {
      const slug = pathname.slice(7);
      const resolved = resolveArticle(slug, L);
      if (!resolved) {
        return new Response(notFoundPage(generatedAt, L), { status: 404, headers: SECURITY_HEADERS });
      }
      ping(request, ctx, url.pathname);
      const extra = resolved.polished ? {} : { 'x-robots-tag': 'noindex' };
      return htmlResponse(request, topicPage(resolved.article, generatedAt, { polished: resolved.polished, L }), {
        lastModified: lastModified(resolved.article.updated || REGISTRY_DATE),
        extra,
      });
    }

    if (pathname !== '/') {
      return Response.redirect(`${url.origin}${locPath(locale, '/')}`, 301);
    }

    ping(request, ctx, url.pathname);
    const health = await nodeHealthCached();
    const html = page(health.eu, health.uk, generatedAt, L);
    return htmlResponse(request, html, { lastModified: lastModified(TOPICS_DATE) });
  },
};
