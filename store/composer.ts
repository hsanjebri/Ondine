"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_CONFIG, normalize, stepsFor, type Config, type StepId } from "@/lib/composer-options";

export type ComposerStep = StepId | "summary";

interface ComposerState {
  config: Config;
  step: ComposerStep;
  set: <K extends keyof Config>(key: K, value: Config[K]) => void;
  replace: (config: Config) => void;
  reset: () => void;
  setStep: (step: ComposerStep) => void;
}

export const useComposer = create<ComposerState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,
      step: "piece",
      set: (key, value) =>
        set((s) => {
          const config = normalize({ ...s.config, [key]: value }, s.config);
          // If the current step no longer applies (e.g. earrings have no size), move on.
          const valid = s.step === "summary" || stepsFor(config).some((st) => st.id === s.step);
          return { config, step: valid ? s.step : "box" };
        }),
      replace: (config) => set({ config: normalize(config, config) }),
      reset: () => set({ config: DEFAULT_CONFIG, step: "piece" }),
      setStep: (step) => set({ step }),
    }),
    {
      name: "ondine-composer",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ config: s.config }),
      skipHydration: true,
      // v1 stored a 3D ring configuration with a different shape: start fresh.
      version: 2,
      migrate: () => ({ config: DEFAULT_CONFIG }),
    },
  ),
);
