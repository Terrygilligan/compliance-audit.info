# compliance-audit.info

The `compliance-info-site` Cloudflare Worker — a single-file technical-reference
site serving **https://compliance-audit.info**, the feeder/reference surface for
the Sovereign Compliance & Billing Engine (`app.compliance-audit.eu`).

What it serves (v3, live since 2026-11-07; SEO pass 2026-11-07): `/rules/<slug>`
canonical rule articles — 12 hand-written authority hubs (context, self-check,
pitfalls, sources, related rules) plus programmatic WCAG stubs (~55, `noindex`
until hand-polished via `STUB_NOTES`; ~24 indexable today). Each article carries
`TechArticle`/`BreadcrumbList` JSON-LD, per-slug OG cards, verified source
citations (EUR-Lex/W3C/ETSI), and a topic-interpolated CTA to `/proof`+`/scan`
on `.eu`. `/t/<slug>` 301s, true 404s, edge-served `robots.txt`/`sitemap.xml`/
`llms.txt` (sitemap lists indexable URLs only), ETag/`Last-Modified` conditional
requests, `/favicon.ico`, and zero-JS telemetry pings to the engine's `{ip,ref}`
heartbeat.

## Layout

```
edge/info-site/            deployable Worker package
  worker.js                the entire site (one file)
  wrangler.toml            routes, ASSETS binding, compatibility date
  assets/og/*.png          OG binaries served via env.ASSETS — per-slug cards
                           for the 12 hubs + logo.png (Organization JSON-LD)
src/a11y/wcagRegistry.js   VENDORED — canonical copy lives in
                           compliance-audit-engine/src/a11y/wcagRegistry.js
src/i18n/                  ATOMIC locale layer (no project imports inside):
  registry.js              locale flags — `active:false` → /de/, /fr/ 301 to EN
  ui.en.js                 English source-of-truth strings (all site copy)
  index.js                 loader + t() fallback + localizeTopic
scripts/render-og/         offline OG card renderer (headless Chrome, no deps)
docs/                      v3 spec + DNS inventory (reference)
```

i18n wiring is live but EN-only: hreflang/og:locale/inLanguage emit per page,
hreflang alternates ride in `sitemap.xml` (`xhtml:link`), and `/de/`+`/fr/`
bounce to EN equivalents until `ui.<code>.js` translation files land (flip
`active` in `registry.js` at launch — translations are produced offline by a
provider-agnostic script, terminology-reviewed, never runtime-API'd).

Regenerate OG cards after changing hub titles/frameworks:

```powershell
"C:\Program Files\nodejs\node.exe" C:\compliance-audit.info\scripts\render-og\render-og.mjs
```

The `src/a11y/` path shape is deliberate: `worker.js` imports
`../../src/a11y/wcagRegistry.js`, so the mirrored layout keeps the code
byte-identical with the engine repo — **re-copy the registry from
`C:\compliance-audit-engine` whenever criteria change** (the WCAG stubs
generate from it).

## Deploy

```powershell
cd C:\compliance-audit.info\edge\info-site
wrangler dev      # local preview
wrangler deploy   # production (OAuth'd wrangler, Windows PowerShell)
```

Routes bind `compliance-audit.info/*` + `www.compliance-audit.info/*` on the
zone's proxied apex/www records. Zone + DNS + settings are managed in
`compliance-audit-engine/terraform/cloudflare/` (`zone-info.tf`,
`dns-info.tf`) — **do not** recreate them here; Terraform there is the source
of truth.

## Verify

`https://compliance-audit.info/` → 200, `www.` → 301 apex, `/rules` → 200,
unknown `/rules/*` → true 404. Engine side: heartbeat pings arrive with
real visitor IPs (`{ip,ref}` body extension — deployed in the engine).
