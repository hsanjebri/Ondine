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
  lenis: Lenis | null;
  setPreloaderDone: () => void;
  setTransitioning: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setBagOpen: (v: boolean) => void;
  setLenis: (l: Lenis | null) => void;
}

export const useUI = create<UIState>((set) => ({
  preloaderDone: false,
  transitioning: false,
  menuOpen: false,
  bagOpen: false,
  lenis: null,
  setPreloaderDone: () => set({ preloaderDone: true }),
  setTransitioning: (transitioning) => set({ transitioning }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setBagOpen: (bagOpen) => set({ bagOpen }),
  setLenis: (lenis) => set({ lenis }),
}));
