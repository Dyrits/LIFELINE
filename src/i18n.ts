import { LANGS, type Lang, type Text, type YearMonth } from './data/types';

const t = (fr: string, en: string): Text => ({ en, fr });

export const UI = {
  again: t('Retracer', 'Draw it again'),
  back: t('Chemins', 'Paths'),
  career: t('Carrière', 'Career'),
  choose: t('Choisir un chemin · son activé', 'Choose a path · sound on'),
  close: t('Fermer', 'Close'),
  hint: t(
    'Maj ou clic maintenu pour accélérer · Espace pause · Molette pour avancer ou reculer · ← → étapes',
    'Hold Shift or click to hurry · Space to pause · Scroll to rewind or skip ahead · ← → stops',
  ),
  life: t('Vie', 'Life'),
  onSite: t('sur place', 'on site'),
  pause: t('Pause', 'Pause'),
  remote: t('À distance', 'Remote'),
  resume: t('Reprendre', 'Play'),
  soon: t('bientôt', 'soon'),
  soundOff: t('Son coupé', 'Sound off'),
  soundOn: t('Son activé', 'Sound on'),
  tagline: t('Une histoire tracée d’un seul trait.', 'A story told with a single line.'),
  today: t('aujourd’hui', 'today'),
  workedFrom: t('Travaillé depuis', 'Worked from'),
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
  en: new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }),
  fr: new Intl.DateTimeFormat('fr-FR', { month: 'short', year: 'numeric' }),
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
