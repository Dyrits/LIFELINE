/** The languages of the site, French first: it is the source. */
export const LANGS = ['fr', 'en'] as const;
/** A language code, as in the URL, storage and `<html lang>`. */
export type Lang = (typeof LANGS)[number];

/** A piece of text written in every supported language. */
export type Text = Readonly<Record<Lang, string>>;

/** A text from its French and its English. */
export const bilingual = (fr: string, en: string): Text => ({ en, fr });

/** A month, written YYYY-MM. */
export type YearMonth = `${number}-${number}${number}`;

/** Shapes the pen can draw on the line; each has a builder in `career/motifs.ts`. */
export type ShapeKey =
  | 'Newspaper'
  | 'Barcode'
  | 'Bolt'
  | 'SkeletonWeed'
  | 'Pan'
  | 'Pickets'
  | 'CandiBentar'
  | 'BrowserGallery'
  | 'BrowserCode'
  | 'BrowserCalendar'
  | 'Ambulance'
  | 'Backpack'
  | 'Bars'
  | 'Plane'
  | 'Bubble'
  | 'Mortarboard'
  | 'Book'
  | 'Frame'
  | 'Blueprint'
  | 'Phone'
  | 'Card'
  | 'Cloud';

/** What the pen draws for a stop: a shape, or apprentice threads branching off the line. */
export type MotifKey = ShapeKey | 'Apprentices';

/** A job or a training, as told on a card. */
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

/** A place worked from remotely, or `'OnSite'` for time spent at the stop itself. */
export type RemotePlace = Text | 'OnSite';

/** A stop on the career line: one place and the entries told on its card. */
export type CareerStop = Readonly<{
  /** Training stops are drawn by the gold thread. */
  kind: 'Job' | 'Training';
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
  way?: ShapeKey;
  /** A short trip: the stretch of line leading to this stop passes a signpost, the last place to the left, this one to the right. */
  signpost?: boolean;
  /** Each entry gets its own card: the first below the line, the others beside the shape with the same index. */
  split?: boolean;
  remoteFrom?: readonly RemotePlace[];
  entries: readonly [Entry, ...Entry[]];
}>;

/** Where a name is written against its place. */
export type Side = 'Left' | 'Right' | 'Above' | 'Below';

/** A place on a route, at [longitude, latitude], its name written on the given side of it. */
export type Place = Readonly<{
  name: Text;
  at: readonly [longitude: number, latitude: number];
  side: Side;
}>;
