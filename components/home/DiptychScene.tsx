"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_QUERIES } from "@/lib/gsap";

interface DiptychSceneProps {
  left: ReactNode;
  /** The photograph, rendered twice: greyscale base and colour layer. */
  base: ReactNode;
  colour: ReactNode;
  /** Focal point of the jewellery, in % of the image. */
  focus: { x: number; y: number };
  /** Image aspect ratio (w / h). */
  aspect: number;
  seam: ReactNode;
}

/**
 * C — The diptych. Pinned on desktop: the two panels slide apart from the
 * centre seam while colour returns to the photograph around the jewellery
 * only (a growing clip-path over a greyscale base).
 */
export function DiptychScene({ left, base, colour, focus, aspect, seam }: DiptychSceneProps) {
  const root = useRef<HTMLElement>(null);
  const origin = `${focus.x}% ${focus.y}%`;
  const mask = `radial-gradient(circle at ${origin}, #000 0%, #000 14%, transparent 34%)`;

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      // Colour bloom, transform-only: the soft-masked layer scales up from the
      // jewellery while its photograph counter-scales, so the image stays put
      // and only the soft-edged region of colour grows.
      const outer = q(".dp-colour")[0] as HTMLElement;
      const inner = q(".dp-colour-inner")[0] as HTMLElement;
      const bloom = { s: 0.15 };
      const applyBloom = () => {
        gsap.set(outer, { scale: bloom.s });
        gsap.set(inner, { scale: 1 / bloom.s });
      };

      mm.add(`${MOTION_QUERIES.motion} and ${MOTION_QUERIES.desktop}`, () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "+=130%", scrub: 0.8, pin: true },
          })
          .fromTo(q(".dp-left"), { xPercent: 0 }, { xPercent: -9, ease: "none" }, 0)
          .fromTo(q(".dp-right"), { xPercent: 0 }, { xPercent: 9, ease: "none" }, 0)
          .fromTo(q(".dp-seam-line"), { scaleY: 0 }, { scaleY: 1, ease: "none" }, 0.1)
          .fromTo(q(".dp-seam-text"), { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.3 }, 0.45)
          .fromTo(q(".dp-img"), { scale: 1.12 }, { scale: 1, ease: "none" }, 0)
          .fromTo(bloom, { s: 0.15 }, { s: 1, ease: "power1.inOut", onUpdate: applyBloom }, 0.15)
          .fromTo(outer, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.3 }, 0.15);
      });

      mm.add(`${MOTION_QUERIES.motion} and (max-width: 1023px)`, () => {
        gsap
          .timeline({
            scrollTrigger: { trigger: q(".dp-right")[0], start: "top 75%", end: "bottom 35%", scrub: 0.6 },
          })
          .fromTo(bloom, { s: 0.15 }, { s: 1, ease: "power1.inOut", onUpdate: applyBloom }, 0)
          .fromTo(outer, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.3 }, 0);
      });

      mm.add(MOTION_QUERIES.reduced, () => {
        gsap.set(outer, { opacity: 1, scale: 1 });
        gsap.set(inner, { scale: 1 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-label="Ivory and gold"
      className="relative grid overflow-hidden bg-black lg:h-svh lg:grid-cols-2"
    >
      <div className="dp-left relative z-[1] min-h-[70svh] lg:min-h-0">{left}</div>

      <div className="dp-right relative z-[1] aspect-[4/5] overflow-hidden [container-type:size] lg:aspect-auto">
        {/* Image layer in image coordinates, so the reveal stays on the jewellery at any panel shape */}
        <div
          className="dp-img absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `max(100cqw, ${aspect * 100}cqh)`, aspectRatio: String(aspect) }}
        >
          <div className="absolute inset-0 grayscale">{base}</div>
          <div
            className="dp-colour pointer-events-none absolute inset-0 opacity-0"
            style={{ transformOrigin: origin, maskImage: mask, WebkitMaskImage: mask }}
          >
            <div className="dp-colour-inner absolute inset-0" style={{ transformOrigin: origin }}>
              {colour}
            </div>
          </div>
        </div>
      </div>

      {/* Seam, revealed as the panels part */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-0 lg:block">
        <span className="dp-seam-line absolute top-[10%] bottom-[64%] left-0 w-px origin-top bg-gold" />
        <span className="dp-seam-line absolute top-[64%] bottom-[10%] left-0 w-px origin-bottom bg-gold" />
        <span className="dp-seam-text mono absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-gold-light opacity-0 [writing-mode:vertical-rl]">
          {seam}
        </span>
      </div>
    </section>
  );
}
