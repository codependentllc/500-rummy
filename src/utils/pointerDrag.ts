import type { PointerEvent as ReactPointerEvent } from "react";

export type Point = {
  x: number;
  y: number;
};

export function pointerPoint(event: PointerEvent | ReactPointerEvent): Point {
  return { x: event.clientX, y: event.clientY };
}

export function movedBeyondThreshold(start: Point, current: Point, threshold = 8): boolean {
  return Math.hypot(current.x - start.x, current.y - start.y) > threshold;
}

export function pointInElement(element: Element | null, point: Point): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
}
