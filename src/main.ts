import './style.css';
import { buildCareer, type StopMark, THREAD } from './career/build';
import { CardLayer, cardAnchor } from './career/cards';
import { CAREER } from './data/career';
import type { Lang } from './data/types';
import { UI } from './data/ui';
import { Audio } from './engine/audio';
import { lerp } from './engine/math';
import { Player } from './engine/player';
import { Renderer } from './engine/render';
import * as language from './language';
import * as month from './month';

const select = <Element extends HTMLElement>(selector: string): Element => {
  const element = document.querySelector<Element>(selector);
  if (!element) throw new Error(`Missing element ${selector}`);
  return element;
};

const canvas = select<HTMLCanvasElement>('#c');
const element = {
  caption: select('#cap'),
  hud: select('#hud'),
  intro: select('#intro'),
  progress: select('#prog'),
  year: select('#year'),
};
const button = {
  again: select<HTMLButtonElement>('#again'),
  back: select<HTMLButtonElement>('#back'),
  career: select<HTMLButtonElement>('#path-career'),
  lang: select<HTMLButtonElement>('#lang'),
  pause: select<HTMLButtonElement>('#pause'),
  sound: select<HTMLButtonElement>('#snd'),
};

const audio = new Audio();
const renderer = new Renderer(canvas);
const career = buildCareer(CAREER, month.of(new Date()));
const marks = career.stops;

/** The line's height over time: steady during a stop, climbing along the connector to the next. */
function baseline(time: number): number {
  const first = marks[0];
  if (!first || time <= first.start.time) return first?.y ?? 0;
  for (let index = 0; index < marks.length; index++) {
    const mark = marks[index] as StopMark;
    const next = marks[index + 1];
    if (!next || time < mark.end.time) return mark.y;
    if (time < next.start.time) return lerp(mark.y, next.y, (time - mark.end.time) / (next.start.time - mark.end.time));
  }
  return marks[marks.length - 1]?.y ?? 0;
}

const player = new Player(renderer, career.story, career.end, audio, {
  baseline,
  follow: [
    [THREAD.Ink, 1],
    [THREAD.Gold, 0.5],
  ],
  lead: THREAD.Ink,
  order: [...THREAD.Apprentices, THREAD.Gold, THREAD.GoldDetail, THREAD.InkDetail, THREAD.Ink],
});
const cards = new CardLayer(select('#cards'), CAREER, marks);

let lang: Lang = language.detect();
let started = false;
let paused = false;

/** The caption on screen: which one is shown, whether it is in an old language, and its pending fade-in. */
const caption = { shown: null as number | null, stale: false, timer: 0 };

/** Writes the labels of the buttons whose text follows their state. */
const label = {
  pause: () => {
    button.pause.textContent = (paused ? UI.resume : UI.pause)[lang];
  },
  sound: () => {
    button.sound.textContent = (audio.muted ? UI.soundOff : UI.soundOn)[lang];
  },
};

function applyLang(next: Lang): void {
  lang = next;
  renderer.lang = lang;
  document.documentElement.lang = lang;
  for (const translated of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = translated.dataset.i18n as keyof typeof UI;
    if (UI[key]) translated.textContent = UI[key][lang];
  }
  for (const option of button.lang.querySelectorAll<HTMLElement>('[data-lang]'))
    option.classList.toggle('on', option.dataset.lang === lang);
  label.sound();
  label.pause();
  cards.render(lang);
  caption.stale = true;
}

/** The caption's text on screen, not its full-width box; none while it is hidden. */
function captionBox(): DOMRect | undefined {
  if (!element.caption.classList.contains('show') || !element.caption.textContent) return undefined;
  const range = document.createRange();
  range.selectNodeContents(element.caption);
  return range.getBoundingClientRect();
}

function updateCaption(): void {
  const captions = career.story.captions.items;
  const now = player.now;
  let wanted: number | null = null;
  for (const [index, shown] of captions.entries())
    if (shown.time <= now && now < shown.time + shown.duration) wanted = index;
  if (!caption.stale && wanted === caption.shown) return;
  const redraw = caption.stale;
  caption.stale = false;
  caption.shown = wanted;
  clearTimeout(caption.timer);
  if (wanted === null) {
    element.caption.classList.remove('show');
    return;
  }
  const text = captions[wanted]?.text;
  if (!text) return;
  if (redraw && element.caption.classList.contains('show')) {
    element.caption.textContent = text[lang];
    return;
  }
  element.caption.classList.remove('show');
  caption.timer = window.setTimeout(
    () => {
      element.caption.textContent = text[lang];
      element.caption.classList.add('show');
    },
    element.caption.textContent ? 700 : 50,
  );
}

function setPaused(next: boolean): void {
  paused = next;
  player.hurry = false;
  if (paused) audio.scratch(0);
  label.pause();
  button.pause.setAttribute('aria-pressed', String(paused));
}

/** Draws again from the start. */
function restart(): void {
  player.seek(0);
  setPaused(false);
  button.again.classList.remove('show');
}

/** The year the pen has reached, or the whole span once the drawing is done. */
function updateYear(): void {
  const yearOf = (months: number) => String(Math.floor(months / 12));
  const text = player.revealed
    ? `${yearOf(month.at(career, 0))} – ${yearOf(career.today)}`
    : yearOf(month.at(career, player.now));
  if (element.year.textContent !== text) element.year.textContent = text;
}

function resize(): void {
  renderer.resize(innerWidth, innerHeight, Math.min(2, devicePixelRatio || 1));
  if (!started) player.seek(0);
}

function start(withSound: boolean): void {
  if (started) return;
  started = true;
  document.body.classList.add('playing');
  element.intro.classList.add('gone');
  if (withSound) audio.init();
  restart();
}

function leave(): void {
  started = false;
  element.intro.classList.remove('instant');
  document.body.classList.remove('playing');
  element.intro.classList.remove('gone');
  audio.scratch(0);
  cards.hide();
  element.caption.classList.remove('show');
  restart();
  button.career.focus();
}

/** Index of the stop being drawn at the current moment, or -1 before the first. */
function currentStop(): number {
  let current = -1;
  marks.forEach((mark, index) => {
    if (mark.start.time <= player.now + 0.5) current = index;
  });
  return current;
}

function jump(delta: number): void {
  if (!started) return;
  const target = Math.max(-1, Math.min(marks.length, currentStop() + delta));
  if (target < 0) player.seek(0);
  else if (target >= marks.length) player.seek(career.end + 1.5);
  else player.seek((marks[target] as StopMark).start.time);
  button.again.classList.remove('show');
}

let previousTimestamp = 0;
function frame(timestamp: number): void {
  requestAnimationFrame(frame);
  const elapsed = Math.min(0.05, (timestamp - (previousTimestamp || timestamp)) / 1000);
  previousTimestamp = timestamp;
  if (started) {
    player.update(elapsed, !paused);
    cards.update(player, renderer, { caption: captionBox(), hud: element.hud.getBoundingClientRect() });
    updateCaption();
    updateYear();
    element.progress.style.width = `${player.progress * 100}%`;
    if (player.now > career.end + 10) button.again.classList.add('show');
  }
  player.draw();
}

addEventListener('resize', resize);
button.career.addEventListener('click', () => start(true));
// Scrolling moves time: down draws ahead, up rewinds. A mouse notch is about two seconds.
canvas.addEventListener(
  'wheel',
  event => {
    if (!started) return;
    event.preventDefault();
    const pixels =
      (event.deltaY + event.deltaX) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    player.scrub(pixels * 0.02);
    button.again.classList.toggle('show', player.now > career.end + 10);
  },
  { passive: false },
);
canvas.addEventListener('pointerdown', () => {
  if (!paused) player.hurry = true;
  cards.unpin();
});
addEventListener('pointerup', () => {
  player.hurry = false;
});
addEventListener('pointercancel', () => {
  player.hurry = false;
});
addEventListener('keydown', event => {
  if (event.target instanceof HTMLButtonElement && (event.code === 'Space' || event.code === 'Enter')) return;
  if (event.code === 'Space') {
    event.preventDefault();
    if (started && !event.repeat) setPaused(!paused);
  }
  if (event.key === 'Shift' && started && !paused) player.hurry = true;
  if (event.code === 'ArrowRight') jump(1);
  if (event.code === 'ArrowLeft') jump(-1);
  if (event.code === 'Escape') cards.unpin();
  if (event.code === 'KeyM') button.sound.click();
});
// A button clicked with the mouse lets go of focus, so Space pauses instead of pressing it again. Buttons reached with the keyboard (detail 0) keep focus and their usual Space behaviour.
addEventListener('click', event => {
  const pressed = event.target instanceof Element ? event.target.closest('button') : null;
  if (pressed && event.detail > 0) pressed.blur();
});
addEventListener('keyup', event => {
  if (event.key === 'Shift') player.hurry = false;
});
button.sound.addEventListener('click', event => {
  event.stopPropagation();
  if (!audio.ready) {
    audio.init();
    if (audio.muted) audio.toggle();
  } else {
    audio.toggle();
  }
  label.sound();
});
button.lang.addEventListener('click', () => {
  const next: Lang = lang === 'fr' ? 'en' : 'fr';
  language.save(next);
  applyLang(next);
});
button.pause.addEventListener('click', () => setPaused(!paused));
button.again.addEventListener('click', restart);
button.back.addEventListener('click', leave);

// Development only: lets browser tests see where a card hangs from the line.
if (import.meta.env.DEV)
  Object.assign(window, {
    lifeline: {
      cardAnchorOnScreen: (index: number) => {
        const mark = marks[index] as StopMark;
        return renderer.toScreen(player.camera, cardAnchor(mark, renderer), mark.y);
      },
    },
  });

resize();
applyLang(lang);
requestAnimationFrame(frame);

// ?path=career opens the career straight away, silently; ?t=seconds jumps to a moment of it.
const params = new URLSearchParams(location.search);
const silent = window.self !== window.top || params.get('path') === 'career';
if (silent) {
  element.intro.classList.add('instant');
  audio.muted = true;
  label.sound();
  start(false);
}
const seek = Number.parseFloat(params.get('t') ?? '');
if (started && seek > 0) player.seek(seek);
