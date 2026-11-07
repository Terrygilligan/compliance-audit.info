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

const EU_HEALTH = 'https://compliance-audit-prod-355879683660.europe-west1.run.app/health';
const UK_HEALTH = 'https://compliance-audit-uk-355879683660.europe-west2.run.app/health';
const PORTAL = 'https://compliance-audit.eu';
const APP = 'https://app.compliance-audit.eu';
const PROOF = 'https://compliance-audit.eu/proof';
const TRUST = 'https://compliance-audit.eu/trust';
const ORIGIN = 'https://compliance-audit.info';
const TELEMETRY_URL = 'https://api.compliance-audit.eu/v1/telemetry/heartbeat';

// Registry snapshot date — bump when wcagRegistry content is re-synced into
// stubs; used as sitemap lastmod for programmatic pages.
const REGISTRY_DATE = '2026-11-02';
// Authoring date for the 12 hand-written TOPICS articles.
const TOPICS_DATE = '2026-11-01';

// Legacy /t/ slugs that merge into their bare wcag-<id> stub (owner-locked
// slug merge — one page per criterion).
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
  'cache-control': 'public, max-age=60',
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
    title: 'Art. 5 — Data minimisation',
    rule: 'Personal data must be "adequate, relevant and limited to what is necessary" for the stated purpose. Collecting more than you need is non-compliant by itself, whatever your consent banner says.',
    build: 'Collect less. Strip identifiers at the boundary, before storage or logging — a field you never store can never leak, be breached, or need a DSAR.',
    engine: 'POST /v1/sanitize — boundary redaction of SSN, email, phone, card and key fields before data reaches storage.',
  },
  {
    slug: 'gdpr-art-17-erasure', framework: 'GDPR', chip: 'chip-g',
    title: 'Art. 17 — Right to erasure',
    rule: 'On a valid request you must delete personal data "without undue delay" — every copy, in every store you control. A tombstone in the auth table while rows persist elsewhere is not erasure.',
    build: 'Deletion has to be a cascade with a defined blast radius: user-owned artifacts destroyed, shared tenant data left intact, and the operation idempotent so retries are safe.',
    engine: 'Destructive anonymization on UserDeleted — identifying fields overwritten, never reversibly hashed, across both sovereign partitions.',
  },
  {
    slug: 'gdpr-art-32-security', framework: 'GDPR', chip: 'chip-g',
    title: 'Art. 32 — Security of processing',
    rule: 'You must implement "appropriate technical and organisational measures" — encryption, integrity, resilience, and the ability to demonstrate them on demand.',
    build: 'Security claims need evidence. Tamper-evident logging, scoped credentials, and verifiable integrity proofs are the artifacts an assessor actually asks for.',
    engine: 'Hash-chained append-only audit vault with signed exports — integrity you verify cryptographically, not attest.',
  },
  {
    slug: 'gdpr-art-33-breach', framework: 'GDPR', chip: 'chip-g',
    title: 'Art. 33 — 72-hour breach notification',
    rule: 'A personal-data breach must be reported to the supervisory authority within 72 hours of becoming aware — "where feasible". The clock is unforgiving if you discover late.',
    build: 'You need an incident record that exists before the incident: severity, detection time, containment, and a computed notification deadline — not a wiki page written during the panic.',
    engine: 'Incident ledger with Art. 33 deadlines computed at creation — the record exists when the regulator asks for it.',
  },
  {
    slug: 'eprivacy-cookies', framework: 'ePrivacy', chip: 'chip-g',
    title: 'ePrivacy — the cookie rule',
    rule: 'Storing or accessing information on a user\u2019s device requires prior consent — except what is "strictly necessary" for the service the user asked for. Analytics and marketing pixels are never strictly necessary.',
    build: 'Either gate every non-essential script behind an opt-in banner, or ship nothing that needs one. Session auth and CSRF tokens are exempt; GA4 is not.',
    engine: 'Zero third-party tracking by construction — functional sessions plus a first-party heartbeat only.',
  },
  {
    slug: 'wcag-2-1-1', framework: 'WCAG 2.2', chip: 'chip-s',
    title: 'WCAG 2.1.1 — Keyboard operability',
    rule: 'All functionality must be operable through a keyboard interface, with no keyboard traps. Level A — failing it blocks users wholesale, not just inconveniently.',
    build: 'Every interactive element needs a reachable focus order and working focus styles. A widget that only works on hover, or that swallows Tab forever, fails this criterion.',
    engine: 'Tier-2 runner keyboard-reach probe — real-browser traversal, with presentational-utility exemptions for genuinely inert embeds.',
  },
  {
    slug: 'wcag-1-4-3', framework: 'WCAG 2.2', chip: 'chip-s',
    title: 'WCAG 1.4.3 — Contrast minimum',
    rule: 'Text needs 4.5:1 contrast against its background (3:1 for large text). Level AA — the most common machine-detectable failure on the web.',
    build: 'Fix it in the design tokens, not page by page — one low-contrast slate on a brand palette fails every page that uses it.',
    engine: 'axe contrast checks inside the Tier-2 audit run, rolled up into the criterion-level conformance report.',
  },
  {
    slug: 'wcag-4-1-2', framework: 'WCAG 2.2', chip: 'chip-s',
    title: 'WCAG 4.1.2 — Name, role, value',
    rule: 'UI components must expose their name, role, state and value to assistive technology. Level A — the criterion custom widgets most often break.',
    build: 'Prefer semantic HTML; when you must go custom, ARIA roles and states are part of the component contract, not an afterthought.',
    engine: 'axe ruleset detection in the audit run — missing accessible names and misused roles surface as findings.',
  },
  {
    slug: 'headers-csp', framework: 'Security headers', chip: 'chip-s',
    title: 'Content-Security-Policy',
    rule: 'CSP is not a regulation, but it is the header regulators and assessors look for as evidence of XSS defense-in-depth — and the first thing a perimeter scan checks.',
    build: 'Declare allowed script/style/connect sources explicitly. A permissive or missing CSP means injected markup can phone home freely.',
    engine: 'Perimeter header checks — shield headers and CSP posture are verified from the edge, no code access needed.',
  },
  {
    slug: 'eu-ai-act-inventory', framework: 'EU AI Act', chip: 'chip-s',
    title: 'AI Act — model inventory & risk tiers',
    rule: 'Providers and deployers must know which AI systems they operate, classify them by risk tier, and maintain the documentation trail proportionate to that tier.',
    build: 'Start with a registry: model, provider, risk tier, data provenance, oversight control. You cannot document what you have not inventoried.',
    engine: 'Model registry endpoints — risk-tiered inventory with audit events on registration and tier changes.',
  },
  {
    slug: 'dora-resilience', framework: 'DORA', chip: 'chip-s',
    title: 'DORA — ICT resilience',
    rule: 'Financial entities and their ICT providers must demonstrate operational resilience: incident handling, continuity, and the records to prove both.',
    build: 'Resilience is an architecture: circuit-breakers on external dependencies, dead-letter queues on async flows, and a ledger of what broke and when.',
    engine: 'Redis-backed circuit breaker states, incident ledger, and dead-letter topics — resilience as records, not promises.',
  },
  {
    slug: 'data-residency', framework: 'Data residency', chip: 'chip-g',
    title: 'Sovereign partitions',
    rule: 'GDPR lets data flow freely inside the EU; moving it elsewhere needs a Chapter V mechanism. For many buyers, "stays in Europe" is a hard procurement gate, not a preference.',
    build: 'Bind data to regions at the database layer, not the app layer — a misrouted write is a residency breach regardless of what the marketing page says.',
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
};

// Indexable WCAG slugs = the 3 manual TOPICS + stubs carrying STUB_NOTES.
const POLISHED_WCAG = new Set(
  WCAG_CRITERIA.filter((c) => STUB_NOTES[c.criterionId])
    .map((c) => `wcag-${c.criterionId.replace(/\./g, '-')}`)
);

function stubArticle(c) {
  const slug = `wcag-${c.criterionId.replace(/\./g, '-')}`;
  const notes = STUB_NOTES[c.criterionId];
  const level = `Level ${c.level}`;
  const en = c.en301549Clause
    ? `EN 301 549 clause ${c.en301549Clause} maps this criterion for procurement conformance.`
    : 'This criterion is WCAG 2.2-only — it has no EN 301 549 v3.2.1 clause yet.';
  const auto = c.fullyAutomated
    ? 'fullyAutomated — a clean automated run is conclusive evidence for this criterion.'
    : c.tier && c.tier.length
      ? `partially automated (audit tier ${c.tier.join('/')}) — automated findings flag candidates; a clean VPAT claim still needs the documented manual check.`
      : 'manual-only in the current audit tiers — no automated run can certify it.';
  return {
    slug,
    framework: 'WCAG 2.2',
    chip: 'chip-s',
    title: `WCAG ${c.criterionId} — ${c.name}`,
    rule:
      `Success Criterion ${c.criterionId} "${c.name}" is a ${level} requirement under the "${c.principle}" principle of WCAG 2.2. ${en}`,
    build: notes
      ? `${notes.example} ${notes.pitfall}`
      : 'Check the W3C Understanding document for this criterion for the full normative text, sufficient techniques, and common failures before claiming conformance.',
    engine: `Engine coverage: ${auto}`,
    stub: true,
    polished: Boolean(notes),
    updated: REGISTRY_DATE,
    criterion: c,
  };
}

function resolveArticle(slug) {
  const t = TOPICS.find((x) => x.slug === slug);
  if (t) return { article: t, polished: true };
  const c = WCAG_BY_SLUG.get(slug);
  if (c) {
    const stub = stubArticle(c);
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
    sameAs: [
      'https://compliance-audit.eu',
      'https://github.com/Terrygilligan',
      'https://github.com/Terrygilligan/compliance-audit-verify-action',
    ],
  };
}

// Shared <head> extras: canonical + OG + robots + JSON-LD. ogImage is a path
// under /og/ served by the ASSETS binding.
function headMeta({ title, desc, canonical, og = '/og/site.png', robots = 'index, follow', ld = [] }) {
  return `<title>${esc(title)}</title>
<meta name="description" content="${esc(desc).slice(0, 160)}">
<link rel="canonical" href="${ORIGIN}${canonical}">
<meta name="robots" content="${robots}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Compliance Audit reference">
<meta property="og:url" content="${ORIGIN}${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc).slice(0, 200)}">
<meta property="og:image" content="${ORIGIN}${og}">
<meta name="twitter:card" content="summary_large_image">
${ld.map(jsonLd).join('\n')}`;
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
  return `# compliance-audit.info — public reference surface; everything is indexable
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
    ...[...WCAG_BY_SLUG.keys()]
      .filter((s) => !TOPICS.some((t) => t.slug === s))
      .map((s) => ({ loc: `/rules/${s}`, priority: POLISHED_WCAG.has(s) ? '0.7' : '0.5', changefreq: 'monthly', lastmod: REGISTRY_DATE })),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${ORIGIN}${u.loc}</loc>
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

function nodeCard(name, zone, h) {
  const chip = h.ok
    ? `<span class="chip chip-g">${icon('check', '')} OPERATIONAL</span>`
    : `<span class="chip chip-r">UNREACHABLE</span>`;
  const meta = h.ok
    ? `${h.db} · ${h.region} · ${h.location}`
    : `${zone} · no response within 2.5s`;
  return `<div class="card node">
    <div class="node-top"><span class="node-name">${icon('server', '')} ${name}</span>${chip}</div>
    <div class="node-meta">${meta}</div>
  </div>`;
}

function commitment(ic, title, body) {
  return `<div class="card"><div class="card-h"><span class="ic">${icon(ic, '')}</span><h3>${title}</h3></div><p>${body}</p></div>`;
}

function topicPage(t, generatedAt, { polished = true } = {}) {
  const canonical = `/rules/${t.slug}`;
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: t.title,
    description: t.rule.slice(0, 200),
    datePublished: t.updated,
    dateModified: t.updated,
    about: t.framework,
    author: { '@id': `${ORIGIN}/#org` },
    publisher: { '@id': `${ORIGIN}/#org` },
    mainEntityOfPage: `${ORIGIN}${canonical}`,
  };
  const crumbs = breadcrumbLd([
    ['Home', '/'],
    ['Rules', '/rules'],
    [t.title, canonical],
  ]);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: `${t.title} — Compliance Audit reference`,
  desc: t.rule,
  canonical,
  og: t.stub ? '/og/wcag.png' : '/og/site.png',
  robots: polished ? 'index, follow' : 'noindex, follow',
  ld: [articleLd, crumbs, orgLd()],
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}
.back{font-size:.75rem;color:#64748b;text-decoration:none;display:inline-flex;align-items:center;gap:.25rem;margin-bottom:1rem}
.back:hover{color:#334155}
.rule h3{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin-bottom:.375rem}
.rule p{font-size:.875rem;color:#334155;line-height:1.7}
.rule-eng{margin-top:.5rem;padding:.875rem 1rem;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:.5rem}
.rule-eng p{color:#065f46;font-size:.8125rem}
</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="/">${BRAND_SVG}<span>Compliance Audit</span></a>
  <div class="hd-right"><span class="tag">PUBLIC / REFERENCE</span><a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">Engine ${icon('arrowRight', '')}</a></div>
</div></header>
<section><div class="wrap" style="padding-top:2.5rem">
  <nav aria-label="Breadcrumb" class="back"><a href="/" style="color:#64748b;text-decoration:none">Home</a> / <a href="/rules" style="color:#64748b;text-decoration:none">Rules</a> / ${esc(t.title)}</nav>
  <div class="kicker">${t.framework.toUpperCase()} / RULE REFERENCE</div>
  <h1 style="font-size:1.875rem">${esc(t.title)}</h1>
  <div class="grid2" style="margin-top:1.5rem">
    <div class="card rule"><h3>The rule</h3><p>${esc(t.rule)}</p></div>
    <div class="card rule"><h3>What it means for how you build</h3><p>${esc(t.build)}</p></div>
  </div>
  <div class="card rule-eng" style="margin-top:1rem"><h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#065f46;margin-bottom:.25rem">How the engine checks it</h3><p>${esc(t.engine)}</p></div>
</div></section>
<div class="wrap"><div class="cta-band">
  <p>This rule is one of the surfaces the engine verifies from the perimeter — see the live proof run.</p>
  <a href="${PROOF}" target="_blank" rel="noopener noreferrer">Run the live proof ${icon('arrowRight', '')}</a>
</div></div>
<footer><div class="wrap"><div class="f-row">
  <span>Compliance Audit — independent EU-based engine. Generated ${generatedAt}.</span>
  <div class="f-links"><a href="${TRUST}" target="_blank" rel="noopener noreferrer">Trust page</a><a href="mailto:support@compliance-audit.eu">support@compliance-audit.eu</a><a href="${APP}" target="_blank" rel="noopener noreferrer">Client sign-in</a></div>
</div></div></footer>
</body>
</html>`;
}

function indexSection() {
  return `<section id="index" style="background:#fff;border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0"><div class="wrap">
  <div class="sec-head"><div><h2>Compliance rules index</h2><p class="sec-sub">The rules the internet actually runs on — what each one demands of how you build</p></div></div>
  ${FRAMEWORK_ORDER.map((f) => `
    <h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:1.25rem 0 .5rem">${f}</h3>
    <div class="grid2">
      ${TOPICS.filter((t) => t.framework === f).map((t) => `
        <a href="/rules/${t.slug}" target="_blank" rel="noopener noreferrer" class="card" style="text-decoration:none;display:block">
          <div class="card-h"><h3 style="color:#0f172a">${t.title}</h3></div>
          <p style="color:#475569">${t.rule.slice(0, 110)}…</p>
        </a>`).join('')}
    </div>`).join('')}
</div></section>`;
}

function rulesIndexPage(generatedAt) {
  const hubFrameworks = FRAMEWORK_ORDER.filter((f) => f !== 'WCAG 2.2');
  const principleLabel = {
    perceivable: 'Principle 1 — Perceivable',
    operable: 'Principle 2 — Operable',
    understandable: 'Principle 3 — Understandable',
    robust: 'Principle 4 — Robust',
  };
  const wcagCard = (slug, name, level, polished) => `
    <a href="/rules/${slug}" target="_blank" rel="noopener noreferrer" class="card" style="text-decoration:none;display:block">
      <div class="card-h" style="justify-content:space-between">
        <h3 style="color:#0f172a">${esc(name)}</h3>
        <span class="chip ${polished ? 'chip-g' : 'chip-s'}">Level ${level}${polished ? ' · in-depth' : ''}</span>
      </div>
    </a>`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: 'Rules index — Compliance Audit reference',
  desc: 'Every rule the engine verifies, grouped by framework: GDPR, ePrivacy, WCAG 2.2, security headers, EU AI Act, DORA, data residency.',
  canonical: '/rules',
  ld: [breadcrumbLd([['Home', '/'], ['Rules', '/rules']]), orgLd()],
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="/">${BRAND_SVG}<span>Compliance Audit</span></a>
  <div class="hd-right"><span class="tag">PUBLIC / RULES INDEX</span><a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">Engine ${icon('arrowRight', '')}</a></div>
</div></header>
<section><div class="wrap" style="padding-top:2.5rem">
  <div class="kicker">RULE REFERENCE / INDEX</div>
  <h1 style="font-size:1.875rem">Every rule the engine verifies</h1>
  <p class="sub">Hand-written authority hubs plus the complete WCAG 2.2 A/AA success-criteria catalog.</p>

  ${hubFrameworks.map((f) => `
    <h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:1.75rem 0 .5rem">${f}</h3>
    <div class="grid2">
      ${TOPICS.filter((t) => t.framework === f).map((t) => `
        <a href="/rules/${t.slug}" target="_blank" rel="noopener noreferrer" class="card" style="text-decoration:none;display:block">
          <div class="card-h"><h3 style="color:#0f172a">${esc(t.title)}</h3></div>
          <p style="color:#475569">${esc(t.rule.slice(0, 110))}…</p>
        </a>`).join('')}
    </div>`).join('')}

  <h3 style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#64748b;margin:1.75rem 0 .5rem">WCAG 2.2 — all ${WCAG_CRITERIA.length} Level A/AA criteria</h3>
  ${WCAG_PRINCIPLES.map((p) => `
    <h4 style="font-size:.8125rem;font-weight:600;color:#334155;margin:1rem 0 .5rem">${principleLabel[p]}</h4>
    <div class="grid3">
      ${WCAG_CRITERIA.filter((c) => c.principle === p).map((c) => {
        const slug = `wcag-${c.criterionId.replace(/\./g, '-')}`;
        const polished = TOPICS.some((t) => t.slug === slug) || POLISHED_WCAG.has(slug);
        return wcagCard(slug, `${c.criterionId} ${c.name}`, c.level, polished);
      }).join('')}
    </div>`).join('')}
</div></section>
<footer><div class="wrap"><div class="f-row">
  <span>Compliance Audit — independent EU-based engine. Generated ${generatedAt}.</span>
  <div class="f-links"><a href="${TRUST}" target="_blank" rel="noopener noreferrer">Trust page</a><a href="mailto:support@compliance-audit.eu">support@compliance-audit.eu</a><a href="${APP}" target="_blank" rel="noopener noreferrer">Client sign-in</a></div>
</div></div></footer>
</body>
</html>`;
}

function notFoundPage(generatedAt) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: 'Rule not found — Compliance Audit reference',
  desc: 'This rule does not exist in the reference index.',
  canonical: '/404',
  og: '/og/site.png',
  robots: 'noindex, nofollow',
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="/">${BRAND_SVG}<span>Compliance Audit</span></a>
  <div class="hd-right"><span class="tag">404</span><a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">Engine ${icon('arrowRight', '')}</a></div>
</div></header>
<section><div class="wrap" style="padding-top:4rem;padding-bottom:4rem">
  <div class="kicker">404 / NOT IN THE INDEX</div>
  <h1 style="font-size:1.875rem">That rule isn't in the reference.</h1>
  <p class="sub">The index covers the regulatory hubs and all ${WCAG_CRITERIA.length} WCAG 2.2 A/AA criteria. If you followed a link, it may predate the index.</p>
  <div class="cta-row">
    <a class="btn btn-em" href="/rules">Browse the rules index ${icon('arrowRight', '')}</a>
    <a class="btn btn-ghost" href="/">Back to the hub</a>
  </div>
</div></section>
<footer><div class="wrap"><div class="f-row">
  <span>Compliance Audit — independent EU-based engine. Generated ${generatedAt}.</span>
  <div class="f-links"><a href="${TRUST}" target="_blank" rel="noopener noreferrer">Trust page</a><a href="mailto:support@compliance-audit.eu">support@compliance-audit.eu</a></div>
</div></div></footer>
</body>
</html>`;
}

function page(eu, uk, generatedAt) {
  const standards = [
    ['scale', 'GDPR', 'Erasure cascades, DSAR automation, retention windows — executed as code paths, not policy prose.'],
    ['zap', 'EU AI Act', 'Model inventory + risk-tier registry per tenant; the audit trail AI governance actually needs.'],
    ['server', 'DORA', 'Circuit-breaking, incident ledger, and tamper-evident operational records for resilience reviews.'],
    ['a11y', 'WCAG 2.2 / EN 301 549', 'Automated Tier-1 AST checks plus a real-browser Tier-2 runner producing VPAT/ACR exports.'],
  ];
  const commitments = [
    ['eyeOff', 'Zero third-party tracking', 'No analytics pixels, no ad tech, no data brokers, no session-replay tooling. The only telemetry is a first-party heartbeat to our own API — nothing ever leaves our infrastructure.'],
    ['cookie', 'Strictly functional sessions', 'Sign-in state lives in session storage only — no tracking cookies, no marketing pixels, nothing that requires a consent banner under ePrivacy.'],
    ['fingerprint', 'Ephemeral presence signal', 'The visitor heartbeat stores a daily-rotating HMAC-SHA256 hash of the IP — never the address itself — in a 3-minute live window. Documents auto-expire within 24 hours; no per-visitor history exists.'],
    ['trash', 'No per-visitor history', 'Heartbeats overwrite one document per visitor per day. There is no timeline, no path history, no profile — only an aggregate "who is here right now" window that platform operators can see.'],
    ['database', 'Sovereign partitions', 'Each regional enclave reads and writes only its own Firestore database — europe-west1 (Belgium) and europe-west2 (London). Regional traffic never crosses partitions.'],
    ['lock', 'Tamper-evident audit vault', 'Every compliance event is hash-chained into an append-only Firestore vault and independently verifiable via signed export — the same chain our own telemetry refuses to bypass.'],
  ];
  const stats = [
    ['fileJson', 'PII field classes', '5+', 'SSN · email · phone · card · key'],
    ['lock', 'Badge integrity', 'HMAC-SHA256', 'Signed per assessment'],
    ['activity', 'Retention rules', '6 tiers', '730d – 3650d statutory'],
    ['mapPin', 'Data residency', 'EU + UK', 'No replication outside Europe'],
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${headMeta({
  title: 'Compliance Audit — what compliance-as-code actually means',
  desc: 'Information about the sovereign compliance engine: GDPR, EU AI Act, DORA and WCAG verification as an API — EU/UK data residency, zero tracking, cryptographic proof.',
  canonical: '/',
  ld: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Compliance Audit reference',
      url: ORIGIN,
      publisher: { '@id': `${ORIGIN}/#org` },
    },
    orgLd(),
  ],
})}
<link rel="icon" href="${FAVICON}">
<style>${CSS}</style>
</head>
<body>
<header><div class="wrap">
  <a class="brand" href="/">${BRAND_SVG}<span>Compliance Audit</span></a>
  <div class="hd-right">
    <span class="tag">PUBLIC / INFORMATION</span>
    <a class="btn btn-em btn-sm" href="${PORTAL}" target="_blank" rel="noopener noreferrer">Engine ${icon('arrowRight', '')}</a>
  </div>
</div></header>

<section class="hero"><div class="wrap">
  <div class="kicker">COMPLIANCE-AUDIT.INFO / PUBLIC REFERENCE</div>
  <h1>Compliance, verified — not asserted.</h1>
  <p class="sub">This is the information surface for the Compliance Audit engine: what it checks, how it proves it, and where your data lives. The engine itself is an API — PII redaction, GDPR erasure, accessibility conformance, and HMAC-signed compliance badges — running on sovereign EU/UK infrastructure. The product lives at <a href="${PORTAL}" style="color:#059669" target="_blank" rel="noopener noreferrer">compliance-audit.eu</a>.</p>
  <div class="cta-row">
    <a class="btn btn-em" href="${PORTAL}" target="_blank" rel="noopener noreferrer">Open the engine ${icon('arrowRight', '')}</a>
    <a class="btn btn-ghost" href="${PROOF}" target="_blank" rel="noopener noreferrer">Run the live proof</a>
    <a class="btn btn-dark" href="https://github.com/Terrygilligan/compliance-audit-engine" target="_blank" rel="noopener noreferrer">${icon('gitBranch', '')} GitHub Action @v1</a>
  </div>
</div></section>

<section class="strip"><div class="wrap">
  ${stats.map(([ic, l, v, s]) => `<div class="stat"><div class="stat-l">${icon(ic, '')} ${l}</div><div class="stat-v">${v}</div><div class="stat-s">${s}</div></div>`).join('')}
</div></section>

<section><div class="wrap">
  <div class="sec-head"><div><h2>Live node status</h2><p class="sec-sub">Both sovereign partitions, fetched at request time — not a cached badge</p></div><span class="chip chip-g">LIVE</span></div>
  <div class="grid2">
    ${nodeCard('EU node', 'europe-west1', eu)}
    ${nodeCard('UK node', 'europe-west2', uk)}
  </div>
  <p class="note">Live status only — we publish no fabricated uptime percentages. Each node answers for its own sovereign Firestore partition. Checked ${generatedAt}.</p>
</div></section>

<section style="background:#fff;border-top:1px solid #e2e8f0"><div class="wrap">
  <div class="sec-head"><div><h2>What it verifies</h2><p class="sec-sub">Four regulatory surfaces, one API — checked at the perimeter, never by scanning your source</p></div></div>
  <div class="grid2">
    ${standards.map(([ic, t, b]) => commitment(ic, t, b)).join('')}
  </div>
</div></section>

${indexSection()}

<section><div class="wrap">
  <div class="sec-head"><div><h2>How it handles your data</h2><p class="sec-sub">The exact mechanics behind the zero-tracking commitment</p></div></div>
  <div class="grid2">
    ${commitments.map(([ic, t, b]) => commitment(ic, t, b)).join('')}
  </div>
</div></section>

<div class="wrap"><div class="cta-band">
  <p>Every claim on this page executes live against production — the status cards above are real health checks, not marketing copy.</p>
  <a href="${PROOF}" target="_blank" rel="noopener noreferrer">Run the live proof ${icon('arrowRight', '')}</a>
</div></div>

<footer><div class="wrap">
  <div class="f-row">
    <span>Compliance Audit — independent EU-based engine. Informational surface; product at <a href="${PORTAL}" style="color:#059669" target="_blank" rel="noopener noreferrer">compliance-audit.eu</a>.</span>
    <div class="badges">
      <span class="chip chip-g">${icon('mapPin', '')} EU data · Belgium (europe-west1)</span>
      <span class="chip chip-g">${icon('mapPin', '')} UK data · London (europe-west2)</span>
      <span class="chip chip-g">${icon('shield', '')} Zero tracking · essential sessions only</span>
    </div>
  </div>
  <div class="f-row">
    <div class="f-links mono"><span>Firestore · append-only ledger</span><span>EU/UK sovereign partitions</span></div>
    <div class="f-links">
      <a href="${TRUST}" target="_blank" rel="noopener noreferrer">Trust page</a>
      <a href="mailto:support@compliance-audit.eu">${icon('mail', '')} support@compliance-audit.eu</a>
      <a href="${APP}" target="_blank" rel="noopener noreferrer">Client sign-in</a>
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

    // OG binaries via the ASSETS binding; unknown assets 404 plainly.
    if (pathname.startsWith('/og/')) {
      if (env && env.ASSETS) return env.ASSETS.fetch(request);
      return new Response('not found', { status: 404, headers: TEXT_HEADERS });
    }

    const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

    // /rules — index page (indexable HTML → ping).
    if (pathname === '/rules') {
      ping(request, ctx, '/rules');
      return new Response(rulesIndexPage(generatedAt), { status: 200, headers: SECURITY_HEADERS });
    }

    // /rules/<slug> — manual article or WCAG stub; unknown → true 404.
    if (pathname.startsWith('/rules/')) {
      const slug = pathname.slice(7);
      const resolved = resolveArticle(slug);
      if (!resolved) {
        return new Response(notFoundPage(generatedAt), { status: 404, headers: SECURITY_HEADERS });
      }
      ping(request, ctx, pathname);
      const extra = resolved.polished ? {} : { 'x-robots-tag': 'noindex' };
      return new Response(topicPage(resolved.article, generatedAt, { polished: resolved.polished }), {
        status: 200,
        headers: { ...SECURITY_HEADERS, ...extra },
      });
    }

    if (pathname !== '/') {
      return Response.redirect(`${url.origin}/`, 301);
    }

    ping(request, ctx, '/');
    const [eu, uk] = await Promise.allSettled([nodeHealth(EU_HEALTH), nodeHealth(UK_HEALTH)]);
    const html = page(eu.value || { ok: false }, uk.value || { ok: false }, generatedAt);
    return new Response(html, { status: 200, headers: SECURITY_HEADERS });
  },
};
