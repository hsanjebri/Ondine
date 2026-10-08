"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useFinePointer } from "@/lib/hooks";

/**
 * Dot + ring cursor. Any element with `data-cursor="view" | "drag" | "rotate"`
 * (or any label) grows the ring and shows that label. Links and buttons get
 * a smaller hover state. Not rendered on touch / coarse pointers.
 */
export function Cursor() {
  const enabled = useFinePointer();
  if (!enabled) return null;
  return <CursorInner />;
}

const INTERACTIVE = "a, button, [role='button'], label, summary, input[type='range'], select";

function CursorInner() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const d = dot.current!;
    const r = ring.current!;
    const l = label.current!;
    root.classList.add("has-cursor");

    const dotX = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(r, "x", { duration: 0.5, ease: "power3.out" });
    const ringY = gsap.quickTo(r, "y", { duration: 0.5, ease: "power3.out" });

    let current = "";
    let visible = false;

    const setState = (state: string) => {
      if (state === current) return;
      current = state;
      const isLabel = state !== "" && state !== "link" && state !== "text";
      r.dataset.state = isLabel ? "label" : state;
      d.dataset.state = isLabel ? "label" : state;
      if (isLabel) l.textContent = state;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!visible) {
        visible = true;
        gsap.set([d, r], { x: e.clientX, y: e.clientY });
        gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      const target = e.target as Element | null;
      const zone = target?.closest<HTMLElement>("[data-cursor]");
      if (zone && zone.dataset.cursor) return setState(zone.dataset.cursor);
      if (target?.closest("input, textarea, [contenteditable='true']")) return setState("text");
      if (target?.closest(INTERACTIVE)) return setState("link");
      setState("");
    };

    const onLeave = () => {
      visible = false;
      gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () => r.classList.add("is-pressed");
    const onUp = () => r.classList.remove("is-pressed");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={ring} aria-hidden className="cursor-ring">
        <span className="cursor-ring__circle" />
        <span ref={label} className="cursor-ring__label micro" />
      </div>
      <div ref={dot} aria-hidden className="cursor-dot" />
    </>
  );
}
