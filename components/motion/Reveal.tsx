"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * Fades and lifts its `[data-reveal]` children (or itself) into place when
 * they enter the viewport. Reduced motion: a plain fade.
 */
export function Reveal({
  children,
  className,
  stagger = 0.08,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const targets = el.querySelectorAll("[data-reveal]");
      const items = targets.length ? Array.from(targets) : [el];
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        gsap.fromTo(
          items,
          { autoAlpha: 0, y },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1.1,
            stagger,
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none reverse" },
          },
        );
      });
      mm.add(MOTION_QUERIES.reduced, () => {
        gsap.fromTo(
          items,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.5, ease: "none", scrollTrigger: { trigger: el, start: "top 90%" } },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn(className)}>
      {children}
    </div>
  );
}
