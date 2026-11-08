// Locale registry — the single switchboard for site languages.
// `active:false` locales keep their prefix routing but 301 to the EN
// equivalent until their translation files land (honesty rule: a locale goes
// live only when its content is terminology-reviewed).
export const LOCALES = {
  en: { name: 'English', ogLocale: 'en_GB', prefix: '', active: true },
  de: { name: 'Deutsch', ogLocale: 'de_DE', prefix: '/de', active: false },
  fr: { name: 'Français', ogLocale: 'fr_FR', prefix: '/fr', active: false },
};

export const DEFAULT_LOCALE = 'en';
