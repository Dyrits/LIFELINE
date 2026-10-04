import type { Point } from './math';

/** The 2D context of a canvas; a browser without one cannot show the drawing at all. */
export function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D is not available');
  return context;
}

/** Adds an open polyline through `points` to a path. */
export function trace(path: CanvasPath, points: readonly Point[]): void {
  points.forEach(([x, y], index) => {
    if (index) path.lineTo(x, y);
    else path.moveTo(x, y);
  });
}
