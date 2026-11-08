# HANDOVER — compliance-audit.info

**As of 2026-11-08.** Single Cloudflare Worker site (`edge/info-site/worker.js`,
~1,460 lines, zero runtime deps, no build step). Read `AGENTS.md` + this file
before touching anything. Survival guide: `docs/bus-factor.md`.

## ⚠️ Git state at handoff — UNCOMMITTED WORK ON DISK

All work below exists only in the working tree (`M worker.js`, `M README.md`,
untracked `src/i18n/`, `scripts/`, 13 OG PNGs). Commit from PowerShell before
any deploy or parallel session:

```powershell
git -c user.name=Terrygilligan -c user.email=Terrygilligan@users.noreply.github.com add -A
git -c user.name=Terrygilligan -c user.email=Terrygilligan@users.noreply.github.com commit -m "SEO pass + i18n scaffolding"
```

## Done (verified locally via `wrangler dev`)

**SEO pass** (phases 1–3 of the v3-SEO plan):
- Technical: same-tab internal links; `og:type=article` + `article:*` +
  `twitter:*` + `og:locale`; weak ETag (FNV-1a) + `If-None-Match`→304 +
  `Last-Modified`; `generatedAt` hour-quantized; `max-age=300` +
  `stale-while-revalidate=86400`; 60s isolate health-cache (homepage TTFB
  fix — a down node still honestly shows UNREACHABLE, ≤60s stale);
  sitemap filtered to indexable URLs only (35); `/favicon.ico` serves the
  brand SVG; JSON-LD enriched (Org `logo`/`description`/`contactPoint`,
  TechArticle `inLanguage`/`isAccessibleForFree`/`image`).
- Content: all 12 hubs rewritten to ~500–800 words (context/selfCheck/
  pitfalls/citations/related — EUR-Lex, W3C, ETSI, OWASP, WebAIM verified);
  `STUB_NOTES` 7→21 → ~24 indexable WCAG pages; stubs auto-emit W3C
  Understanding + EN 301 549 sources, related criteria, "Last reviewed";
  search-matched `docTitle`s; CTA band interpolates topic → verified routes
  `/proof` + `/scan` only; footer += Scan + Verify (5 links, no spam).
- Assets: `scripts/render-og/render-og.mjs` (zero-dep, parses TOPICS from
  worker.js, headless Chrome) → `assets/og/<slug>.png` ×12 + `logo.png`.

**i18n scaffolding** (phase 1 of the de+fr mission):
- `src/i18n/` atomic module — `registry.js` (en active; de/fr **inactive**),
  `ui.en.js` (~110 strings + content arrays), `index.js` (`localeData`,
  `t()` EN-fallback, `localizeTopic`, per-locale notes/names maps).
- worker.js fully dict-driven; locale router — `/de/*` `/fr/*` → **301 to EN**
  while inactive (honesty gate: a locale goes live only when reviewed
  translation files land).
- Per-locale SEO: `<html lang>`, self-canonicals, hreflang pairs +
  `x-default`, `og:locale`/`alternate`, `inLanguage`, `xhtml:link`
  alternates in sitemap.
- Per-locale indexability: a stub is indexable in locale L only when
  `STUB_NOTES_L10N` covers it — no EN-note fallback.

**Verification state**: EN output regression-checked (no leaked keys, all
sections render); `/de`, `/fr` 301s verified; `deploy --dry-run` clean at
97.21 KiB. NOT yet deployed — production still serves the pre-SEO build.

## Pending (in order)

1. **Commit** (above), then **operator deploy**: `wrangler deploy` from
   `edge/info-site/` in PowerShell (OAuth'd wrangler; agent shells never deploy).
2. Post-deploy: Rich Results test on a hub + stub; GSC sitemap submit →
   Bing WMT import. Locked plan steps live in `docs/plan-info-v3-execution.md`.
3. **MT provider decision** (owner + colleague): DeepL recommended —
   bake-off = run both on one hub, pick output. Google Cloud Translation
   Advanced is the in-house alternative. OFFLINE ONLY — never runtime calls.
4. **P2**: `scripts/translate/translate.mjs` — provider-agnostic; reads
   `ui.en.js` + TOPICS + STUB_NOTES; glossary-locked; emits
   `ui/topics/stubNotes.<code>.js` drafts w/ provenance comments; stale-marks
   after EN edits. API key via env only, never committed.
5. **P3**: terminology review vs EUR-Lex official DE/FR + W3C authorized
   translations → flip `active:true` in `registry.js`.
6. **P4**: `render-og --locale`, header language switcher (renders when ≥2
   locales active), Accept-Language suggestion banner (never a redirect).
7. Cross-repo deps (tracked, not here): `.eu` finding→`/rules/wcag-*` deep
   links (engine + portal), TF `dns-info.tf` GSC TXT.

## Invariants — don't break these

- `src/a11y/wcagRegistry.js` is vendored from `C:\compliance-audit-engine` —
  never edit here; re-vendor upstream. `../../src/...` mirrored paths must
  resolve.
- Honesty: noindex stubs stay noindex until notes are hand-written FOR that
  locale; no invented citations/dates/claims; health cards show truth.
- Telemetry `{ip,ref,ua}` heartbeat body = engine contract — change engine
  first, never fork.
- Terraform (`compliance-audit-engine/terraform/cloudflare/`) owns zone/DNS —
  this repo adds none.
- Zero third-party anything, zero JS — translation must be build-time, not
  runtime-API.

## Verify (this machine — WSL quirks)

```bash
# wrangler via Windows node entry (shims fail under WSL):
cd /mnt/c/compliance-audit.info/edge/info-site
"/mnt/c/Program Files/nodejs/node.exe" \
  "C:\Users\terry\AppData\Roaming\npm\node_modules\wrangler\bin\wrangler.js" dev --port 8787 --ip 0.0.0.0
# probe from Windows side — WSL curl can't reach the port:
/mnt/c/Windows/System32/curl.exe -s -o NUL -w "%{http_code}\n" http://127.0.0.1:8787/
```

OG regen: `node.exe C:\compliance-audit.info\scripts\render-og\render-og.mjs`
(after hub title/framework changes).
