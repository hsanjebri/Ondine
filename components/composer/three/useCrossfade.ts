"use client";

import { useRef, useState, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";

export interface Layer<T> {
  id: number;
  value: T;
  leaving: boolean;
}

export type Fades = RefObject<Map<number, number>>;

/** easeOutCubic — applied when a fade value is consumed. */
export const easeFade = (v: number) => 1 - Math.pow(1 - v, 3);

/** Current fade (0–1) of a layer; read inside useFrame only. */
export const fadeOf = (fades: Fades, id: number) => easeFade(fades.current?.get(id) ?? 0);

/**
 * Keeps the previous value on screen while the next one arrives, so an
 * option change is a crossfade instead of a hard swap. Fade values (0–1)
 * live in a ref and advance every frame; React only re-renders when a
 * layer is added or removed.
 */
export function useCrossfade<T>(value: T, inDuration = 0.5, outDuration = 0.32) {
  const [prev, setPrev] = useState(value);
  const [layers, setLayers] = useState<Layer<T>[]>([{ id: 0, value, leaving: false }]);
  const fades = useRef(new Map<number, number>([[0, 1]]));

  // Adjust state while rendering when the value changes (no effect needed).
  if (!Object.is(value, prev)) {
    setPrev(value);
    setLayers((ls) => [
      ...ls.map((l) => ({ ...l, leaving: true })),
      { id: ls[ls.length - 1].id + 1, value, leaving: false },
    ]);
  }

  useFrame((_, dt) => {
    const map = fades.current;
    const finished = new Set<number>();
    for (const l of layers) {
      const v = map.get(l.id) ?? 0;
      if (l.leaving) {
        const next = Math.max(0, v - dt / outDuration);
        map.set(l.id, next);
        if (next === 0) finished.add(l.id);
      } else {
        map.set(l.id, Math.min(1, v + dt / inDuration));
      }
    }
    if (finished.size) {
      finished.forEach((id) => map.delete(id));
      setLayers((ls) => ls.filter((l) => !finished.has(l.id)));
    }
  });

  return { layers, fades };
}
