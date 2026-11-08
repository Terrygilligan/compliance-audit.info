// ui.en.js — English source-of-truth UI strings. Every user-facing string on
// the site lives here (or in per-topic/stub content in worker.js). Locale
// files (ui.<code>.js) override any subset of these keys; missing keys fall
// back to this file at render time.
//
// Key conventions: <section>.<name>; {placeholders} substituted by t().

export const STRINGS = {
  // --- chrome ---
  'chrome.brand': 'Compliance Audit',
  'chrome.engine': 'Engine',
  'chrome.tag.reference': 'PUBLIC / REFERENCE',
  'chrome.tag.index': 'PUBLIC / RULES INDEX',
  'chrome.tag.info': 'PUBLIC / INFORMATION',
  'chrome.tag.404': '404',

  // --- footer ---
  'footer.generated': 'Compliance Audit — independent EU-based engine. Generated {date}.',
  'footer.tagline.a': 'Compliance Audit — independent EU-based engine. Informational surface; product at',
  'footer.badges.eu': 'EU data · Belgium (europe-west1)',
  'footer.badges.uk': 'UK data · London (europe-west2)',
  'footer.badges.tracking': 'Zero tracking · essential sessions only',
  'footer.mono.firestore': 'Firestore · append-only ledger',
  'footer.mono.partitions': 'EU/UK sovereign partitions',
  'footer.trust': 'Trust page',
  'footer.scan': 'Scan',
  'footer.verify': 'Verify',
  'footer.signin': 'Client sign-in',

  // --- breadcrumb ---
  'crumb.home': 'Home',
  'crumb.rules': 'Rules',

  // --- article page ---
  'article.kicker': 'RULE REFERENCE',
  'article.rule': 'The rule',
  'article.build': 'What it means for how you build',
  'article.selfcheck': 'Self-check',
  'article.pitfalls': 'Common pitfalls',
  'article.engine': 'How the engine checks it',
  'article.sources': 'Sources',
  'article.related': 'Related rules',
  'article.reviewed': 'Last reviewed {date}.',
  'article.reviewedStub': 'Last reviewed {date} — generated from the engine’s WCAG criterion registry.',
  'article.cta.text': 'Reading up on {topic}? The engine verifies this surface from the perimeter — live on sovereign EU/UK partitions.',

  // --- shared CTAs ---
  'cta.proof': 'Run the live proof',
  'cta.scan': 'Scan a surface',
  'cta.openEngine': 'Open the engine',

  // --- 404 ---
  '404.kicker': '404 / NOT IN THE INDEX',
  '404.h1': 'That rule isn’t in the reference.',
  '404.sub': 'The index covers the regulatory hubs and all {count} WCAG 2.2 A/AA criteria. If you followed a link, it may predate the index.',
  '404.ctaIndex': 'Browse the rules index',
  '404.ctaHome': 'Back to the hub',
  'meta.404.title': 'Rule not found — {site}',
  'meta.404.desc': 'This rule does not exist in the reference index.',

  // --- /rules index ---
  'rules.kicker': 'RULE REFERENCE / INDEX',
  'rules.h1': 'Every rule the engine verifies',
  'rules.sub': 'Hand-written authority hubs plus the complete WCAG 2.2 A/AA success-criteria catalog.',
  'rules.wcagHead': 'WCAG 2.2 — all {count} Level A/AA criteria',
  'rules.indepth': 'in-depth',
  'meta.rules.title': 'Rules index — {site}',
  'meta.rules.desc': 'Every rule the engine verifies, grouped by framework: GDPR, ePrivacy, WCAG 2.2, security headers, EU AI Act, DORA, data residency.',

  // --- WCAG principle labels + blurbs ---
  'principle.perceivable.label': 'Principle 1 — Perceivable',
  'principle.perceivable.blurb': 'Information must reach users through senses they have — text alternatives, adaptable structure, and content that stays distinguishable.',
  'principle.operable.label': 'Principle 2 — Operable',
  'principle.operable.blurb': 'Every function must work with the inputs people actually use — keyboard, pointer, voice — with enough time and nothing that triggers seizures.',
  'principle.understandable.label': 'Principle 3 — Understandable',
  'principle.understandable.blurb': 'Content and controls must read predictably — declared language, consistent navigation, and errors that explain themselves.',
  'principle.robust.label': 'Principle 4 — Robust',
  'principle.robust.blurb': 'Markup must interoperate with assistive technology — valid names, roles, states, and status messages that actually announce.',

  // Principle names as used inside stub sentences ("the 'perceivable' principle").
  'principle.perceivable.name': 'perceivable',
  'principle.operable.name': 'operable',
  'principle.understandable.name': 'understandable',
  'principle.robust.name': 'robust',

  // --- framework display labels (grouping key stays English) ---
  'fw.GDPR': 'GDPR',
  'fw.ePrivacy': 'ePrivacy',
  'fw.WCAG 2.2': 'WCAG 2.2',
  'fw.Security headers': 'Security headers',
  'fw.EU AI Act': 'EU AI Act',
  'fw.DORA': 'DORA',
  'fw.Data residency': 'Data residency',

  // --- homepage ---
  'home.kicker': 'COMPLIANCE-AUDIT.INFO / PUBLIC REFERENCE',
  'home.h1': 'Compliance, verified — not asserted.',
  'home.sub.a': 'This is the information surface for the Compliance Audit engine: what it checks, how it proves it, and where your data lives. The engine itself is an API — PII redaction, GDPR erasure, accessibility conformance, and HMAC-signed compliance badges — running on sovereign EU/UK infrastructure. The product lives at',
  'home.sub.b': '.',
  'home.cta.github': 'GitHub Action @v1',
  'home.status.h2': 'Live node status',
  'home.status.sub': 'Both sovereign partitions, fetched at request time — not a cached badge',
  'home.status.live': 'LIVE',
  'home.status.operational': 'OPERATIONAL',
  'home.status.unreachable': 'UNREACHABLE',
  'home.status.noresp': '{zone} · no response within 2.5s',
  'home.status.eu': 'EU node',
  'home.status.uk': 'UK node',
  'home.status.note': 'Live status only — we publish no fabricated uptime percentages. Each node answers for its own sovereign Firestore partition. Checked {date}.',
  'home.verifies.h2': 'What it verifies',
  'home.verifies.sub': 'Four regulatory surfaces, one API — checked at the perimeter, never by scanning your source',
  'home.index.h2': 'Compliance rules index',
  'home.index.sub': 'The rules the internet actually runs on — what each one demands of how you build',
  'home.data.h2': 'How it handles your data',
  'home.data.sub': 'The exact mechanics behind the zero-tracking commitment',
  'home.cta.band': 'Every claim on this page executes live against production — the status cards above are real health checks, not marketing copy.',
  'meta.home.title': 'Compliance Audit — what compliance-as-code actually means',
  'meta.home.desc': 'Information about the sovereign compliance engine: GDPR, EU AI Act, DORA and WCAG verification as an API — EU/UK data residency, zero tracking, cryptographic proof.',
  'meta.suffix': 'Compliance Audit reference',

  // --- homepage content blocks ---
  'home.standards': [
    ['GDPR', 'Erasure cascades, DSAR automation, retention windows — executed as code paths, not policy prose.'],
    ['EU AI Act', 'Model inventory + risk-tier registry per tenant; the audit trail AI governance actually needs.'],
    ['DORA', 'Circuit-breaking, incident ledger, and tamper-evident operational records for resilience reviews.'],
    ['WCAG 2.2 / EN 301 549', 'Automated Tier-1 AST checks plus a real-browser Tier-2 runner producing VPAT/ACR exports.'],
  ],
  'home.commitments': [
    ['Zero third-party tracking', 'No analytics pixels, no ad tech, no data brokers, no session-replay tooling. The only telemetry is a first-party heartbeat to our own API — nothing ever leaves our infrastructure.'],
    ['Strictly functional sessions', 'Sign-in state lives in session storage only — no tracking cookies, no marketing pixels, nothing that requires a consent banner under ePrivacy.'],
    ['Ephemeral presence signal', 'The visitor heartbeat stores a daily-rotating HMAC-SHA256 hash of the IP — never the address itself — in a 3-minute live window. Documents auto-expire within 24 hours; no per-visitor history exists.'],
    ['No per-visitor history', 'Heartbeats overwrite one document per visitor per day. There is no timeline, no path history, no profile — only an aggregate "who is here right now" window that platform operators can see.'],
    ['Sovereign partitions', 'Each regional enclave reads and writes only its own Firestore database — europe-west1 (Belgium) and europe-west2 (London). Regional traffic never crosses partitions.'],
    ['Tamper-evident audit vault', 'Every compliance event is hash-chained into an append-only Firestore vault and independently verifiable via signed export — the same chain our own telemetry refuses to bypass.'],
  ],
  'home.stats.pii': ['PII field classes', 'SSN · email · phone · card · key'],
  'home.stats.badge': ['Badge integrity', 'Signed per assessment'],
  'home.stats.retention': ['Retention rules', '730d – 3650d statutory'],
  'home.stats.residency': ['Data residency', 'No replication outside Europe'],

  // --- WCAG stub boilerplate ---
  'stub.rule': 'Success Criterion {id} "{name}" is a {level} requirement under the "{principle}" principle of WCAG 2.2. {en}',
  'stub.enMapped': 'EN 301 549 clause {clause} maps this criterion for procurement conformance.',
  'stub.enUnmapped': 'This criterion is WCAG 2.2-only — it has no EN 301 549 v3.2.1 clause yet.',
  'stub.auto.full': 'fullyAutomated — a clean automated run is conclusive evidence for this criterion.',
  'stub.auto.partial': 'partially automated (audit tier {tiers}) — automated findings flag candidates; a clean VPAT claim still needs the documented manual check.',
  'stub.auto.manual': 'manual-only in the current audit tiers — no automated run can certify it.',
  'stub.engine': 'Engine coverage: {auto}',
  'stub.buildGeneric': 'Check the W3C Understanding document for this criterion for the full normative text, sufficient techniques, and common failures before claiming conformance.',
  'stub.sourceW3c': 'W3C — Understanding SC {id} {name}',
  'stub.sourceEn': 'EN 301 549 v3.2.1 — clause {clause}',
  'stub.level': 'Level {level}',
};

// English is the source of truth — per-topic and per-criterion fields live in
// worker.js; locale files carry overrides for these maps.
export const TOPICS_L10N = {};
export const STUB_NOTES_L10N = {};
export const CRIT_NAMES = {};
