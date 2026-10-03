import type { CareerStop, Entry, Lang } from '../data/types';
import { PEN_AHEAD, type Player } from '../engine/player';
import type { Renderer } from '../engine/render';
import { monthSpan, UI } from '../i18n';
import type { StopMark } from './build';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

/** The entries a stop's card tells: all of them, or only the first when the stop is split. */
const ownEntries = (s: CareerStop): readonly Entry[] => (s.split ? s.entries.slice(0, 1) : s.entries);

const year = (entries: readonly Entry[]): string => (entries[0] as Entry).from.slice(0, 4);

/** The short name on a stop's tag: its label, else its companies; freelance missions are told apart by place. */
export function tagName(s: CareerStop, lang: Lang, entries = ownEntries(s)): string {
  if (s.label) return s.label[lang];
  const companies = [...new Set(entries.map(e => e.company))].join(' · ');
  return companies === 'Freelance' ? `Freelance · ${s.place[lang]}` : companies;
}

/** The years a card covers: "2013 – 2016", a single year, or up to today. */
function period(list: readonly Entry[], lang: Lang): string {
  const from = Math.min(...list.map(e => Number(e.from.slice(0, 4))));
  const open = list.some(e => e.to === null);
  const to = Math.max(...list.map(e => Number((e.to ?? e.from).slice(0, 4))));
  if (open) return `${from} – ${UI.today[lang]}`;
  return from === to ? String(from) : `${from} – ${to}`;
}

/** A card's note, after the WAYPOINTS V3 cards: place and years, then each job by company, role and dates. */
function body(s: CareerStop, lang: Lang, list: readonly Entry[]): string {
  const where = s.country ? `${s.place[lang]}, ${s.country[lang]}` : s.place[lang];
  const entries = list
    .map(e => {
      const badges = [
        e.remote ? `<span class="badge away">${esc(UI.remote[lang])}</span>` : '',
        e.context ? `<span class="badge">${esc(e.context[lang])}</span>` : '',
      ].join('');
      const bullets = e.bullets?.length ? `<ul>${e.bullets.map(b => `<li>${esc(b[lang])}</li>`).join('')}</ul>` : '';
      return `<section>
        <h3>${esc(e.company)}</h3>
        <p class="role">${esc(e.role[lang])}</p>
        <p class="dates mono">${esc(monthSpan(e.from, e.to, lang))}${badges}</p>
        ${e.summary ? `<p class="sum">${esc(e.summary[lang])}</p>` : ''}
        ${bullets}
      </section>`;
    })
    .join('');
  const route = s.remoteFrom?.length
    ? `<p class="route mono${s.kind === 'training' ? ' online' : ''}">${esc(UI.workedFrom[lang])} · ${s.remoteFrom
        .map(p => esc(p === 'on-site' ? UI.onSite[lang] : p[lang]))
        .join(' → ')}</p>`
    : '';
  return `<p class="kind mono"><span>${esc(where)}</span><span class="when">${esc(period(list, lang))}</span></p>${route}${entries}`;
}

/** Room kept between a card and the left edge when its stop ends, allowing for the camera trailing the pen. */
const EDGE = 90;

/**
 * Where a stop's open card hangs from the line: the stop's start, or further along on a stop wider than the screen,
 * so the card is still on screen when the pen finishes the stop. It stays fixed to that point as the line moves.
 */
export function cardAnchor(m: StopMark, renderer: Renderer): number {
  const reach = (renderer.W * (0.5 + PEN_AHEAD) - EDGE) / renderer.S;
  return Math.max(m.x, m.endX - reach);
}

type CardState = {
  el: HTMLElement;
  tag: HTMLButtonElement;
  inner: HTMLElement;
  stop: number;
  entries: readonly Entry[];
  /** For a split stop's later entries: the index of the shape the card stands beside. */
  shape: number | null;
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
    this.cards = stops.flatMap((s, i) => [
      this.card(i, ownEntries(s), null),
      ...(s.split ? s.entries.slice(1).map((e, k) => this.card(i, [e], k + 1)) : []),
    ]);
  }

  private card(stop: number, entries: readonly Entry[], shape: number | null): CardState {
    const el = document.createElement('article');
    el.className = shape === null ? 'card' : 'card side';
    if (shape === null) el.dataset.stop = String(stop);
    else el.dataset.side = String(stop);
    el.innerHTML = `<button class="tag mono" type="button"></button><div class="body"><div class="inner"></div></div>`;
    const tag = el.querySelector('button') as HTMLButtonElement;
    const inner = el.querySelector('.inner') as HTMLElement;
    tag.addEventListener('click', () => {
      this.pinned = this.pinned === stop ? null : stop;
    });
    // An open card has no tag to click: a card reopened from its tag folds back when its note is clicked.
    inner.addEventListener('click', () => {
      if (this.pinned === stop) this.pinned = null;
    });
    this.root.append(el);
    return { el, tag, inner, stop, entries, shape, x: 0, y: 0, placed: false };
  }

  render(lang: Lang): void {
    for (const c of this.cards) {
      const s = this.stops[c.stop] as CareerStop;
      const name = tagName(s, lang, c.entries);
      c.tag.innerHTML = `<span class="yr">${year(c.entries)}</span><span class="nm"> · ${esc(name)}</span>`;
      c.tag.setAttribute('aria-label', `${year(c.entries)} · ${name}`);
      c.inner.innerHTML = body(s, lang, c.entries);
    }
  }

  unpin(): void {
    this.pinned = null;
  }

  hide(): void {
    this.root.classList.add('off');
    this.pinned = null;
  }

  /** Open cards end above the controls and the caption's text; a card too long for the room left scrolls. */
  update(
    player: Player,
    renderer: Renderer,
    avoid: Readonly<{ hud?: DOMRect | undefined; caption?: DOMRect | undefined }> = {},
  ): void {
    const { hud, caption } = avoid;
    this.root.classList.remove('off');
    this.root.classList.toggle('overview', player.revealed);
    const { now, revealed } = player;
    const { W, H } = renderer;
    for (const c of this.cards) {
      const i = c.stop;
      const m = this.marks[i] as StopMark;
      const side = c.shape === null ? null : m.shapes[c.shape];
      const from = side?.t ?? m.t0;
      // Open while the stop is drawn, folded on the stretch of line leading to the next one:
      // left open, it would outlive its place on screen.
      const auto = !revealed && now >= from && now < m.t1;
      const open = auto || this.pinned === i;
      // Side cards have no tag of their own on the line: they only exist while their stop is open.
      const shown = side ? open : now >= m.t0;
      const [ax, ay] = renderer.toScreen(player.cam, side?.x ?? (open ? cardAnchor(m, renderer) : m.x), side?.y ?? m.y);
      let tx: number;
      let ty: number;
      if (open && side) {
        // Beside the shape's top-right corner, rising from it.
        const cw = c.el.offsetWidth;
        const ch = c.el.offsetHeight;
        tx = Math.min(Math.max(ax + 18, 16), W - cw - 16);
        ty = Math.min(Math.max(ay - ch + 40, 64), H - ch - 16);
      } else if (open) {
        const cw = c.el.offsetWidth;
        // Fixed to the line: no clamp at the left edge, or the card would stop there while the line moves on.
        tx = Math.min(ax - 30, W - cw - 16);
        // Over the caption's text or the controls, the card ends above them rather than moving sideways,
        // so it travels with the line without jumping.
        const over = (r: DOMRect | undefined) => r !== undefined && tx < r.right && tx + cw > r.left;
        const bottom = Math.min(
          over(caption) ? (caption as DOMRect).top - 12 : H - 16,
          over(hud) ? (hud as DOMRect).top - 12 : H - 16,
        );
        // Hang under the line; climb over it only when the line sits too low to leave a useful card.
        ty = Math.max(64, Math.min(ay + 34, bottom - 200));
        const room = `${Math.max(120, bottom - ty - c.tag.offsetHeight)}px`;
        if (c.inner.style.maxHeight !== room) c.inner.style.maxHeight = room;
      } else {
        // In the overview, tags shrink to their year and alternate on two rows so they never collide.
        tx = ax + (revealed ? -20 : 4);
        ty = ay + 18 + (revealed ? (i % 2) * 24 : 0);
      }
      const k = c.placed ? 0.3 : 1;
      c.x += (tx - c.x) * k;
      c.y += (ty - c.y) * k;
      c.placed = shown;
      c.el.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`;
      c.el.classList.toggle('open', open);
      c.el.classList.toggle('pinned', this.pinned === i);
      const visible = shown && c.x < W + 40 && c.x > -360 && c.y < H + 40;
      c.el.classList.toggle('shown', visible);
    }
  }
}
