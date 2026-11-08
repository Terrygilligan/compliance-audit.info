// src/i18n — atomic locale layer for compliance-audit.info.
// Self-contained (no project imports) so it can be dropped into any site:
//   registry.js        locale flags + metadata
//   ui.<code>.js       STRINGS + TOPICS_L10N + STUB_NOTES_L10N + CRIT_NAMES
//
// English is the source of truth: locale files override a subset; missing
// keys/strings fall back to English at render — a locale file can land
// incrementally without breaking pages.

import { LOCALES, DEFAULT_LOCALE } from './registry.js';
import { STRINGS as EN, TOPICS_L10N as EN_TOPICS, STUB_NOTES_L10N as EN_NOTES, CRIT_NAMES as EN_NAMES } from './ui.en.js';

// Overlay tables — add a locale's files here when its translation lands.
const OVERLAY = {
  en: { strings: EN, topics: EN_TOPICS, notes: EN_NOTES, names: EN_NAMES },
  // de: { strings: DE, topics: DE_TOPICS, notes: DE_NOTES, names: DE_NAMES },
  // fr: { strings: FR, topics: FR_TOPICS, notes: FR_NOTES, names: FR_NAMES },
};

// Everything a page render needs for one locale: merged strings dict +
// content-override maps. Always returns English fallbacks for gaps.
export function localeData(locale) {
  const o = OVERLAY[locale] || OVERLAY[DEFAULT_LOCALE];
  return {
    locale: OVERLAY[locale] ? locale : DEFAULT_LOCALE,
    strings: { ...EN, ...o.strings },
    topics: o.topics,
    notes: o.notes,
    names: o.names,
  };
}

// t(dict, key, {vars}) — dict lookup with inline {placeholder} substitution.
// Missing keys surface the EN string; missing that, the raw key (visible in
// dev output, never a crash).
export function t(strings, key, vars = {}) {
  let s = strings[key] ?? EN[key] ?? key;
  if (typeof s !== 'string') return s; // arrays/objects pass through raw
  for (const [k, v] of Object.entries(vars)) {
    s = s.split(`{${k}}`).join(String(v));
  }
  return s;
}

// Merge a TOPICS entry with its locale override fields (title/context/rule/
// build/selfCheck/pitfalls/citations/docTitle as translated).
export function localizeTopic(topic, topicsMap) {
  const o = topicsMap && topicsMap[topic.slug];
  return o ? { ...topic, ...o } : topic;
}

// Per-locale active check used by the router.
export function isActive(code) {
  return Boolean(LOCALES[code] && LOCALES[code].active);
}

export { LOCALES, DEFAULT_LOCALE };
