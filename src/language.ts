import { LANGS, type Lang } from './data/types';

const STORAGE_KEY = 'lifeline.lang';

/** Whether a string is one of the site's languages. */
export const is = (value: string | null): value is Lang => LANGS.includes(value as Lang);

/** The language to show: the URL's first, then the visitor's last choice, then the browser's language. */
export function detect(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (is(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (is(saved)) return saved;
  } catch {
    // Storage can be unavailable (private mode, sandboxed frames): fall through.
  }
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

/** Remembers the visitor's choice of language for their next visit. */
export function save(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not remembered, but the page still switches.
  }
}
