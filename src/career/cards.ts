import type { CareerStop, Lang } from '../data/types';
import type { Player } from '../engine/player';
import type { Renderer } from '../engine/render';
import { monthSpan, UI } from '../i18n';
import type { StopMark } from './build';

const esc = (s: string): string =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

const year = (s: CareerStop): string => s.entries[0].from.slice(0, 4);

/** The short name on a stop's tag: its label, else its companies; freelance missions are told apart by place. */
export function tagName(s: CareerStop, lang: Lang): string {
  if (s.label) return s.label[lang];
  const companies = [...new Set(s.entries.map(e => e.company))].join(' · ');
  return companies === 'Freelance' ? `Freelance · ${s.place[lang]}` : companies;
}

function body(s: CareerStop, lang: Lang): string {
  const where = s.country ? `${s.place[lang]}, ${s.country[lang]}` : s.place[lang];
  const entries = s.entries
    .map(e => {
      const badges = [e.context?.[lang], e.remote ? UI.remote[lang] : undefined]
        .filter(Boolean)
        .map(b => `<span class="badge">${esc(b as string)}</span>`)
        .join('');
      const bullets = e.bullets?.length ? `<ul>${e.bullets.map(b => `<li>${esc(b[lang])}</li>`).join('')}</ul>` : '';
      return `<section>
        <h3>${esc(e.role[lang])}</h3>
        <p class="co mono">${esc(e.company)} · ${esc(monthSpan(e.from, e.to, lang))}</p>
        ${badges ? `<p class="badges">${badges}</p>` : ''}
        ${e.summary ? `<p class="sum">${esc(e.summary[lang])}</p>` : ''}
        ${bullets}
      </section>`;
    })
    .join('');
  const route = s.remoteFrom?.length
    ? `<p class="route mono">${esc(UI.workedFrom[lang])} · ${s.remoteFrom
        .map(p => esc(p === 'on-site' ? UI.onSite[lang] : p[lang]))
        .join(' → ')}</p>`
    : '';
  return `<p class="where mono">${esc(where)}</p>${entries}${route}`;
}

type CardState = { el: HTMLElement; tag: HTMLButtonElement; x: number; y: number; placed: boolean };

/**
 * Cards pinned to the drawing: a stop's card unfolds while it is drawn, then folds into its tag.
 * Clicking a tag reopens its card.
 */
export class CardLayer {
  private readonly cards: CardState[];
  private pinned: number | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly stops: readonly CareerStop[],
    private readonly marks: readonly StopMark[],
  ) {
    this.cards = stops.map((_, i) => {
      const el = document.createElement('article');
      el.className = 'card';
      el.dataset.stop = String(i);
      el.innerHTML = `<button class="tag mono" type="button"></button><div class="body"><div class="inner"></div></div>`;
      const tag = el.querySelector('button') as HTMLButtonElement;
      tag.addEventListener('click', () => {
        this.pinned = this.pinned === i ? null : i;
      });
      root.append(el);
      return { el, tag, x: 0, y: 0, placed: false };
    });
  }

  render(lang: Lang): void {
    this.cards.forEach((c, i) => {
      const s = this.stops[i] as CareerStop;
      c.tag.innerHTML = `<span class="yr">${year(s)}</span><span class="nm"> · ${esc(tagName(s, lang))}</span>`;
      c.tag.setAttribute('aria-label', `${year(s)} · ${tagName(s, lang)}`);
      (c.el.querySelector('.inner') as HTMLElement).innerHTML = body(s, lang);
    });
  }

  unpin(): void {
    this.pinned = null;
  }

  hide(): void {
    this.root.classList.add('off');
    this.pinned = null;
  }

  update(player: Player, renderer: Renderer): void {
    this.root.classList.remove('off');
    this.root.classList.toggle('overview', player.revealed);
    const { now, revealed } = player;
    const { W, H } = renderer;
    this.cards.forEach((c, i) => {
      const m = this.marks[i] as StopMark;
      const next = this.marks[i + 1]?.t0 ?? player.end + 1;
      const auto = !revealed && now >= m.t0 && now < next;
      const open = auto || this.pinned === i;
      const shown = now >= m.t0;
      const [ax, ay] = renderer.toScreen(player.cam, m.x, m.y);
      let tx: number;
      let ty: number;
      if (open) {
        const cw = c.el.offsetWidth;
        const ch = c.el.offsetHeight;
        tx = Math.min(Math.max(ax - 30, 16), W - cw - 16);
        ty = Math.min(Math.max(ay + 34, 64), H - ch - 16);
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
    });
  }
}
