export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** A piece of text written in every supported language. */
export type Text = Readonly<Record<Lang, string>>;

/** A month, written YYYY-MM. */
export type YearMonth = `${number}-${number}${number}`;

/** Shapes the pen can draw for a stop; each key has a builder in `career/motifs.ts`. */
export type MotifKey =
  | 'door'
  | 'barcode'
  | 'bolt'
  | 'furrows'
  | 'pan'
  | 'pickets'
  | 'browserGallery'
  | 'browserCode'
  | 'browserCalendar'
  | 'routeCross'
  | 'bars'
  | 'plane'
  | 'bubble'
  | 'mortarboard'
  | 'book'
  | 'frame'
  | 'blueprint'
  | 'phone'
  | 'apprentices'
  | 'card'
  | 'cloud';

export type Entry = Readonly<{
  company: string;
  role: Text;
  from: YearMonth;
  /** `null` while the position is still held. */
  to: YearMonth | null;
  remote?: boolean;
  /** A framing label that is not a skill, such as a visa. */
  context?: Text;
  summary?: Text;
  bullets?: readonly Text[];
}>;

/** A place worked from remotely, or `'on-site'` for time spent at the stop itself. */
export type RemotePlace = Text | 'on-site';

export type CareerStop = Readonly<{
  /** Training stops are drawn by the gold thread. */
  kind: 'job' | 'training';
  place: Text;
  country?: Text;
  /** Replaces the company name on the stop's label. */
  label?: Text;
  motifs: readonly MotifKey[];
  remoteFrom?: readonly RemotePlace[];
  entries: readonly [Entry, ...Entry[]];
}>;

export type Profile = Readonly<{
  name: string;
  title: Text;
  tagline: Text;
  location: Text;
}>;
