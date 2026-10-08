"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_CONFIG, snapCarat, type RingConfig, type StepId } from "@/lib/composer-options";

export type CameraPreset = "front" | "top" | "hand";
export type Snapshotter = (width?: number) => string | null;

interface ComposerState {
  config: RingConfig;
  step: StepId | "summary";
  camera: CameraPreset;
  /** Registered by the 3D (or 2D) view: returns a data URL of the current ring. */
  snapshot: Snapshotter | null;
  set: <K extends keyof RingConfig>(key: K, value: RingConfig[K]) => void;
  replace: (config: RingConfig) => void;
  reset: () => void;
  setStep: (step: StepId | "summary") => void;
  setCamera: (camera: CameraPreset) => void;
  setSnapshot: (fn: Snapshotter | null) => void;
}

export const useComposer = create<ComposerState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      step: "setting",
      camera: "front",
      snapshot: null,
      set: (key, value) =>
        set((s) => ({
          config: { ...s.config, [key]: key === "carat" ? snapCarat(value as number) : value },
        })),
      replace: (config) => set({ config }),
      reset: () => set({ config: DEFAULT_CONFIG, step: "setting" }),
      setStep: (step) => set({ step }),
      setCamera: (camera) => set({ camera }),
      setSnapshot: (snapshot) => set({ snapshot }),
    }),
    {
      name: "ondine-composer",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ config: s.config }),
      skipHydration: true,
      version: 1,
    },
  ),
);
