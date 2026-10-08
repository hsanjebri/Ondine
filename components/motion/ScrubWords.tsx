"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/**
 * A sentence revealed word by word as it scrolls through the viewport
 * (opacity 0.15 → 1, scrubbed and reversible). Words are split on the
 * server so there is no layout shift; reduced motion shows it at once.
 */
export function ScrubWords({
  text,
  className,
  as: Tag = "p",
}: {
  text: string;
  className?: string;
  as?: "p" | "h2" | "blockquote";
}) {
  const root = useRef<HTMLElement>(null);
  const words = text.split(" ");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_QUERIES.motion, () => {
        const items = gsap.utils.toArray<HTMLElement>(".sw-word", root.current);
        gsap.fromTo(
          items,
          { opacity: 0.15 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: {
              trigger: root.current,
              start: "top 78%",
              end: "bottom 42%",
              scrub: 0.6,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <Tag ref={root as never} className={cn(className)}>
      {words.map((w, i) => (
        <span key={i} className="sw-word">
          {w}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
