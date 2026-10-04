export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

/** A piece of text written in every supported language. */
export type Text = Readonly<Record<Lang, string>>;

/** A month, written YYYY-MM. */
export type YearMonth = `${number}-${number}${number}`;

/** Shapes the pen can draw for a stop; each key has a builder in `career/motifs.ts`. */
export type MotifKey =
  | 'newspaper'
  | 'barcode'
  | 'bolt'
  | 'skeletonWeed'
  | 'pan'
  | 'pickets'
  | 'candiBentar'
  | 'browserGallery'
  | 'browserCode'
  | 'browserCalendar'
  | 'ambulance'
  | 'backpack'
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
  /** The line of story told while the stop is drawn, in the first person. */
  caption: Text;
  /** Opens a chapter of the story: told on the stretch of line leading to this stop. */
  chapter?: Text;
  /** The stretch of line leading to this stop flies over a map, through these places: the stop is far away. */
  route?: readonly Place[];
  /** A shape drawn on the stretch of line leading to this stop, while its chapter is told. */
  way?: Exclude<MotifKey, 'apprentices'>;
  /** A short trip: the stretch of line leading to this stop passes a signpost, the last place to the left, this one to the right. */
  signpost?: boolean;
  /** Each entry gets its own card: the first below the line, the others beside the shape with the same index. */
  split?: boolean;
  remoteFrom?: readonly RemotePlace[];
  entries: readonly [Entry, ...Entry[]];
}>;

/** A place on a route, at [longitude, latitude], its name written on the given side of it. */
export type Place = Readonly<{
  name: Text;
  at: readonly [lon: number, lat: number];
  side: 'left' | 'right' | 'above' | 'below';
}>;

export type Profile = Readonly<{
  name: string;
  title: Text;
  tagline: Text;
  location: Text;
}>;
