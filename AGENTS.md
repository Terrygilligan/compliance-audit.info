# AGENT.md — compliance-audit.info

Working rules for AI assistants in this repo.

- **This repo is one Cloudflare Worker site.** The entire site is
  `edge/info-site/worker.js` — single file, zero runtime deps, no build step.
- **Vendored file discipline:** `src/a11y/wcagRegistry.js` is copied from
  `C:\compliance-audit-engine\src\a11y\wcagRegistry.js`. Never edit it here —
  edit the canonical copy upstream and re-vendor (`cp`). The
  `../../src/a11y/` relative path must keep resolving (mirrored layout).
- **Do not add Terraform/Wrangler zone config.** DNS, zone settings, and
  proxied flags live in `compliance-audit-engine/terraform/cloudflare/` —
  that stack owns the zone. This repo only owns the Worker code + assets.
- **Deploys are operator-run** from Windows PowerShell (`wrangler deploy` in
  `edge/info-site/`). Agent shells can `wrangler dev` for verification but
  should not deploy without an explicit go-ahead.
- **Honesty rules carry over from the engine:** noindex stubs stay noindex
  until their `STUB_NOTES` are hand-written; never publish compliance claims
  the site can't substantiate; telemetry stays zero-JS/payload-only.
- **Engine contract coupling:** telemetry pings hit
  `POST /v1/telemetry/heartbeat` on `api.compliance-audit.eu` with
  `{ip, ref, ua}` — that body shape is an engine contract (`src/common/
  telemetry.js`); if it changes, update this worker, don't fork it.
- Commit from PowerShell with per-command identity
  (`git -c user.name=... -c user.email=...`); pushes are PowerShell-only.
