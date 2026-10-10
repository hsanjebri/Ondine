"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { formatEuro } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/hooks";
import { price as priceOf } from "@/lib/pricing";
import { useComposer } from "@/store/composer";
import { cn } from "@/lib/cn";

/** Animated euro amount: counts up or down to the new value. */
export function CountingPrice({ value, className }: { value: number; className?: string }) {
  const el = useRef<HTMLSpanElement>(null);
  const shown = useRef({ v: value });
  const [announce, setAnnounce] = useState(value);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const t = gsap.to(shown.current, {
      v: value,
      duration: prefersReducedMotion() ? 0 : 0.9,
      onUpdate: () => {
        node.textContent = formatEuro(Math.round(shown.current.v / 10) * 10);
      },
    });
    // Announce once the number settles, not on every frame.
    const id = window.setTimeout(() => setAnnounce(value), 900);
    return () => {
      t.kill();
      window.clearTimeout(id);
    };
  }, [value]);

  return (
    <>
      <span ref={el} aria-hidden className={cn("tabular whitespace-nowrap", className)}>
        {formatEuro(value)}
      </span>
      <span className="sr-only" aria-live="polite">
        Total {formatEuro(announce)}
      </span>
    </>
  );
}

/** Sticky live price at the bottom of the panel. */
export function PriceBar() {
  const config = useComposer((s) => s.config);
  const step = useComposer((s) => s.step);
  const setStep = useComposer((s) => s.setStep);
  const price = priceOf(config);

  return (
    <div className="paper sticky bottom-0 z-10 border-t border-line">
      <div className="flex items-center justify-between gap-4 px-6 py-4 md:px-8">
        <div>
          <p className="micro text-muted">Your piece</p>
          <p className="font-serif text-[1.9rem] leading-none">
            <CountingPrice value={price.total} />
          </p>
          <p className="mono mt-1 text-muted">taxes, engraving and delivery included</p>
        </div>
        {step === "summary" ? null : (
          <button type="button" className="btn shrink-0" onClick={() => setStep("summary")}>
            Review
          </button>
        )}
      </div>
    </div>
  );
}
