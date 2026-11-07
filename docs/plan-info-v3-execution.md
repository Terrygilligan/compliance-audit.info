---
agent: devin-local
session: devin-desktop-2026-11-02
created: 2026-11-02
status: LOCKED — owner decisions resolved 2026-11-02
source: ~/.devin/plans/plan-info-v3-execution.md (verbatim copy)
---
# `compliance-audit.info` — Technical Reference & SEO Plan (v3)

**Core Role:** Educational knowledge base, regulatory deep-dives, and programmatic WCAG success-criteria references. Funnels high-intent informational search and AI traffic directly into `.eu`. Hub-and-spoke pair: `.info` educates, `.eu` converts.

**Canonical path scheme:** `/rules/<slug>` (replaces `/t/<slug>`; `/t/` 301s are belt-and-braces — never public). Site launches *as* v3 in the first production deploy.

**Verified pre-conditions (2026-11-02):**
- `edge/info-site/worker.js` built; `/` + 12 `/t/<slug>` TOPICS articles; www + non-root → 301; server-side EU/UK `/health` cards.
- Zone `a8789bf141777f985073920f4992474d` pending; NS `aitana`/`margo`; TF stage A (`zone-info.tf` + `dns-info.tf`, all DNS-only) authored + validated.
- `src/a11y/wcagRegistry.js` → `allCriteria()` ~55 `[criterionId, name, level, principle, tier, en301549Clause, fullyAutomated]` (CJS, axiom-guarded `a11y.conformance@2.1.0` — registry edits need worker redeploy).
- `POST /v1/telemetry/heartbeat` today accepts `{path, utmSource}`; identity = `resolveClientIp` → `cf-connecting-ip` on shield-verified requests.
- `compliance-audit.info` already in telemetry `OWN_HOSTS` → `.info`→`.eu` referers classify `internal`.

**Locked decisions (owner, 2026-11-02):**
- Heartbeat `{ip, ref}` contract extension — **approved** (anonymous counters; worker forwards inbound `cf-connecting-ip` + user-agent).
- Ping scope — **all indexable HTML routes** (`/` + `/rules/*`).
- `.info` `llms.txt` — **site content + engine API surface** (`api.compliance-audit.eu/v1/...`) — hub→spoke path for AI agents.
- Slug merge — manual WCAG TOPICS merge into bare `/rules/wcag-<id>` as polished stubs; real `/rules` index page (principle-grouped).
- GSC verification — **DNS TXT via `dns-info.tf`** (TF owns zone state; no worker meta-injection).
- Phased indexing — unpolished stubs serve `noindex` until hand-polished (HCS-safe).
- OG binaries — **Wrangler Static Assets** (`assets` binding) + offline-rendered PNGs; per-slug for hubs, shared generic for stubs.

---

## Phase A — Edge plumbing & routing (`edge/info-site/worker.js`)

1. **URL normalization:** apex + HTTPS; strip trailing slashes (`301`); lowercase paths; `/t/<slug>` → `/rules/<slug>` 301 (suffix-drop where merged: `/t/wcag-2-1-1-keyboard` → `/rules/wcag-2-1-1`).
2. **True 404s:** unknown `/rules/*` → `HTTP 404` + nav-shell HTML. Non-`/rules` unknowns keep 301→`/`.
3. **Edge-served discovery:**
   - `/robots.txt` — allow search + AI crawlers; `Sitemap:` directive.
   - `/sitemap.xml` — TOPICS + `allCriteria()`; `lastmod` from per-entry `updated` (TOPICS) / `REGISTRY_DATE` constant (stubs); omit where no honest date.
   - `/llms.txt` — regulatory articles + WCAG stub map + `.eu`/`api.compliance-audit.eu/v1/...` endpoint cross-refs.
4. **OG binaries:** `/og/site.png` + `/og/<slug>.png` (1200×630, immutable cache) via `assets` binding; offline-rendered via headless-Chrome HTML card; per-slug for 12 hubs, one generic WCAG card for stubs.
5. **Zero-JS telemetry:** `ctx.waitUntil(fetch('https://api.compliance-audit.eu/v1/telemetry/heartbeat', …))` on every indexable HTML route; body carries `{path, utmSource?, ip: <inbound cf-connecting-ip>, ref: <inbound referer>, ua?}`. Engine side (`src/common/telemetry.js` + `src/sync/telemetry.js`): `validateHeartbeatBody` accepts optional `ip` (v4/v6 ≤45 chars) + `ref` (string → `classifySource`); `recordHeartbeat` prefers `parsed.ip` over `clientIp(req)`; `ua` accepted-but-unused today (no raw-UA persistence — privacy contract). Unit test + axiom re-verify on telemetry row; EU deploy before/with launch.
6. **`/rules` index page:** real principle-grouped listing (all criteria + manual hubs).

## Phase B — Structured data & E-E-A-T

1. `/`: `WebSite` + `Organization` JSON-LD, `sameAs` = `.eu` + GitHub repos.
2. `/rules/*`: `TechArticle`/`Article` — `headline`, `description`, `datePublished`, `dateModified`, org author/publisher, `about` framework.
3. `BreadcrumbList`: Home → Framework → Article.
4. Omit `FAQPage`. ✅

## Phase C — Content depth (HCS-safe)

1. **Manual authority hubs (~500–800 words):** GDPR Arts. 5/17/32/33, DORA, ePrivacy, security-headers, EU-AI-Act, residency. Structure: *Rule in context → Build demands → Self-check → Common pitfalls → Engine verification → Related rules*; EUR-Lex/W3C citations (`rel="noopener"`).
2. **Programmatic WCAG stubs (~55):** `/rules/wcag-<id>` from `allCriteria()` — number + level, EN 301 549 xref, code examples, `fullyAutomated` status; `STUB_NOTES` map for polished top-10 (2.1.1, 1.4.3, 4.1.2, 1.1.1, 2.4.7, …), templated generics for the rest; `noindex` until polished.
3. **Dogfooding:** engine a11y audit on `.info` itself, published as proof.

## Phase D — Cross-domain link topology

1. `.eu` finding rows → `/rules/wcag-<id>`; `.info` CTAs → `.eu`. No footer spam.
2. Self-canonicals; no article mirroring.
3. GSC: TXT record in `dns-info.tf` at stage-A apply; submit sitemap when zone active + Worker live.

## Execution order

| # | Work | Blocker |
|---|---|---|
| 1 | Engine heartbeat `{ip,ref}` extension + test + EU deploy | none — independent commit |
| 2 | Worker v3 Phases A+B (`wrangler dev` verified) | none |
| 3 | Phase C stubs (noindex) + top-10 polish | none — can land incrementally |
| 4 | `terraform apply` stage A (+GSC TXT) | operator: token needs `.info` scope |
| 5 | GoDaddy NS → `aitana`/`margo` | operator |
| 6 | `wrangler login` → `wrangler deploy` — **site launches as v3** | operator OAuth |
| 7 | Stage-B `proxied=true` apex/www → apply | after 5+6 |
| 8 | Firebase `.info` custom-domain removal; drop `hosting-site` TXT | operator; after 7 |
| 9 | GSC sitemap submit; `.eu` Phase-B deep-links | after 7 |
| 10 | Phase C dogfood audit + remaining stub polish | after launch |

## Compliance notes

- Zero new paid infra (Workers Free + static assets) — cost axiom honored.
- No PII at rest: `ip` only feeds the daily-salted HMAC; never persisted raw.
- Same-change doc doctrine: worker changes → handover log + `pending-plans` #8 + `CURRENT-STATE`; engine change → axiom re-verify + log; TF change → axiom `infra.residency` re-verify.
