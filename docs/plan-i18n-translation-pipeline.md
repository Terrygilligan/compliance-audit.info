---
status: spec — approved direction, not yet implemented
created: 2026-11-09
target repo: compliance-audit.info
---

# i18n translation pipeline — eTranslation REST v2 → `ui.<locale>.js`

Offline batch translation of the site's English source-of-truth into the
locale overlay files (`src/i18n/ui.de.js`, `ui.fr.js`, …). Fulfils the
README promise: *"translations are produced offline by a provider-agnostic
script, terminology-reviewed, never runtime-API'd."*

## 1. Why eTranslation (and when not)

**eTranslation REST v2** (`https://language-tools.ec.europa.eu/etranslation/api`)
is the primary engine:

- Trained on EUR-Lex — official EU legislation translations. For GDPR/DORA/
  ePrivacy/WCAG terminology this is the strongest corpus match available.
- Free for SMEs/EU entities via EU Login registration:
  `https://language-tools.ec.europa.eu/registerApiKey` (credentials arrive
  by email — Application Name + password = HTTP Basic auth).
- EU-resident service — consistent with the project's residency story.
- **v1/SOAP are decommissioned (2026-10-31). v2 only.**

Its one ergonomic wart: **v2 is async + callback-based** — `askTranslate`
returns `{requestId}`; results arrive via HTTP callback (or FTP/SFTP).
For a build-time script we bridge this with a local receiver + a
`cloudflared` quick tunnel (no Cloudflare account needed for quick
tunnels), or one document-mode request per locale (see §5).

**Fallback adapter — DeepL API Free** (`https://api-free.deepl.com`):
synchronous, 500k chars/mo free — our volume is ~50–80k chars/locale.
Same adapter interface, used when eT credentials aren't ready or for a
quick sanity re-run. German company, GDPR-clean, still on-brand.

**`--engine mock`**: zero-network pseudo-translation (echoes text, tags
each string) so the whole pipeline — extraction, protection, file emit,
overlay merge — is verifiable before any credentials exist.

## 2. Translatable inventory

| Source | Where it lives | Fields to translate | Never translate |
|---|---|---|---|
| `STRINGS` | `src/i18n/ui.en.js` (~90 keys) | string values; `[title, body]` array pairs (`home.standards`, `home.commitments`, `home.stats.*`) | keys; `{placeholders}`; brand names |
| `TOPICS` (12 articles) | `edge/info-site/worker.js` | `docTitle`, `title`, `context`, `rule`, `build`, `selfCheck[]`, `pitfalls[]`, `citations[][0]` (labels), `engine` | `slug`, `framework` (EN grouping key — localized via `fw.*` strings), `chip`, `related`, `citations[][1]` (URLs) |
| `STUB_NOTES` (per criterion) | `edge/info-site/worker.js` | `example`, `pitfall` | criterionId; HTML/code samples inside `example` |
| `CRIT_NAMES` | `src/a11y/wcagRegistry.js` names | criterion display names (~55) | criterionId, level, principle slug |

`ui.en.js` exports `TOPICS_L10N/STUB_NOTES_L10N/CRIT_NAMES` as `{}` — the
locale overlay maps are empty by design; the pipeline fills them.

> **Honesty rule already enforced in worker.js:** a WCAG stub is
> indexable-in-locale only when `STUB_NOTES_L10N` has notes written *for
> that locale* — never EN fallback. A locale can ship TOPICS-only first
> and backfill stubs later.

## 3. Protection layer (before MT sees a byte)

Every segment passes a tokenizer that replaces these with numbered
sentinels (`⟦0⟧`, `⟦1⟧`, …) and restores them post-translation:

- `{placeholders}` — `{date}`, `{count}`, `{zone}`, `{id}`, `{name}`,
  `{level}`, `{tiers}`, `{clause}`, `{topic}`, `{site}`
- URLs — `https://…` anywhere in a value
- Code/markup samples — `<img src=…>`, `<ul><li>`, `<label for>`, CSS/HTML
  fragments inside `STUB_NOTES.example`
- Endpoint/identifier literals — `POST /v1/sanitize`, `cmp_demo_*`,
  `europe-west1`, `europe-west2`, `api.compliance-audit.eu`
- Brand/proper nouns — *Compliance Audit*, *WCAG 2.2*, *EN 301 549*,
  *ePrivacy*, *Firestore*, *DORA* (GDPR **is** translatable → DSGVO/RGPD —
  handled via glossary, not the blocklist)

**Post-restore assertion:** sentinel count in the returned string must
equal the sent count; mismatch → segment lands in the report flagged
`REVIEW`, value written as EN-fallback with a `// REVIEW:` comment, never
silently shipped.

## 4. Glossary (terminology pinning)

`scripts/translate/glossary.<code>.tsv` — curated EN↔target pairs attached
to the eTranslation request (v2 accepts a glossary document in the same
call) and to DeepL's glossary param. Seed list lives in the repo — the
reviewer extends it; it IS the terminology-review artifact:

```
data minimisation	Datenminimierung
right to erasure	Recht auf Löschung
supervisory authority	Aufsichtsbehörde
data residency	Datenresidenz
tamper-evident	manipulationssicher
controller	Verantwortlicher
processor	Auftragsverarbeiter
```

## 5. Pipeline design

`scripts/translate-i18n/` (mirrors `scripts/render-og/` layout; Node ≥22,
zero deps — `node:https`, `node:fs`):

```
node scripts/translate-i18n/translate.mjs \
  --locale de --engine etranslation [--only strings|topics|stubs|names] \
  [--dry-run] [--out src/i18n/ui.de.js]
```

Flow:

1. **Extract** — import `ui.en.js` + statically parse the `TOPICS` /
   `STUB_NOTES` / `WCAG_CRITERIA` literals out of `worker.js` (same
   sentinel-safe extraction; topics are plain object literals).
   Yields `~350–450` segments/locale ≈ 50–80k chars.
2. **Protect** — sentinel pass (§3).
3. **Batch** — *document mode preferred*: one TSV/plaintext document with
   one segment per line (`<key>\t<sentinel-safe text>`) → a single
   `askTranslate` request per locale (multi-target allowed — one callback
   per language). Keeps per-segment alignment, avoids hundreds of calls.
   Glossary file attached in the same multipart request.
   *Text mode* (per-segment `textToTranslate`) is the fallback path.
4. **Receive** — local HTTP receiver (`node:http`, random port, single
   POST handler) + `cloudflared tunnel --url http://localhost:PORT`
   printed URL fed into `deliveries.http` / `notifications.*`. Without
   `cloudflared`, accept `--callback-base <url>` for any public endpoint.
   Timeout 10 min → fail loud, keep partial.
5. **Emit** — `src/i18n/ui.<code>.js`: same export shape as `ui.en.js`,
   header `// MT (eTranslation REST v2, YYYY-MM-DD) — PENDING TERMINOLOGY
   REVIEW. Do not flip registry.js active:true until reviewed.`,
   REVIEW-flagged segments as EN + comment.
6. **Report** — stdout + `docs/i18n/<code>-report.md`: keys translated,
   chars sent, sentinel mismatches, cost-0 confirmation.

`--dry-run` prints the segment table (what would be sent, protected vs
raw) without any network.

## 6. Review & activation gate (unchanged honesty rule)

1. `node translate.mjs --locale de` produces `ui.de.js`.
2. Native/fluent reviewer edits strings in place — assisted by
   `docs/i18n/de-review-checklist.md` (generated: every `REVIEW` segment +
   the glossary table + EUR-Lex URL check).
3. Reviewer signs off → flip `LOCALES.de.active` in `registry.js` →
   `wrangler deploy` (operator step).
4. Worker already handles the rest: `/de/…` prefix routes stop 301ing,
   hreflang alternates + `og:locale:alternate` + sitemap `xhtml:link`
   pick the locale up automatically — **no worker.js change needed**.

**Citation localization (review step, not automated):** EUR-Lex URLs carry
the language in the path — `…/legal-content/EN/TXT/` → `/DE/`/`/FR/`
serves the official localized text. The reviewer (or a tiny post-pass)
swaps it per locale; never let MT touch URLs.

## 7. Out of scope (v1)

- Portal (`app.compliance-audit.eu`) i18n — different file shape (nested
  object literals, its own EN/DE). Reusable later via the same segment
  extractor if wanted.
- Runtime translation — never. Static emit only.
- Localized slugs — slugs are URL identifiers and stay EN forever
  (canonical mapping + `related` links depend on it).

## 8. Acceptance criteria

- `--engine mock --locale de --dry-run` prints the full segment table
  offline with correct protection.
- Mock run emits a valid `ui.mock-test.js` that `index.js` overlays
  without error (`node -e` import smoke check).
- Real run (when credentials land) produces `ui.de.js` covering 100% of
  TOPICS + STRINGS; stubs optional per-locale (honesty rule).
- No sentinel placeholders, URLs, or brand terms appear translated in the
  emitted file (grep-able report).
- `registry.js` untouched until human review — activation is a deliberate
  one-line diff, not a side effect.

## 9. Open items for the owner

- **Register for eTranslation API credentials** (EU Login →
  `registerApiKey`) — free, SME-eligible, arrives by email.
- DeepL Free API key as the interim/fallback adapter (optional).
- Which locales after `de`/`fr` — `registry.js` already defines both;
  adding more is a one-line entry + a new `ui.<code>.js`.
- `cloudflared` availability on this machine for the callback bridge
  (fallback: `--callback-base` to any public endpoint, or FTP delivery).
