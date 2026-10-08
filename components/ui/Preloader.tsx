"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/hooks";
import { lockScroll } from "@/components/providers/SmoothScroll";
import { useUI } from "@/store/ui";
import { MONOGRAM_PATH } from "./Monogram";

const MIN_DURATION = 1.9; // s — lets the monogram finish drawing
const MAX_WAIT = 6; // s — never hold the visitor longer than this

/**
 * First-load curtain. Rendered in the server HTML so nothing flashes before
 * hydration; the monogram starts drawing with pure CSS straight away.
 * Sequence: stroke draws → gold line fills with real progress (fonts +
 * critical images) → the panel lifts with a clip-path wipe while the line
 * rides its edge up to become the top hairline of the hero.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const setPreloaderDone = useUI((s) => s.setPreloaderDone);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    lockScroll(true);
    window.scrollTo(0, 0);

    const q = gsap.utils.selector(el);
    const [panel] = q(".pl-panel");
    const [lineWrap] = q(".pl-line");
    const [fill] = q(".pl-line__fill");
    const [count] = q(".pl-count");
    const content = q(".pl-content");
    const reduced = prefersReducedMotion();

    // ── progress: fonts + images marked data-critical, plus a time floor
    const tasks: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()];
    document.querySelectorAll<HTMLImageElement>("img[data-critical]").forEach((img) => {
      tasks.push(img.complete ? Promise.resolve() : img.decode().catch(() => undefined));
    });
    let settled = 0;
    const progress = { value: 0 };
    const render = () => {
      fill.style.transform = `scaleX(${progress.value})`;
      count.textContent = String(Math.round(progress.value * 100)).padStart(3, "0");
    };
    const target = () => 0.15 + 0.85 * (settled / tasks.length);
    tasks.forEach((t) => t.then(() => settled++));

    const started = performance.now();
    const ticker = () => {
      const elapsed = (performance.now() - started) / 1000;
      // Ease toward real progress, capped by the time floor so it never jumps.
      const cap = Math.min(1, elapsed / MIN_DURATION);
      const goal = Math.min(target(), cap);
      progress.value += (goal - progress.value) * 0.12;
      render();
    };
    gsap.ticker.add(ticker);

    const ready = Promise.race([
      Promise.all([...tasks, wait(MIN_DURATION * 1000)]),
      wait(MAX_WAIT * 1000),
    ]);

    let tl: gsap.core.Timeline | null = null;
    let cancelled = false;

    void ready.then(() => {
      if (cancelled) return;
      gsap.ticker.remove(ticker);

      const release = () => {
        el.style.pointerEvents = "none";
        lockScroll(false);
        setPreloaderDone();
      };
      const finish = () => setGone(true);

      if (reduced) {
        progress.value = 1;
        render();
        tl = gsap
          .timeline({ onComplete: finish })
          .call(release)
          .to(el, { autoAlpha: 0, duration: 0.4, ease: "none" });
        return;
      }

      const vh = window.innerHeight;
      tl = gsap
        .timeline({ onComplete: finish })
        .to(progress, { value: 1, duration: 0.45, ease: "power2.out", onUpdate: render })
        .to(content, { autoAlpha: 0, y: -14, duration: 0.6, stagger: 0.05 }, "+=0.1")
        .to(count, { autoAlpha: 0, duration: 0.3 }, "<")
        .addLabel("lift", "-=0.25")
        .call(release, [], "lift+=0.15")
        // Panel lifts away; the line rides its bottom edge to the top.
        .fromTo(
          panel,
          { clipPath: "inset(0% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 100% 0%)", duration: 1.15 },
          "lift",
        )
        .fromTo(lineWrap, { y: vh - 1 }, { y: 0, duration: 1.15 }, "lift")
        // …then the hairline sits on the hero's top edge a beat and draws out.
        .to(fill, { transformOrigin: "100% 50%", scaleX: 0, duration: 0.9 }, "+=0.15");
    });

    return () => {
      cancelled = true;
      gsap.ticker.remove(ticker);
      tl?.kill();
      lockScroll(false);
    };
  }, [setPreloaderDone]);

  if (gone) return null;

  return (
    <div ref={root} className="preloader fixed inset-0 z-[150]" aria-hidden>
      <div className="pl-panel absolute inset-0 bg-black text-ivory">
        <div className="pl-content absolute inset-0 flex flex-col items-center justify-center gap-7">
          <svg
            viewBox="0 0 64 74"
            className="pl-mono h-24 w-auto text-gold-light md:h-28"
            fill="none"
            stroke="currentColor"
            strokeWidth={0.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* No non-scaling-stroke here: it breaks pathLength-normalised dashes. */}
            <path d={MONOGRAM_PATH} pathLength={1} />
          </svg>
          <p className="pl-word wordmark text-[0.7rem] text-ivory/80">Maison Ondine</p>
        </div>
        <span className="pl-content mono absolute left-gutter top-6 text-ivory/55">fine jewellery</span>
        <span className="pl-content mono absolute right-gutter top-6 text-ivory/55">paris — est. 2009</span>
        <span className="pl-content mono absolute bottom-6 left-gutter text-ivory/55">atelier saint-honoré</span>
      </div>
      <span className="pl-count mono tabular absolute bottom-6 right-gutter text-ivory/70">000</span>
      <div className="pl-line absolute inset-x-0 top-0 h-px" style={{ transform: "translateY(calc(100svh - 1px))" }}>
        <div className="pl-line__fill h-full w-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
