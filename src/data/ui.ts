import { bilingual, type Text } from './types';

/** Every string of the interface, by key; elements with `data-i18n` name their key. */
export const UI = {
  again: bilingual('Retracer', 'Draw it again'),
  back: bilingual('Chemins', 'Paths'),
  career: bilingual('Carrière', 'Career'),
  choose: bilingual('Choisir un chemin · son activé', 'Choose a path · sound on'),
  hint: bilingual(
    'Maj ou clic maintenu pour accélérer · Espace pause · Molette pour avancer ou reculer · ← → étapes',
    'Hold Shift or click to hurry · Space to pause · Scroll to rewind or skip ahead · ← → stops',
  ),
  life: bilingual('Vie', 'Life'),
  onSite: bilingual('sur place', 'on site'),
  pause: bilingual('Pause', 'Pause'),
  remote: bilingual('À distance', 'Remote'),
  resume: bilingual('Reprendre', 'Play'),
  soon: bilingual('bientôt', 'soon'),
  soundOff: bilingual('Son coupé', 'Sound off'),
  soundOn: bilingual('Son activé', 'Sound on'),
  tagline: bilingual('Une histoire tracée d’un seul trait.', 'A story told with a single line.'),
  today: bilingual('aujourd’hui', 'today'),
  workedFrom: bilingual('Travaillé depuis', 'Worked from'),
} as const satisfies Record<string, Text>;

/** The captions that open and close the career, around the stops' own. */
export const CAREER_CAPTIONS = {
  /** Told as the line sets off. */
  opening: bilingual('Ma carrière, d’un seul trait.', 'My career, in a single line.'),
  /** Stays under the overview of the whole career. */
  overview: bilingual('Chaque poste a laissé sa forme sur la ligne.', 'Every job left its shape on the line.'),
  /** Told as the camera pulls back from the last stop. */
  stepBack: bilingual('Prendre du recul.', 'Step back.'),
} as const satisfies Record<string, Text>;
