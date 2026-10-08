"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/gsap";

const ROWS = 20; // two passes of 0–9, so every digit rolls through a full turn

/**
 * Number that rolls up digit by digit when it enters the viewport.
 * Transform-only (each digit is a translated column). Screen readers get
 * the plain number.
 */
export function Odometer({ value, className }: { value: number; className?: string }) {
  const root = useRef<HTMLSpanElement>(null);
  const text = new Intl.NumberFormat("en-GB").format(value);

  useGSAP(
    () => {
      const cols = gsap.utils.toArray<HTMLElement>(".odo-col", root.current);
      const target = (el: HTMLElement) => -((10 + Number(el.dataset.d)) / ROWS) * 100;
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        gsap.fromTo(
          cols,
          { yPercent: 0 },
          {
            yPercent: (_, el) => target(el as HTMLElement),
            duration: 2.2,
            stagger: { each: 0.12, from: "end" },
            scrollTrigger: { trigger: root.current, start: "top 88%", toggleActions: "play none none reverse" },
          },
        );
      });
      mm.add(MOTION_QUERIES.reduced, () => {
        gsap.set(cols, { yPercent: (_, el) => target(el as HTMLElement) });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <span ref={root} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex">
        {[...text].map((ch, i) =>
          /\d/.test(ch) ? (
            <span key={i} className="relative inline-block h-[1em] overflow-hidden leading-none">
              <span className="odo-col block" data-d={ch}>
                {Array.from({ length: ROWS }, (_, n) => (
                  <span key={n} className="block h-[1em]">
                    {n % 10}
                  </span>
                ))}
              </span>
            </span>
          ) : (
            <span key={i} className="inline-block h-[1em] leading-none">
              {ch}
            </span>
          ),
        )}
      </span>
    </span>
  );
}
