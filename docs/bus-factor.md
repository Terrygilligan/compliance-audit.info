# Bus Factor — compliance-audit.info

If the owner is hit by a bus tomorrow, this is the survival protocol. Read
`docs/HANDOVER.md` first (current state), `AGENTS.md` (working rules), then this.

## What this thing is

One Cloudflare Worker (`edge/info-site/worker.js`) = the entire public
reference site at `https://compliance-audit.info`. It exists to (a) rank for
the compliance queries buyers actually search and funnel them to
`compliance-audit.eu`, and (b) prove the product practices what it audits —
strict headers, zero tracking, zero third-party assets. It is NOT a blog and
must not drift into one. The whole file is HTML templates + data tables; no
build, no deps, no JS shipped to browsers.

## If you only remember 5 things

1. **Nothing is committed/deployed automatically.** All work lives in the
   working tree until someone commits from PowerShell and runs `wrangler
   deploy` (operator OAuth only — never from an agent shell).
2. **The honesty rules ARE the product.** noindex stubs stay noindex until
   notes are hand-written for that locale; never invent citations, dates,
   stats, or uptime; a down node shows UNREACHABLE, not green.
3. **`src/a11y/wcagRegistry.js` is vendored.** Edit the canonical copy in
   `C:\compliance-audit-engine`, re-copy here. Never edit in place.
4. **Sibling repos own things**: zone/DNS = engine's `terraform/cloudflare/`;
   portal = `C:\app.compliance-audit.eu`; this repo owns ONLY the Worker +
   assets + `src/i18n`.
5. **Translation is build-time, never runtime.** No translation API calls
   from the Worker — that would leak visitor IPs and break the
   zero-third-party/residency story that IS the brand.

## Environment faults (this machine — learned the hard way)

- Agent shell is **WSL**; tools live on Windows. `wrangler`, `npm`, `firebase`
  shims fail — invoke via `"/mnt/c/Program Files/nodejs/node.exe"
  "C:\Users\terry\AppData\Roaming\npm\node_modules\<tool>\...\entry.js"`.
- **WSL can't reach Windows localhost.** Probe the dev server with
  `/mnt/c/Windows/System32/curl.exe` or a PowerShell `-File` script, not WSL
  curl (timeouts) — or bind `--ip 0.0.0.0` and hit the host IP.
- **curl.exe needs Windows paths** for `-o`/`-D`; WSL `/mnt/c/...` paths fail
  silently or mangle to `C:\mnt\c\...`.
- **Bash `for`-loop variables expand EMPTY** in this shell — never write
  `for p in ...; do curl ".../$p"`. Use literal URLs or PowerShell scripts.
- `$(curl.exe -w ...)` substitution returns empty — print directly or write
  response to a file and grep it.
- `chrome.exe --headless --screenshot=out.png --window-size=WxH file:///...`
  works for renders/screenshots; harmless `installwebapp` errors appear on
  some launches.
- Chrome/firewall may block WSL→Windows ports even bound 0.0.0.0 — probe
  Windows-side only.

## Architectural traps

- `../../src/a11y/` and `../../src/i18n/` relative imports — the mirrored
  layout is deliberate; moving files breaks bundling.
- `worker.js` is single-file on purpose — adding a second source file is a
  design decision, not a refactor.
- ETag/304 depends on `generatedAt` staying hour-quantized — don't re-add
  seconds.
- The homepage health cache (60s, isolate-scoped) is there because two live
  Cloud Run fetches made worst-case TTFB 2.5s — don't remove it, don't cache
  longer (honesty window).
- `resolveArticle`/`stubArticle` take `L` (localeData) — calling them
  without it will throw on `L.strings` lookups.
- STUB_NOTES (EN) lives in worker.js; per-locale notes live in
  `src/i18n/stubNotes.<code>.js` — don't merge them; the indexability gate
  depends on per-locale presence.
- `localizeTopic` merges TOPICS overrides from `ui.<code>.js` `TOPICS_L10N` —
  locale files override fields by slug; unknown slugs pass through safely.

## Access checklist (what you'd need to operate)

- **Deploy**: OAuth'd `wrangler` on Windows (owner's account), CF account
  `81ad5ec0…`, worker `compliance-info-site`, zone + DNS owned by Terraform
  in `compliance-audit-engine`.
- **Sibling checkouts**: `C:\compliance-audit-engine` (vendoring + TF +
  telemetry contract), `C:\app.compliance-audit.eu` (portal link targets —
  verify routes exist before linking: `/scan` `/proof` `/trust` `/verify`
  exist; `/vpat` `/badge` do NOT).
- **Secrets**: none in this repo. MT API key (when chosen) goes in env /
  `.dev.vars` — never committed.
- **Git**: commit via `git -c user.name=Terrygilligan -c
  user.email=Terrygilligan@users.noreply.github.com` (PowerShell, per-command
  identity; don't write git config).

## Recovery playbook

- **Site down/misrendered**: `wrangler dev` locally first; worker is one
  file — `git diff`/`git log` bisects fast. Rollback = `git checkout` prior
  commit + `wrangler deploy`.
- **Broken locale page**: flip `active:false` in `src/i18n/registry.js` →
  locale 301s to EN instantly (safe kill switch, no deploy risk).
- **Missing OG image**: page still 200s — regenerate via
  `scripts/render-og/render-og.mjs`.
- **wcagRegistry drift**: re-copy from engine `src/a11y/wcagRegistry.js`
  (same path) — never patch locally.

## Doc-keeping rule

Update `HANDOVER.md` + this file **in the same change** that alters deploy
state, adds a route/locale, changes a contract, or discovers a new machine
quirk. A stale handover is how parallel agents ship incompatible work.
