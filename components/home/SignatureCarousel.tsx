"use client";

import { useRef, useState, type ReactNode } from "react";
import { gsap, Draggable, useGSAP, MOTION_QUERIES } from "@/lib/gsap";
import { pad } from "@/lib/format";
import { prefersReducedMotion } from "@/lib/hooks";

/**
 * Horizontal catalogue. Fine pointers: GSAP Draggable with inertia, cards
 * tilt toward the cursor. Touch: native horizontal scroll with snap.
 * Keyboard: arrow keys on the track, Previous/Next buttons, and focusing a
 * card brings it into view.
 */
export function SignatureCarousel({ cards, label }: { cards: ReactNode[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const api = useRef<{ goTo: (i: number) => void; index: () => number } | null>(null);
  const [index, setIndex] = useState(0);
  const bar = useRef<HTMLSpanElement>(null);
  const [atEnd, setAtEnd] = useState(false);

  useGSAP(
    () => {
      const vp = viewport.current!;
      const tr = track.current!;
      const items = Array.from(tr.children) as HTMLElement[];
      const mm = gsap.matchMedia();

      const report = (x: number, min: number) => {
        const p = min < 0 ? Math.min(1, Math.max(0, x / min)) : 0;
        if (bar.current) bar.current.style.transform = `scaleX(${Math.max(0.04, p)})`;
        setAtEnd(p >= 0.999);
        // Active card = the one whose left edge is nearest the viewport's left edge.
        let best = 0;
        let bestDist = Infinity;
        items.forEach((el, i) => {
          const d = Math.abs(el.offsetLeft + x - items[0].offsetLeft);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        setIndex(best);
      };

      // ── Fine pointer: draggable track
      mm.add(MOTION_QUERIES.fine, () => {
        vp.dataset.mode = "drag";
        let min = 0;
        let lastDrag = 0;
        const measure = () => {
          min = Math.min(0, vp.clientWidth - tr.scrollWidth);
          return { minX: min, maxX: 0 };
        };
        const xTo = (x: number, duration = prefersReducedMotion() ? 0 : 0.9) => {
          const clamped = Math.max(min, Math.min(0, x));
          gsap.to(tr, { x: clamped, duration, onUpdate: () => report(Number(gsap.getProperty(tr, "x")), min) });
        };

        const [drag] = Draggable.create(tr, {
          type: "x",
          bounds: measure(),
          inertia: !prefersReducedMotion(),
          throwResistance: 1600,
          maxDuration: 1.2,
          // Come to rest on a card edge.
          snap: {
            x: (end: number) => {
              const stops = items.map((el) => Math.max(min, -(el.offsetLeft - items[0].offsetLeft)));
              return stops.reduce((best, s) => (Math.abs(s - end) < Math.abs(best - end) ? s : best), stops[0]);
            },
          },
          edgeResistance: 0.85,
          dragClickables: true,
          minimumMovement: 6,
          onDrag() {
            report(this.x, min);
          },
          onThrowUpdate() {
            report(this.x, min);
          },
          onDragEnd() {
            lastDrag = performance.now();
          },
        });

        // A drag must never open the card it started on.
        const swallowClick = (e: MouseEvent) => {
          if (performance.now() - lastDrag < 250) {
            e.preventDefault();
            e.stopPropagation();
          }
        };
        tr.addEventListener("click", swallowClick, true);

        // Horizontal trackpad gestures move the track.
        const onWheel = (e: WheelEvent) => {
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
          e.preventDefault();
          const x = Number(gsap.getProperty(tr, "x")) - e.deltaX;
          gsap.set(tr, { x: Math.max(min, Math.min(0, x)) });
          drag.update();
          report(Number(gsap.getProperty(tr, "x")), min);
        };
        vp.addEventListener("wheel", onWheel, { passive: false });

        const onResize = () => {
          drag.applyBounds(measure());
          report(Number(gsap.getProperty(tr, "x")), min);
        };
        window.addEventListener("resize", onResize);

        api.current = {
          goTo: (i) => {
            const target = items[Math.max(0, Math.min(items.length - 1, i))];
            xTo(-(target.offsetLeft - items[0].offsetLeft));
          },
          index: () => {
            const x = Number(gsap.getProperty(tr, "x"));
            let best = 0;
            items.forEach((el, i) => {
              if (Math.abs(el.offsetLeft - items[0].offsetLeft + x) < Math.abs(items[best].offsetLeft - items[0].offsetLeft + x)) best = i;
            });
            return best;
          },
        };

        // Focus a card with the keyboard → bring it into view.
        const onFocus = (e: FocusEvent) => {
          const li = (e.target as HTMLElement).closest("li");
          if (!li) return;
          const i = items.indexOf(li);
          const x = Number(gsap.getProperty(tr, "x"));
          const left = li.offsetLeft + x;
          if (left < 0 || left + li.offsetWidth > vp.clientWidth) api.current?.goTo(i);
        };
        tr.addEventListener("focusin", onFocus);

        // Cards lean toward the cursor; the photo zooms inside its frame (CSS).
        const tilt = (e: PointerEvent) => {
          if (prefersReducedMotion()) return;
          const card = (e.target as HTMLElement).closest<HTMLElement>(".sp-card");
          if (!card) return;
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotationY: px * 9, rotationX: -py * 7, transformPerspective: 900, duration: 0.6, overwrite: "auto" });
        };
        const untilt = (e: PointerEvent) => {
          const card = (e.target as HTMLElement).closest<HTMLElement>(".sp-card");
          if (card && !card.contains(e.relatedTarget as Node)) gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.8 });
        };
        tr.addEventListener("pointermove", tilt);
        tr.addEventListener("pointerout", untilt);

        return () => {
          drag.kill();
          tr.removeEventListener("click", swallowClick, true);
          vp.removeEventListener("wheel", onWheel);
          window.removeEventListener("resize", onResize);
          tr.removeEventListener("focusin", onFocus);
          tr.removeEventListener("pointermove", tilt);
          tr.removeEventListener("pointerout", untilt);
          gsap.set(tr, { x: 0 });
          delete vp.dataset.mode;
          api.current = null;
        };
      });

      // ── Touch / coarse pointer: native scroll with snap
      mm.add("(hover: none), (pointer: coarse)", () => {
        vp.dataset.mode = "scroll";
        const onScroll = () => report(-vp.scrollLeft, Math.min(0, vp.clientWidth - vp.scrollWidth));
        vp.addEventListener("scroll", onScroll, { passive: true });
        api.current = {
          goTo: (i) => {
            const target = items[Math.max(0, Math.min(items.length - 1, i))];
            vp.scrollTo({ left: target.offsetLeft - items[0].offsetLeft, behavior: prefersReducedMotion() ? "auto" : "smooth" });
          },
          index: () => {
            let best = 0;
            items.forEach((el, i) => {
              if (Math.abs(el.offsetLeft - items[0].offsetLeft - vp.scrollLeft) < Math.abs(items[best].offsetLeft - items[0].offsetLeft - vp.scrollLeft)) best = i;
            });
            return best;
          },
        };
        return () => {
          vp.removeEventListener("scroll", onScroll);
          delete vp.dataset.mode;
          api.current = null;
        };
      });

      // Cards rise in when the section arrives.
      mm.add(MOTION_QUERIES.motion, () => {
        gsap.fromTo(
          items,
          { y: 60, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1.2, stagger: 0.07, scrollTrigger: { trigger: vp, start: "top 85%" } },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const go = (delta: number) => {
    const current = api.current?.index() ?? index;
    api.current?.goTo(current + delta);
  };

  return (
    <div ref={root}>
      <div className="shell mb-8 flex items-center justify-between gap-6">
        <p className="mono tabular text-muted" aria-live="polite">
          {pad(index + 1)} / {pad(cards.length)}
        </p>
        <div className="flex items-center gap-6">
          <button type="button" className="micro link-line disabled:opacity-30" onClick={() => go(-1)} disabled={index === 0}>
            Previous
          </button>
          <button
            type="button"
            className="micro link-line disabled:opacity-30"
            onClick={() => go(1)}
            disabled={atEnd}
          >
            Next
          </button>
        </div>
      </div>

      <div
        ref={viewport}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        data-cursor="drag"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        className="sp-viewport overflow-hidden focus-visible:outline-offset-[-1px]"
      >
        <ul ref={track} className="sp-track flex w-max gap-[clamp(1rem,2vw,2rem)] px-gutter">
          {cards.map((card, i) => (
            <li key={i} className="w-[clamp(15rem,24vw,23rem)] shrink-0">
              {card}
            </li>
          ))}
        </ul>
      </div>

      <div className="shell mt-10">
        <div className="relative h-px w-full bg-line" aria-hidden>
          <span
            ref={bar}
            className="absolute inset-y-0 left-0 w-full origin-left bg-accent"
            style={{ transform: "scaleX(0.04)" }}
          />
        </div>
      </div>
    </div>
  );
}
