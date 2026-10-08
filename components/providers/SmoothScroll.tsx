"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { REDUCED_MOTION } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { useCart } from "@/store/cart";

/**
 * Lenis smooth scroll driven by GSAP's ticker, so ScrollTrigger and Lenis
 * share one clock. Disabled (native scroll) for reduced motion.
 */
export function SmoothScroll() {
  const setLenis = useUI((s) => s.setLenis);

  useEffect(() => {
    // Persisted bag is hydrated on the client only (avoids SSR mismatch).
    void useCart.persist.rehydrate();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(REDUCED_MOTION);
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const start = () => {
      lenis = new Lenis({
        autoRaf: false,
        lerp: 0.09,
        wheelMultiplier: 0.95,
        anchors: false,
        allowNestedScroll: true,
        prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
      });
      if (locks > 0) lenis.stop();
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(lenis);
    };

    const stop = () => {
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      tick = null;
      setLenis(null);
    };

    if (!mq.matches) start();
    const onChange = () => {
      stop();
      if (!mq.matches) start();
      ScrollTrigger.refresh();
    };
    mq.addEventListener("change", onChange);

    // Fonts change line lengths → re-measure pinned/scrubbed sections.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      mq.removeEventListener("change", onChange);
      stop();
    };
  }, [setLenis]);

  return null;
}

let locks = 0;

/**
 * Stop/start scrolling regardless of whether Lenis is active. Counted, so
 * overlapping locks (preloader, menu, page transition, drawers) nest safely.
 */
export function lockScroll(locked: boolean) {
  locks = Math.max(0, locks + (locked ? 1 : -1));
  const isLocked = locks > 0;
  const { lenis } = useUI.getState();
  if (lenis) {
    if (isLocked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.classList.toggle("scroll-locked", isLocked);
}

export function scrollToTop() {
  const { lenis } = useUI.getState();
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  window.scrollTo(0, 0);
}
