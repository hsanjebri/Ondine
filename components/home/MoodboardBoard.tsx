"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap, Draggable, useGSAP, MOTION_QUERIES } from "@/lib/gsap";
import { cn } from "@/lib/cn";

export interface MoodItem {
  key: string;
  node: ReactNode;
  /** Desktop placement, % of the board (x, y) and width (% of board width) */
  x: number;
  y: number;
  w: number;
  /** Mobile placement */
  mx: number;
  my: number;
  mw: number;
  /** Resting rotation, degrees */
  r: number;
  hideOnMobile?: boolean;
}

/**
 * The collage. Each card sits in two layers: the outer one flies in from
 * off-screen (scrubbed to scroll), the inner one is draggable with inertia
 * and lifts/straightens on hover. Drag is desktop-only so touch scrolling
 * is never trapped.
 */
export function MoodboardBoard({ items }: { items: MoodItem[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const board = root.current!;
      const outers = gsap.utils.toArray<HTMLElement>(".mb-fly", board);
      const inners = gsap.utils.toArray<HTMLElement>(".mb-card", board);
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.motion, () => {
        // Fly in from beyond the edges, each along the line from the board's centre.
        const rect = board.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const tl = gsap.timeline({
          scrollTrigger: { trigger: board, start: "top 95%", end: "top 20%", scrub: 0.8 },
        });
        outers.forEach((el, i) => {
          const b = el.getBoundingClientRect();
          const dx = b.left - rect.left + b.width / 2 - cx;
          const dy = b.top - rect.top + b.height / 2 - cy;
          const len = Math.hypot(dx, dy) || 1;
          const push = Math.max(window.innerWidth, window.innerHeight) * 0.75;
          // From the sides and from below only — never across the heading above.
          tl.fromTo(
            el,
            {
              x: (dx / len) * push,
              y: (Math.abs(dy) / len) * push * 0.5 + push * 0.25,
              rotation: (i % 2 ? 1 : -1) * 18,
            },
            { x: 0, y: 0, rotation: 0, ease: "power2.out", duration: 1 },
            i * 0.06,
          );
        });
      });

      mm.add(`${MOTION_QUERIES.motion} and ${MOTION_QUERIES.fine}`, () => {
        const lift = (el: HTMLElement, on: boolean) => {
          el.classList.toggle("is-lifted", on);
          gsap.to(el, {
            rotation: on ? 0 : Number(el.dataset.r),
            scale: on ? 1.045 : 1,
            duration: 0.45,
            overwrite: "auto",
          });
        };
        const enter = (e: Event) => lift(e.currentTarget as HTMLElement, true);
        const leave = (e: Event) => {
          const el = e.currentTarget as HTMLElement;
          if (!el.classList.contains("is-dragging")) lift(el, false);
        };
        inners.forEach((el) => {
          el.addEventListener("pointerenter", enter);
          el.addEventListener("pointerleave", leave);
        });

        const draggables = Draggable.create(inners, {
          type: "x,y",
          // Bounds are applied on press, not at creation: at creation the cards
          // are still flown off-screen and would be clamped into the board.
          inertia: true,
          // Paper on a table: a short, heavy glide rather than a fling.
          throwResistance: 3200,
          maxDuration: 0.9,
          edgeResistance: 0.8,
          zIndexBoost: true,
          onPress() {
            this.applyBounds(board);
            (this.target as HTMLElement).classList.add("is-dragging");
          },
          onRelease() {
            const el = this.target as HTMLElement;
            el.classList.remove("is-dragging");
            if (!el.matches(":hover")) lift(el, false);
          },
        });

        return () => {
          draggables.forEach((d) => d.kill());
          inners.forEach((el) => {
            el.removeEventListener("pointerenter", enter);
            el.removeEventListener("pointerleave", leave);
          });
        };
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      role="group"
      aria-label="Moodboard: photographs and stationery from the house"
      className="relative mx-auto aspect-[3/4.4] w-full md:aspect-[16/10]"
    >
      {items.map((it, i) => (
        <div
          key={it.key}
          className={cn("mb-fly absolute", it.hideOnMobile && "hidden md:block")}
          style={
            {
              "--x": `${it.x}%`,
              "--y": `${it.y}%`,
              "--w": `${it.w}%`,
              "--mx": `${it.mx}%`,
              "--my": `${it.my}%`,
              "--mw": `${it.mw}%`,
              zIndex: i + 1,
            } as CSSProperties
          }
        >
          <div
            className="mb-card relative"
            data-r={it.r}
            data-cursor="drag"
            style={{ transform: `rotate(${it.r}deg)` }}
          >
            {it.node}
          </div>
        </div>
      ))}
    </div>
  );
}
