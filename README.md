# compliance-audit.info

The `compliance-info-site` Cloudflare Worker — a single-file technical-reference
site serving **https://compliance-audit.info**, the feeder/reference surface for
the Sovereign Compliance & Billing Engine (`app.compliance-audit.eu`).

What it serves (v3, live since 2026-11-07): `/rules/<slug>` canonical rule
articles, `/t/<slug>` 301s, true 404s, edge-served `robots.txt`/`sitemap.xml`/
`llms.txt`, a `/rules` index, ~55 programmatic WCAG stubs (`noindex` until
hand-polished via `STUB_NOTES`), `TechArticle`/`BreadcrumbList`/`WebSite`/
`Organization` JSON-LD, OG images via the `ASSETS` binding, and zero-JS
telemetry pings to the engine's `{ip,ref}` heartbeat.

## Layout

```
edge/info-site/            deployable Worker package
  worker.js                the entire site (one file)
  wrangler.toml            routes, ASSETS binding, compatibility date
  assets/og/*.png          OG binaries served via env.ASSETS
src/a11y/wcagRegistry.js   VENDORED — canonical copy lives in
                           compliance-audit-engine/src/a11y/wcagRegistry.js
docs/                      v3 spec + DNS inventory (reference)
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
