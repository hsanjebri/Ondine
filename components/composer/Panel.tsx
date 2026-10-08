"use client";

import { useRef, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { STEPS, type StepId } from "@/lib/composer-options";
import { pad } from "@/lib/format";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { useComposer } from "@/store/composer";
import { STEP_COMPONENTS } from "./Steps";
import { Summary } from "./Summary";
import { PriceBar } from "./PriceBar";

/**
 * The configuration panel: numbered steps (01 SETTING · 02 METAL …) as an
 * accessible tablist, the current step, Previous/Next, and the live price.
 */
export function Panel() {
  const step = useComposer((s) => s.step);
  const setStep = useComposer((s) => s.setStep);
  const reset = useComposer((s) => s.reset);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = step === "summary" ? STEPS.length : STEPS.findIndex((s) => s.id === step);
  const Current = step === "summary" ? Summary : STEP_COMPONENTS[step];
  const all: Array<{ id: StepId | "summary"; label: string }> = [...STEPS, { id: "summary", label: "Review" }];

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : (index + dir + all.length) % all.length;
    setStep(all[next].id);
    tabs.current[next]?.focus();
  };

  const go = (delta: number) => {
    const next = Math.max(0, Math.min(all.length - 1, index + delta));
    setStep(all[next].id);
  };

  return (
    <section aria-label="Compose your ring" className="paper relative flex min-h-full flex-col">
      <header className="px-6 pt-10 md:px-8 lg:pt-[calc(var(--header-h)+2.5rem)]">
        <p className="micro flex items-center gap-3">
          <span className="text-accent">06</span>
          <span aria-hidden className="h-px w-8 bg-current opacity-40" />
          <span>The composer</span>
        </p>
        <h1 className="heading mt-5">Compose your ring</h1>
        <p className="mt-4 max-w-md text-muted">
          Six choices, made in the atelier exactly as you set them. Every change shows on the ring and in the price.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Steps"
        onKeyDown={onKey}
        className="mt-8 flex gap-x-5 gap-y-2 overflow-x-auto border-y border-line px-6 py-4 [scrollbar-width:none] md:flex-wrap md:px-8"
      >
        {all.map((s, i) => {
          const active = s.id === step;
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`tab-${s.id}`}
              aria-selected={active}
              aria-controls="composer-step"
              tabIndex={active ? 0 : -1}
              onClick={() => setStep(s.id)}
              className={cn(
                "micro flex shrink-0 items-baseline gap-1.5 whitespace-nowrap transition-colors duration-300",
                active ? "text-fg" : "text-muted hover:text-fg",
              )}
            >
              <span className={cn("tabular", active ? "text-accent" : "")}>{i < STEPS.length ? pad(i + 1) : "—"}</span>
              <span className={cn(active && "underline decoration-accent underline-offset-[6px]")}>{s.label}</span>
            </button>
          );
        })}
      </div>

      <div
        id="composer-step"
        role="tabpanel"
        aria-labelledby={`tab-${step}`}
        tabIndex={0}
        className="flex-1 px-6 py-10 focus-visible:outline-offset-[-4px] md:px-8"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <h2 className="subheading mb-8">
              {step === "summary" ? "Your ring" : `${pad(index + 1)} — ${STEPS[index].label}`}
            </h2>
            <Current />
          </motion.div>
        </AnimatePresence>

        <nav aria-label="Step navigation" className="mt-12 flex items-center justify-between border-t border-line pt-6">
          {index > 0 ? (
            <button type="button" className="micro link-line text-muted hover:text-fg" onClick={() => go(-1)}>
              ← {all[index - 1].label}
            </button>
          ) : (
            <button type="button" className="mono link-line text-muted" onClick={reset}>
              start again
            </button>
          )}
          {index < all.length - 1 ? (
            <button type="button" className="micro link-line" onClick={() => go(1)}>
              {all[index + 1].label} →
            </button>
          ) : null}
        </nav>
      </div>

      <PriceBar />
    </section>
  );
}
