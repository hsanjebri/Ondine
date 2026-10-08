"use client";

import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe media query. Returns `serverValue` during SSR and hydration. */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";

export function usePrefersReducedMotion() {
  return useMediaQuery(REDUCED_MOTION, false);
}

export function useFinePointer() {
  return useMediaQuery(FINE_POINTER, false);
}

/** Non-hook check for use inside effects and event handlers. */
export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches;
}
