"use client";

import { create } from "zustand";
import type Lenis from "lenis";

interface UIState {
  /** True once the preloader has lifted — hero intros wait for this. */
  preloaderDone: boolean;
  /** True while the page-transition panel covers the screen. */
  transitioning: boolean;
  menuOpen: boolean;
  bagOpen: boolean;
  /** Keeps the header on screen (e.g. while an item flies into the bag). */
  headerPinned: boolean;
  /** Increments each time something lands in the bag: the Bag button bounces. */
  bagPulse: number;
  lenis: Lenis | null;
  setPreloaderDone: () => void;
  setTransitioning: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setBagOpen: (v: boolean) => void;
  setHeaderPinned: (v: boolean) => void;
  bumpBag: () => void;
  setLenis: (l: Lenis | null) => void;
}

export const useUI = create<UIState>((set) => ({
  preloaderDone: false,
  transitioning: false,
  menuOpen: false,
  bagOpen: false,
  headerPinned: false,
  bagPulse: 0,
  lenis: null,
  setPreloaderDone: () => set({ preloaderDone: true }),
  setTransitioning: (transitioning) => set({ transitioning }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setBagOpen: (bagOpen) => set({ bagOpen }),
  setHeaderPinned: (headerPinned) => set({ headerPinned }),
  bumpBag: () => set((s) => ({ bagPulse: s.bagPulse + 1 })),
  setLenis: (lenis) => set({ lenis }),
}));
