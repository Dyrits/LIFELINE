import type { CareerStop, Entry, Lang } from '../data/types';
import { UI } from '../data/ui';
import { PEN_AHEAD, type Player } from '../engine/player';
import type { Renderer } from '../engine/render';
import * as month from '../month';
import type { StopMark } from './build';

const escapeHtml = (text: string): string =>
  text.replace(
    /[&<>"']/g,
    character => ({ "'": '&#39;', '"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character] ?? character,
  );

/** The entries a stop's card tells: all of them, or only the first when the stop is split. */
const ownEntries = (stop: CareerStop): readonly Entry[] => (stop.split ? stop.entries.slice(0, 1) : stop.entries);

const year = (entries: readonly Entry[]): string => (entries[0] as Entry).from.slice(0, 4);

/** The short name on a stop's tag: its label, else its companies; freelance missions are told apart by place. */
export function tagName(stop: CareerStop, lang: Lang, entries = ownEntries(stop)): string {
  if (stop.label) return stop.label[lang];
  const companies = [...new Set(entries.map(entry => entry.company))].join(' · ');
  return companies === 'Freelance' ? `${companies} · ${stop.place[lang]}` : companies;
}

/** The years a card covers: "2013 – 2016", a single year, or up to today. */
function period(entries: readonly Entry[], lang: Lang): string {
  const first = Math.min(...entries.map(entry => Number(entry.from.slice(0, 4))));
  const ongoing = entries.some(entry => entry.to === null);
  const last = Math.max(...entries.map(entry => Number((entry.to ?? entry.from).slice(0, 4))));
  if (ongoing) return `${first} – ${UI.today[lang]}`;
  return first === last ? String(first) : `${first} – ${last}`;
}

/** A card's note, after the WAYPOINTS V3 cards: place and years, then each job by company, role and dates. */
function body(stop: CareerStop, lang: Lang, entries: readonly Entry[]): string {
  const where = stop.country ? `${stop.place[lang]}, ${stop.country[lang]}` : stop.place[lang];
  const sections = entries
    .map(entry => {
      const badges = [
        entry.remote ? `<span class="badge away">${escapeHtml(UI.remote[lang])}</span>` : '',
        entry.context ? `<span class="badge">${escapeHtml(entry.context[lang])}</span>` : '',
      ].join('');
      const bullets = entry.bullets?.length
        ? `<ul>${entry.bullets.map(bullet => `<li>${escapeHtml(bullet[lang])}</li>`).join('')}</ul>`
        : '';
      return `<section>
        <h3>${escapeHtml(entry.company)}</h3>
        <p class="role">${escapeHtml(entry.role[lang])}</p>
        <p class="dates mono">${escapeHtml(month.span(entry.from, entry.to, lang))}${badges}</p>
        ${entry.summary ? `<p class="sum">${escapeHtml(entry.summary[lang])}</p>` : ''}
        ${bullets}
      </section>`;
    })
    .join('');
  const route = stop.remoteFrom?.length
    ? `<p class="route mono${stop.kind === 'Training' ? ' online' : ''}">${escapeHtml(UI.workedFrom[lang])} · ${stop.remoteFrom
        .map(place => escapeHtml(place === 'OnSite' ? UI.onSite[lang] : place[lang]))
        .join(' → ')}</p>`
    : '';
  return `<p class="kind mono"><span>${escapeHtml(where)}</span><span class="when">${escapeHtml(period(entries, lang))}</span></p>${route}${sections}`;
}

/** Room kept between a card and the left edge when its stop ends, allowing for the camera trailing the pen. */
const EDGE = 90;

/**
 * Where a stop's open card hangs from the line: the stop's start, or further along on a stop wider than the screen, so the card is still on screen when the pen finishes the stop. It stays fixed to that point as the line moves.
 */
export function cardAnchor(mark: StopMark, renderer: Renderer): number {
  const reach = (renderer.width * (0.5 + PEN_AHEAD) - EDGE) / renderer.scale;
  return Math.max(mark.start.x, mark.end.x - reach);
}

type CardState = {
  readonly element: HTMLElement;
  readonly tag: HTMLButtonElement;
  readonly inner: HTMLElement;
  readonly stop: number;
  readonly entries: readonly Entry[];
  /** For a split stop's later entries: the index of the shape the card stands beside. */
  readonly shape: number | null;
  /** Where the card stands on screen, easing towards where it should be. */
  x: number;
  y: number;
  placed: boolean;
};

/**
 * Cards pinned to the drawing: a stop's card unfolds while it is drawn, then folds into its tag.
 * Clicking a tag reopens its card. A split stop adds side cards, one per later entry, open only with their stop.
 */
export class CardLayer {
  private readonly cards: CardState[];
  private pinned: number | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly stops: readonly CareerStop[],
    private readonly marks: readonly StopMark[],
  ) {
    this.cards = stops.flatMap((stop, index) => [
      this.card(index, ownEntries(stop), null),
      ...(stop.split ? stop.entries.slice(1).map((entry, shape) => this.card(index, [entry], shape + 1)) : []),
    ]);
  }

  private card(stop: number, entries: readonly Entry[], shape: number | null): CardState {
    const element = document.createElement('article');
    element.className = shape === null ? 'card' : 'card side';
    if (shape === null) element.dataset.stop = String(stop);
    else element.dataset.side = String(stop);
    element.innerHTML = `<button class="tag mono" type="button"></button><div class="body"><div class="inner"></div></div>`;
    const tag = element.querySelector('button') as HTMLButtonElement;
    const inner = element.querySelector('.inner') as HTMLElement;
    tag.addEventListener('click', () => {
      this.pinned = this.pinned === stop ? null : stop;
    });
    // An open card has no tag to click: a card reopened from its tag folds back when its note is clicked.
    inner.addEventListener('click', () => {
      if (this.pinned === stop) this.pinned = null;
    });
    this.root.append(element);
    return { element, entries, inner, placed: false, shape, stop, tag, x: 0, y: 0 };
  }

  /** Writes every card and tag in a language. */
  render(lang: Lang): void {
    for (const card of this.cards) {
      const stop = this.stops[card.stop] as CareerStop;
      const name = tagName(stop, lang, card.entries);
      card.tag.innerHTML = `<span class="yr">${year(card.entries)}</span><span class="nm"> · ${escapeHtml(name)}</span>`;
      card.tag.setAttribute('aria-label', `${year(card.entries)} · ${name}`);
      card.inner.innerHTML = body(stop, lang, card.entries);
    }
  }

  /** Folds a card reopened from its tag. */
  unpin(): void {
    this.pinned = null;
  }

  hide(): void {
    this.root.classList.add('off');
    this.pinned = null;
  }

  /** Open cards end above the controls and the caption's text; a card too long for the room left scrolls. */
  update<Name extends string>(
    player: Player<Name>,
    renderer: Renderer,
    avoid: Readonly<{ hud?: DOMRect | undefined; caption?: DOMRect | undefined }> = {},
  ): void {
    const { hud, caption } = avoid;
    this.root.classList.remove('off');
    this.root.classList.toggle('overview', player.revealed);
    const { now, revealed } = player;
    const { width, height } = renderer;
    for (const card of this.cards) {
      const index = card.stop;
      const mark = this.marks[index] as StopMark;
      const side = card.shape === null ? null : mark.shapes[card.shape];
      const since = side?.time ?? mark.start.time;
      // Open while the stop is drawn, folded on the stretch of line leading to the next one: left open, it would outlive its place on screen.
      const opens = !revealed && now >= since && now < mark.end.time;
      const open = opens || this.pinned === index;
      // Side cards have no tag of their own on the line: they only exist while their stop is open.
      const shown = side ? open : now >= mark.start.time;
      const [anchorX, anchorY] = renderer.toScreen(
        player.camera,
        side?.x ?? (open ? cardAnchor(mark, renderer) : mark.start.x),
        side?.y ?? mark.y,
      );
      const target = { x: 0, y: 0 };
      if (open && side) {
        // Beside the shape's top-right corner, rising from it.
        const cardWidth = card.element.offsetWidth;
        const cardHeight = card.element.offsetHeight;
        target.x = Math.min(Math.max(anchorX + 18, 16), width - cardWidth - 16);
        target.y = Math.min(Math.max(anchorY - cardHeight + 40, 64), height - cardHeight - 16);
      } else if (open) {
        const cardWidth = card.element.offsetWidth;
        // Fixed to the line: no clamp at the left edge, or the card would stop there while the line moves on.
        target.x = Math.min(anchorX - 30, width - cardWidth - 16);
        // Over the caption's text or the controls, the card ends above them rather than moving sideways, so it travels with the line without jumping.
        const over = (box: DOMRect | undefined) =>
          box !== undefined && target.x < box.right && target.x + cardWidth > box.left;
        const bottom = Math.min(
          over(caption) ? (caption as DOMRect).top - 12 : height - 16,
          over(hud) ? (hud as DOMRect).top - 12 : height - 16,
        );
        // Hang under the line; climb over it only when the line sits too low to leave a useful card.
        target.y = Math.max(64, Math.min(anchorY + 34, bottom - 200));
        const room = `${Math.max(120, bottom - target.y - card.tag.offsetHeight)}px`;
        if (card.inner.style.maxHeight !== room) card.inner.style.maxHeight = room;
      } else {
        // In the overview, tags shrink to their year and alternate on two rows so they never collide.
        target.x = anchorX + (revealed ? -20 : 4);
        target.y = anchorY + 18 + (revealed ? (index % 2) * 24 : 0);
      }
      const easing = card.placed ? 0.3 : 1;
      card.x += (target.x - card.x) * easing;
      card.y += (target.y - card.y) * easing;
      card.placed = shown;
      card.element.style.transform = `translate3d(${card.x.toFixed(1)}px, ${card.y.toFixed(1)}px, 0)`;
      card.element.classList.toggle('open', open);
      card.element.classList.toggle('pinned', this.pinned === index);
      const visible = shown && card.x < width + 40 && card.x > -360 && card.y < height + 40;
      card.element.classList.toggle('shown', visible);
    }
  }
}
