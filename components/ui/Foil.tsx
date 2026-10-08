"use client";

import { useEffect, useRef, type ReactNode, type Ref } from "react";
import { cn } from "@/lib/cn";

/**
 * Gold-foil text. The sheen sweeps once when the element enters the
 * viewport and again on every hover. Reduced motion: static foil.
 */
export function Foil({
  as: Tag = "span",
  children,
  className,
  sheenOnHover = true,
}: {
  as?: "span" | "p" | "h1" | "h2" | "h3" | "div";
  children: ReactNode;
  className?: string;
  sheenOnHover?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sheen = () => {
      el.classList.remove("is-sheening");
      void el.offsetWidth; // restart the CSS animation
      el.classList.add("is-sheening");
    };
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) sheen();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    if (sheenOnHover) el.addEventListener("mouseenter", sheen);
    return () => {
      io.disconnect();
      el.removeEventListener("mouseenter", sheen);
    };
  }, [sheenOnHover]);

  return (
    <Tag ref={ref as Ref<HTMLSpanElement & HTMLParagraphElement & HTMLHeadingElement & HTMLDivElement>} className={cn("foil", className)}>
      {children}
    </Tag>
  );
}
