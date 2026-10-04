import type { Point } from '../engine/math';
import { LAND } from './world';

/** A cubic Bézier curve from `start` through two control points to `end`. */
const cubic = (start: Point, firstControl: Point, secondControl: Point, end: Point, count = 28): Point[] =>
  Array.from({ length: count + 1 }, (_, index) => {
    const progress = index / count;
    const remaining = 1 - progress;
    const weights = [
      remaining * remaining * remaining,
      3 * progress * remaining * remaining,
      3 * progress * progress * remaining,
      progress * progress * progress,
    ] as const;
    return [
      weights[0] * start[0] + weights[1] * firstControl[0] + weights[2] * secondControl[0] + weights[3] * end[0],
      weights[0] * start[1] + weights[1] * firstControl[1] + weights[2] * secondControl[1] + weights[3] * end[1],
    ] as const;
  });

/** A flight to a stop far away, over a map, in drawing units from where the line takes off. */
export type Flight = Readonly<{
  /** The line's legs: up to the first place, from place to place, then down from the last place to where it lands. */
  legs: readonly (readonly Point[])[];
  /** Where each place lies on the map. */
  places: readonly Point[];
  /** Land outlines around the route. */
  land: readonly (readonly Point[])[];
  /** Centre and radius of the map, which fades out towards its edge. */
  map: Readonly<{ x: number; y: number; radius: number }>;
}>;

/** Drawing units per degree of latitude; degrees of longitude are shortened as they are around the route. */
const MAP_SCALE = 4.4;

/** A gentle arc from `start` to `end`, bowing to the left of the way it goes, like a flight path. */
const bow = (start: Point, end: Point): Point[] => {
  const delta = { x: end[0] - start[0], y: end[1] - start[1] };
  const bend = 0.12;
  return cubic(
    start,
    [start[0] + delta.x / 3 + delta.y * bend, start[1] + delta.y / 3 - delta.x * bend],
    [start[0] + (2 * delta.x) / 3 + delta.y * bend, start[1] + (2 * delta.y) / 3 - delta.x * bend],
    end,
    16,
  );
};

/**
 * The line takes off to the first place of `route` ([longitude, latitude] pairs), flies from place to place over a map, and lands `rise` below (or above) its take-off height after the last one.
 */
export function flight(route: readonly (readonly [longitude: number, latitude: number])[], rise: number): Flight {
  const latitudes = route.map(place => place[1]);
  const longitudes = route.map(place => place[0]);
  const origin = {
    latitude: (Math.max(...latitudes) + Math.min(...latitudes)) / 2,
    longitude: longitudes[0] ?? 0,
  };
  const shorten = Math.cos((origin.latitude * Math.PI) / 180);
  const project = ([longitude, latitude]: readonly [number, number]): Point => [
    170 + (longitude - origin.longitude) * MAP_SCALE * shorten,
    -60 - (latitude - origin.latitude) * MAP_SCALE,
  ];
  const places = route.map(project);
  const first = places[0] ?? [170, -60];
  const last = places[places.length - 1] ?? first;
  const landing: Point = [last[0] + 330, rise];
  const positions = { x: places.map(place => place[0]), y: places.map(place => place[1]) };
  const min = { x: Math.min(...positions.x), y: Math.min(...positions.y) };
  const max = { x: Math.max(...positions.x), y: Math.max(...positions.y) };
  return {
    land: LAND.map(ring => ring.map(project)),
    legs: [
      cubic([0, 0], [80, 0], [first[0] - 70, first[1]], first),
      ...places.slice(1).map((place, index) => bow(places[index] ?? first, place)),
      cubic(last, [last[0] + 190, last[1]], [landing[0] - 110, rise], landing),
    ],
    map: { radius: Math.max(max.x - min.x, max.y - min.y) * 1.05, x: (min.x + max.x) / 2, y: (min.y + max.y) / 2 },
    places,
  };
}
