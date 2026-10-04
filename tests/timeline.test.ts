import { describe, expect, it } from 'vitest';
import { buildCareer, THREAD } from '../src/career/build';
import { CAREER } from '../src/data/career';
import { labelAlpha } from '../src/engine/story';
import * as month from '../src/month';

const timeline = buildCareer(CAREER, '2026-10');
const ink = (name: (typeof THREAD)['Ink' | 'Gold']) => timeline.story.threads.get(name).points;

describe('career timeline', () => {
  it('marks one stop per career stop', () => {
    expect(timeline.stops).toHaveLength(CAREER.length);
  });

  it('draws the stops in order, each after the last one ends', () => {
    timeline.stops.forEach((mark, index) => {
      expect(mark.end.time).toBeGreaterThan(mark.start.time);
      const next = timeline.stops[index + 1];
      if (next) expect(next.start.time).toBeGreaterThanOrEqual(mark.end.time);
    });
  });

  it('ends the drawing after the last stop', () => {
    expect(timeline.end).toBeGreaterThan(timeline.stops.at(-1)?.end.time ?? Infinity);
  });

  it('lays every thread down in time order', () => {
    for (const [name, thread] of timeline.story.threads)
      thread.points.forEach((point, index) => {
        if (index)
          expect(point.time, `${name}[${index}]`).toBeGreaterThanOrEqual((thread.points[index - 1]?.time ?? 0) - 1e-9);
        expect(Number.isFinite(point.x) && Number.isFinite(point.y), `${name}[${index}]`).toBe(true);
      });
  });

  it('draws the ink line without ever lifting the pen', () => {
    const lifts = ink(THREAD.Ink).filter(point => point.up);
    expect(lifts).toEqual([]);
  });

  it('draws the gold thread only for training stops', () => {
    const gold = ink(THREAD.Gold);
    expect(gold.length).toBeGreaterThan(0);
    const trainingStarts = timeline.stops
      .filter((_, index) => CAREER[index]?.kind === 'Training')
      .map(mark => mark.start.time);
    expect(gold[0]?.time).toBeGreaterThanOrEqual(trainingStarts[0] ?? Infinity);
  });

  it('leaves time to read each card', () => {
    for (const mark of timeline.stops) expect(mark.end.time - mark.start.time).toBeGreaterThan(3);
  });

  it('starts the year counter at the first job', () => {
    expect(Math.floor(month.at(timeline, 0) / 12)).toBe(2011);
  });

  it('ends the year counter on today', () => {
    expect(month.at(timeline, timeline.end + 5)).toBe(month.index('2026-10'));
  });

  it('never counts the years backwards', () => {
    let previous = -Infinity;
    for (let time = 0; time < timeline.end; time += 0.5) {
      const reached = month.at(timeline, time);
      expect(reached).toBeGreaterThanOrEqual(previous);
      previous = reached;
    }
  });

  it('tells each stop’s line of story while it is drawn', () => {
    timeline.stops.forEach((mark, index) => {
      const time = (mark.start.time + mark.end.time) / 2;
      const shown = timeline.story.captions.items
        .filter(caption => caption.time <= time && time < caption.time + caption.duration)
        .at(-1);
      expect(shown?.text, `stop ${index}`).toBe(CAREER[index]?.caption);
    });
  });

  it('tells each chapter on the way to its stop, long enough to read', () => {
    timeline.stops.forEach((mark, index) => {
      const chapter = CAREER[index]?.chapter;
      if (!chapter) return;
      const told = timeline.story.captions.items.find(caption => caption.text === chapter);
      expect(told?.time, `stop ${index}`).toBeLessThan(mark.start.time);
      expect(told?.duration, `stop ${index}`).toBeGreaterThan(4);
    });
  });

  it('records where the pen ends each stop', () => {
    for (const mark of timeline.stops) {
      const pen = ink(THREAD.Ink)
        .filter(point => point.time <= mark.end.time)
        .at(-1);
      expect(mark.end.x).toBeCloseTo(pen?.x ?? Number.NaN, -1);
      expect(mark.end.x).toBeGreaterThan(mark.start.x);
    }
  });

  it('writes each place name while the line is drawn, then hides them all from the overview', () => {
    const labels = timeline.story.labels.items;
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(labelAlpha(label, label.time + 1), label.text.en).toBeGreaterThan(0);
      expect(labelAlpha(label, timeline.end + 3), label.text.en).toBe(0);
    }
  });

  it('turns a compass towards Asia on the way there, its points written in each language', () => {
    const asia = CAREER.findIndex(stop => stop.way === 'Compass');
    const [arrival, last] = [timeline.stops[asia]?.start.time ?? 0, timeline.stops[asia - 1]?.end.time ?? 0];
    const written = timeline.story.labels.items.filter(label => label.time > last && label.time < arrival);
    expect(written.map(label => label.text.fr).sort()).toEqual(['E', 'N', 'O', 'S']);
    expect(written.map(label => label.text.en).sort()).toEqual(['E', 'N', 'S', 'W']);
  });

  it('flies the pen as a plane round the compass dial', () => {
    const asia = CAREER.findIndex(stop => stop.way === 'Compass');
    const [arrival, last] = [timeline.stops[asia]?.start.time ?? 0, timeline.stops[asia - 1]?.end.time ?? 0];
    const flights = timeline.story.planes.items.filter(
      plane => plane.pen === THREAD.Ink && plane.start > last && plane.end < arrival,
    );
    expect(flights).toHaveLength(1);
  });

  it('lays one background under all the shapes of a stop that is not split', () => {
    timeline.stops.forEach((mark, index) => {
      const stop = CAREER[index];
      if (!stop || stop.split || mark.shapes.length < 2) return;
      // Washes, not the small spots of colour laid over details.
      const washes = timeline.story.blots.items.filter(
        blot => blot.size > 200 && blot.time >= mark.start.time && blot.time <= mark.end.time,
      );
      expect(new Set(washes.map(blot => blot.pigment)).size, `stop ${index}`).toBe(1);
      // Bridged: no gap between the washes along the stop.
      const spans = washes
        .map(blot => [blot.x - blot.size / 2, blot.x + blot.size / 2] as const)
        .sort((a, b) => a[0] - b[0]);
      spans.slice(1).forEach(([left], at) => {
        expect(left, `stop ${index}`).toBeLessThan(spans[at]?.[1] ?? -Infinity);
      });
    });
  });

  it('lasts a few minutes', () => {
    expect(timeline.end).toBeGreaterThan(120);
    expect(timeline.end).toBeLessThan(600);
  });
});
