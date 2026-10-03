import './style.css';
import { buildCareer, type StopMark } from './career/build';
import { CardLayer } from './career/cards';
import { CAREER } from './data/career';
import type { Lang } from './data/types';
import { Audio } from './engine/audio';
import { lerp } from './engine/math';
import { Player } from './engine/player';
import { Renderer } from './engine/render';
import { currentMonth, detectLang, saveLang, UI } from './i18n';

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`Missing element ${sel}`);
  return el;
};

const canvas = $<HTMLCanvasElement>('#c');
const capEl = $('#cap');
const progEl = $('#prog');
const hintEl = $('#hint');
const sndBtn = $<HTMLButtonElement>('#snd');
const langBtn = $<HTMLButtonElement>('#lang');
const againBtn = $<HTMLButtonElement>('#again');
const backBtn = $<HTMLButtonElement>('#back');
const introEl = $('#intro');
const careerBtn = $<HTMLButtonElement>('#path-career');

const audio = new Audio();
const renderer = new Renderer(canvas);
const career = buildCareer(CAREER, currentMonth());
const marks = career.stops;

/** The line's height over time: steady during a stop, climbing along the connector to the next. */
function baseline(t: number): number {
  const first = marks[0];
  if (!first || t <= first.t0) return first?.y ?? 0;
  for (let i = 0; i < marks.length; i++) {
    const m = marks[i] as StopMark;
    const next = marks[i + 1];
    if (!next || t < m.t1) return m.y;
    if (t < next.t0) return lerp(m.y, next.y, (t - m.t1) / (next.t0 - m.t1));
  }
  return marks[marks.length - 1]?.y ?? 0;
}

const player = new Player(renderer, career.story, career.end, audio, {
  order: ['P0', 'P1', 'P2', 'C', 'A'],
  follow: [
    ['A', 1],
    ['C', 0.5],
  ],
  lead: 'A',
  baseline,
});
const cards = new CardLayer($('#cards'), CAREER, marks);

let lang: Lang = detectLang();
let started = false;
let capIdx = -1;
let capTimer = 0;

function applyLang(next: Lang): void {
  lang = next;
  document.documentElement.lang = lang;
  for (const el of document.querySelectorAll<HTMLElement>('[data-i18n]')) {
    const key = el.dataset.i18n as keyof typeof UI;
    if (UI[key]) el.textContent = UI[key][lang];
  }
  for (const el of langBtn.querySelectorAll<HTMLElement>('[data-lang]'))
    el.classList.toggle('on', el.dataset.lang === lang);
  sndBtn.textContent = (audio.muted ? UI.soundOff : UI.soundOn)[lang];
  cards.render(lang);
  capIdx = -2; // Forces the caption to redraw in the new language.
}

function updateCaption(): void {
  const caps = career.story.captions;
  const now = player.now;
  let want = -1;
  caps.forEach((c, i) => {
    if (c.t <= now && now < c.t + c.dur) want = i;
  });
  if (want === capIdx) return;
  const redraw = capIdx === -2;
  capIdx = want;
  clearTimeout(capTimer);
  if (want < 0) {
    capEl.classList.remove('show');
    return;
  }
  const c = caps[want];
  if (!c) return;
  if (redraw && capEl.classList.contains('show')) {
    capEl.textContent = c.text[lang];
    return;
  }
  capEl.classList.remove('show');
  capTimer = window.setTimeout(
    () => {
      capEl.textContent = c.text[lang];
      capEl.classList.add('show');
    },
    capEl.textContent ? 700 : 50,
  );
}

function resize(): void {
  renderer.resize(innerWidth, innerHeight, Math.min(2, devicePixelRatio || 1));
  if (!started) player.seek(0);
}

function start(withSound: boolean): void {
  if (started) return;
  started = true;
  document.body.classList.add('playing');
  introEl.classList.add('gone');
  if (withSound) audio.init();
  player.seek(0);
  hintEl.style.opacity = '1';
  againBtn.classList.remove('show');
}

function leave(): void {
  started = false;
  introEl.classList.remove('instant');
  document.body.classList.remove('playing');
  introEl.classList.remove('gone');
  audio.scratch(0);
  cards.hide();
  capEl.classList.remove('show');
  againBtn.classList.remove('show');
  player.seek(0);
  careerBtn.focus();
}

/** Index of the stop being drawn at the current moment, or -1 before the first. */
function currentStop(): number {
  let idx = -1;
  marks.forEach((m, i) => {
    if (m.t0 <= player.now + 0.5) idx = i;
  });
  return idx;
}

function jump(delta: number): void {
  if (!started) return;
  const target = Math.max(-1, Math.min(marks.length, currentStop() + delta));
  if (target < 0) player.seek(0);
  else if (target >= marks.length) player.seek(career.end + 1.5);
  else player.seek((marks[target] as StopMark).t0);
  againBtn.classList.remove('show');
}

let last = 0;
function frame(ts: number): void {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (ts - (last || ts)) / 1000);
  last = ts;
  if (started) {
    player.update(dt);
    cards.update(player, renderer);
    updateCaption();
    progEl.style.width = `${player.progress * 100}%`;
    if (player.now > 14) hintEl.style.opacity = '0';
    if (player.now > career.end + 10) againBtn.classList.add('show');
  }
  player.draw();
}

addEventListener('resize', resize);
careerBtn.addEventListener('click', () => start(true));
canvas.addEventListener('pointerdown', () => {
  player.hurry = true;
  cards.unpin();
});
addEventListener('pointerup', () => {
  player.hurry = false;
});
addEventListener('pointercancel', () => {
  player.hurry = false;
});
addEventListener('keydown', e => {
  if (e.target instanceof HTMLButtonElement && (e.code === 'Space' || e.code === 'Enter')) return;
  if (e.code === 'Space') {
    e.preventDefault();
    if (started) player.hurry = true;
  }
  if (e.code === 'ArrowRight') jump(1);
  if (e.code === 'ArrowLeft') jump(-1);
  if (e.code === 'Escape') cards.unpin();
  if (e.code === 'KeyM') sndBtn.click();
});
addEventListener('keyup', e => {
  if (e.code === 'Space') player.hurry = false;
});
sndBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (!audio.ready) {
    audio.init();
    if (audio.muted) audio.toggle();
  } else {
    audio.toggle();
  }
  sndBtn.textContent = (audio.muted ? UI.soundOff : UI.soundOn)[lang];
});
langBtn.addEventListener('click', () => {
  const next: Lang = lang === 'fr' ? 'en' : 'fr';
  saveLang(next);
  applyLang(next);
});
againBtn.addEventListener('click', () => {
  player.seek(0);
  againBtn.classList.remove('show');
});
backBtn.addEventListener('click', leave);

resize();
applyLang(lang);
requestAnimationFrame(frame);

// ?path=career opens the career straight away, silently; ?t=seconds jumps to a moment of it.
const params = new URLSearchParams(location.search);
const silent = window.self !== window.top || params.get('path') === 'career';
if (silent) {
  introEl.classList.add('instant');
  audio.muted = true;
  sndBtn.textContent = UI.soundOff[lang];
  start(false);
}
const at = Number.parseFloat(params.get('t') ?? '');
if (started && at > 0) player.seek(at);
