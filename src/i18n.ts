import { LANGS, type Lang, type Text, type YearMonth } from './data/types';

const t = (fr: string, en: string): Text => ({ fr, en });

export const UI = {
  tagline: t('Une histoire tracée d’un seul trait.', 'A story told with a single line.'),
  life: t('Vie', 'Life'),
  career: t('Carrière', 'Career'),
  soon: t('bientôt', 'soon'),
  choose: t('Choisir un chemin · son activé', 'Choose a path · sound on'),
  soundOn: t('Son activé', 'Sound on'),
  soundOff: t('Son coupé', 'Sound off'),
  again: t('Retracer', 'Draw it again'),
  back: t('Chemins', 'Paths'),
  hint: t('Maintenir pour accélérer · ← → étapes', 'Hold to hurry · ← → stops'),
  remote: t('À distance', 'Remote'),
  workedFrom: t('Travaillé depuis', 'Worked from'),
  onSite: t('sur place', 'on site'),
  today: t('aujourd’hui', 'today'),
  close: t('Fermer', 'Close'),
} as const satisfies Record<string, Text>;

const STORAGE_KEY = 'lifeline.lang';
const isLang = (v: string | null): v is Lang => LANGS.includes(v as Lang);

/** URL first, then the visitor's last choice, then the browser's language. */
export function detectLang(): Lang {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (isLang(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // Storage can be unavailable (private mode, sandboxed frames): fall through.
  }
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not remembered, but the page still switches.
  }
}

const formats: Record<Lang, Intl.DateTimeFormat> = {
  fr: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }),
  en: new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }),
};

export const monthYear = (ym: YearMonth, lang: Lang): string => {
  const [y, m] = ym.split('-').map(Number);
  return formats[lang].format(new Date(y ?? 0, (m ?? 1) - 1, 1));
};

export const monthSpan = (from: YearMonth, to: YearMonth | null, lang: Lang): string =>
  `${monthYear(from, lang)} – ${to ? monthYear(to, lang) : UI.today[lang]}`;

export const currentMonth = (): YearMonth => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` as YearMonth;
};
