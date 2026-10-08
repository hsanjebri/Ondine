"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_QUERIES } from "@/lib/gsap";

export interface CollectionPanel {
  id: string;
  image: ReactNode;
  plate: ReactNode;
  body: ReactNode;
}

/**
 * Desktop: the image column is sticky; each collection's text scrolls past
 * on the right and wipes its photograph in over the previous one
 * (clip-path, scrubbed). Mobile: image and text stacked per collection.
 */
export function CollectionsScene({ panels }: { panels: CollectionPanel[] }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(
        { desktop: MOTION_QUERIES.desktop, reduced: MOTION_QUERIES.reduced },
        (ctx) => {
          const { desktop, reduced } = ctx.conditions as { desktop: boolean; reduced: boolean };
          if (!desktop) return;
          const el = root.current!;
          const layers = q(".cs-layer");
          const plates = q(".cs-plate");
          const items = q(".cs-item");
          el.classList.add("cs-live");

          if (!reduced) {
            layers.forEach((layer, i) => {
              if (i === 0) return;
              gsap
                .timeline({
                  scrollTrigger: { trigger: items[i], start: "top 82%", end: "top 30%", scrub: 0.6 },
                })
                .fromTo(layer, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
                .fromTo(layer.querySelector(".cs-zoom"), { scale: 1.18 }, { scale: 1, ease: "none" }, 0)
                .to(layers[i - 1].querySelector(".cs-zoom"), { scale: 1.06, yPercent: -4, ease: "none" }, 0);
            });
          }

          const setActive = (index: number) => {
            items.forEach((n, i) => n.classList.toggle("is-active", i === index));
            plates.forEach((n, i) => n.classList.toggle("is-active", i === index));
            // Reduced motion: a simple crossfade between photographs.
            if (reduced) layers.forEach((n, i) => gsap.to(n, { autoAlpha: i <= index ? 1 : 0, duration: 0.5, ease: "none" }));
          };
          setActive(0);
          const triggers = items.map((n, i) =>
            ScrollTrigger.create({
              trigger: n,
              start: "top 60%",
              end: "bottom 60%",
              onToggle: (self) => self.isActive && setActive(i),
            }),
          );
          return () => {
            el.classList.remove("cs-live");
            triggers.forEach((t) => t.kill());
          };
        },
      );

      mm.add(`${MOTION_QUERIES.motion} and (max-width: 1023px)`, () => {
        q(".cs-mobile-media").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(18% 8% 18% 8%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: { trigger: el, start: "top 95%", end: "top 40%", scrub: 0.6 },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root}>
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-x-[clamp(0.75rem,1.6vw,1.75rem)]">
        <div className="col-span-6">
          <div className="sticky top-0 flex h-svh flex-col justify-center py-[calc(var(--header-h)+1rem)]">
            <div className="relative min-h-0 flex-1 overflow-hidden">
              {panels.map((p, i) => (
                <div key={p.id} className="cs-layer absolute inset-0 overflow-hidden" style={{ zIndex: i + 1 }}>
                  <div className="cs-zoom absolute inset-0 will-change-transform">{p.image}</div>
                </div>
              ))}
            </div>
            <div className="relative mt-4 h-5">
              {panels.map((p) => (
                <div key={p.id} className="cs-plate absolute inset-0">
                  {p.plate}
                </div>
              ))}
            </div>
          </div>
        </div>
        <ol className="col-span-5 col-start-8">
          {panels.map((p) => (
            <li key={p.id} className="cs-item flex min-h-[88svh] items-center py-16 first:min-h-[70svh] first:items-start first:pt-[24svh]">
              {p.body}
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile & tablet */}
      <ol className="space-y-24 lg:hidden">
        {panels.map((p) => (
          <li key={p.id}>
            <figure>
              <div className="cs-mobile-media relative aspect-[3/4] overflow-hidden">{p.image}</div>
              <div className="mt-3">{p.plate}</div>
            </figure>
            <div className="mt-8">{p.body}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
