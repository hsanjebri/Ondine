"use client";

import { gsap } from "./gsap";
import { prefersReducedMotion } from "./hooks";
import { useUI } from "@/store/ui";

/*
 * "Fly to bag": a copy of the element lifts off, arcs across the screen
 * while shrinking and turning, leaves a short trail of gold sparks, and
 * drops into the header's Bag button, which then bounces.
 *
 *   await flyToBag(pieceElement);   // resolves when it lands
 *
 * The header is held on screen during the flight (it hides on scroll), and
 * the target is re-measured every frame so it is hit even while the header
 * slides back in. Reduced motion: no flight, just the bag's bounce.
 */

const TARGET = "[data-bag-target]";

function centre(r: DOMRect) {
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function spark(x: number, y: number, size: number) {
  const s = document.createElement("span");
  s.className = "fly-spark";
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  s.style.setProperty("--s", `${size}px`);
  s.style.setProperty("--dx", `${(Math.random() - 0.5) * 34}px`);
  s.style.setProperty("--dy", `${(Math.random() - 0.2) * 34}px`);
  document.body.appendChild(s);
  s.addEventListener("animationend", () => s.remove(), { once: true });
}

function burst(x: number, y: number) {
  const ring = document.createElement("span");
  ring.className = "fly-burst";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  document.body.appendChild(ring);
  ring.addEventListener("animationend", () => ring.remove(), { once: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const s = document.createElement("span");
    s.className = "fly-spark fly-spark--burst";
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty("--s", `${4 + Math.random() * 4}px`);
    s.style.setProperty("--dx", `${Math.cos(a) * (26 + Math.random() * 16)}px`);
    s.style.setProperty("--dy", `${Math.sin(a) * (26 + Math.random() * 16)}px`);
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove(), { once: true });
  }
}

let unpinTimer = 0;

export function flyToBag(source: HTMLElement | null): Promise<void> {
  const ui = useUI.getState();
  const land = () => {
    useUI.getState().bumpBag();
    window.clearTimeout(unpinTimer);
    unpinTimer = window.setTimeout(() => useUI.getState().setHeaderPinned(false), 1600);
  };

  ui.setHeaderPinned(true);
  const target = document.querySelector<HTMLElement>(TARGET);
  if (!source || !target || prefersReducedMotion()) {
    land();
    return Promise.resolve();
  }

  const from = source.getBoundingClientRect();
  if (!from.width || !from.height) {
    land();
    return Promise.resolve();
  }

  // The flying copy: same size and place as the source, above everything.
  const flyer = document.createElement("div");
  flyer.className = "fly-item";
  Object.assign(flyer.style, {
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
  });
  const copy = source.cloneNode(true) as HTMLElement;
  copy.removeAttribute("id");
  copy.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  Object.assign(copy.style, { position: "absolute", inset: "0", width: "100%", height: "100%", margin: "0", transform: "none" });
  flyer.appendChild(copy);
  document.body.appendChild(flyer);

  const start = centre(from);
  // Shrink to roughly the size of the bag label.
  const endScale = Math.min(0.5, 44 / Math.max(from.width, from.height));
  const state = { t: 0 };
  let lastSpark = 0;

  return new Promise((resolve) => {
    gsap
      .timeline({
        onComplete: () => {
          flyer.remove();
          const end = centre(target.getBoundingClientRect());
          burst(end.x, end.y);
          land();
          resolve();
        },
      })
      // Lift off
      .to(flyer, { scale: 1.08, y: -10, duration: 0.28, ease: "power2.out" })
      // Arc into the bag
      .to(state, {
        t: 1,
        duration: 1.05,
        ease: "power2.inOut",
        onUpdate: () => {
          const t = state.t;
          const end = centre(target.getBoundingClientRect());
          // Quadratic Bézier: the piece swoops out sideways and rises into the bag,
          // bowing away from the straight line; the curve always stays on screen.
          const dx = end.x - start.x;
          const cx = Math.min(window.innerWidth - 40, Math.max(40, start.x + dx * 0.95 + Math.sign(dx || 1) * 60));
          const cy = Math.min(window.innerHeight - 60, Math.max(80, start.y + (end.y - start.y) * 0.1));
          const u = 1 - t;
          const x = u * u * start.x + 2 * u * t * cx + t * t * end.x;
          const y = u * u * start.y + 2 * u * t * cy + t * t * end.y;
          const scale = 1.08 + (endScale - 1.08) * Math.pow(t, 0.8);
          gsap.set(flyer, {
            x: x - start.x,
            y: y - start.y - 10 * (1 - t),
            scale,
            rotation: Math.sin(t * Math.PI) * -18 + t * 160,
            opacity: t > 0.9 ? 1 - (t - 0.9) * 10 : 1,
          });
          const now = performance.now();
          if (now - lastSpark > 28 && t > 0.05 && t < 0.95) {
            lastSpark = now;
            spark(x, y, 3 + Math.random() * 5 * (1 - t));
          }
        },
      });
  });
}
