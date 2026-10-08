"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap, SplitText, useGSAP, MOTION_QUERIES } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/hooks";
import { site } from "@/lib/site";
import { useUI } from "@/store/ui";
import { CornerFrame } from "@/components/media/CornerFrame";

const DURATION = 8; // seconds — one full turn of the turntable, loops seamlessly

/**
 * 01 — Hero, variant A. Full-bleed film of a ring turning under raking light,
 * framed by four mono corner labels, with the widely spaced wordmark. The
 * poster is the LCP image; the film only starts once the preloader has lifted.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const preloaderDone = useUI((s) => s.preloaderDone);
  const [filmReady, setFilmReady] = useState(false);

  // Film: start after the curtain lifts. Reduced motion: no autoplay.
  useEffect(() => {
    const v = video.current;
    if (!v || !preloaderDone || prefersReducedMotion()) return;
    v.play().catch(() => undefined);
  }, [preloaderDone]);

  const toggleFilm = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) void v.play().catch(() => undefined);
    else v.pause();
  };

  const replayFilm = () => {
    const v = video.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => undefined);
  };

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const mm = gsap.matchMedia();

      mm.add(MOTION_QUERIES.motion, () => {
        const word = q(".hero-word")[0] as HTMLElement;
        const split = SplitText.create(word, { type: "chars", charsClass: "hero-char" });
        gsap.set(split.chars, { autoAlpha: 0 });
        gsap.set([q(".hero-sub"), q(".hero-years"), q(".hero-chrome")], { autoAlpha: 0 });
        gsap.set(q(".hero-script"), { clipPath: "inset(-20% 100% -20% 0%)" });
        gsap.set(q(".hero-rule"), { scaleX: 0 });

        let intro: gsap.core.Timeline | null = null;
        const play = () => {
          if (intro) return;
          // Letter-spacing "tight → wide" with transforms only: every letter
          // starts pulled toward the centre and drifts out to its place.
          // Measured now, after the fonts have loaded.
          const box = word.getBoundingClientRect();
          const centre = box.left + box.width / 2;
          const offsets = split.chars.map((c) => {
            const r = c.getBoundingClientRect();
            return centre - (r.left + r.width / 2);
          });
          intro = gsap
            .timeline()
            .fromTo(
              split.chars,
              { x: (i) => offsets[i] * 0.72, autoAlpha: 0 },
              { x: 0, autoAlpha: 1, duration: 2.1, stagger: { each: 0.02, from: "center" } },
            )
            .fromTo(q(".hero-media"), { scale: 1.08 }, { scale: 1, duration: 2.8 }, 0)
            .fromTo(q(".hero-sub"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1.1 }, 0.7)
            .to(q(".hero-script"), { clipPath: "inset(-20% 0% -20% 0%)", duration: 1.6, ease: "power2.inOut" }, 0.95)
            .to(q(".hero-years"), { autoAlpha: 1, duration: 1, stagger: 0.1 }, 1.2)
            .to(q(".hero-rule"), { scaleX: 1, duration: 1.1, stagger: 0.1 }, 1.15)
            .to(q(".hero-chrome"), { autoAlpha: 1, duration: 1, stagger: 0.08 }, 1.3);
        };

        // Slow push-in while the hero scrolls away; the type lifts and fades.
        const scroll = gsap
          .timeline({
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          })
          .to(q(".hero-push"), { scale: 1.18, yPercent: 6, ease: "none" }, 0)
          .to(q(".hero-centre"), { yPercent: -40, autoAlpha: 0, ease: "none" }, 0)
          .to(q(".hero-shade"), { opacity: 1, ease: "none" }, 0);

        if (useUI.getState().preloaderDone) play();
        const unsub = useUI.subscribe((s) => {
          if (s.preloaderDone) play();
        });

        return () => {
          unsub();
          intro?.kill();
          scroll.kill();
          split.revert();
        };
      });

      mm.add(MOTION_QUERIES.reduced, () => {
        gsap.fromTo(q(".hero-fade"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "none" });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="top"
      aria-label="Introduction"
      className="theme-ink relative h-svh min-h-[34rem] overflow-hidden bg-black text-ivory"
    >
      {/* Media */}
      <div className="hero-push absolute inset-0 will-change-transform">
        <div className="hero-media absolute inset-0">
          <Image
            src="/media/hero-poster.jpg"
            alt="An oval and an emerald-cut diamond ring turning on black glass under raking light"
            fill
            preload
            quality={75}
            sizes="100vw"
            data-critical
            className="object-cover object-[50%_40%]"
          />
          <video
            ref={video}
            className="absolute inset-0 h-full w-full object-cover object-[50%_40%] transition-opacity duration-[1200ms] ease-ondine"
            style={{ opacity: filmReady ? 1 : 0 }}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            tabIndex={-1}
            onPlaying={() => setFilmReady(true)}
          >
            <source src="/media/hero-960.webm" type="video/webm" media="(max-width: 767px)" />
            <source src="/media/hero-960.mp4" type="video/mp4" media="(max-width: 767px)" />
            <source src="/media/hero-1440.webm" type="video/webm" />
            <source src="/media/hero-1440.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* Shade for legibility; deepens as the hero scrolls away */}
      <div
        aria-hidden
        className="hero-shade pointer-events-none absolute inset-0 bg-[radial-gradient(120%_85%_at_50%_45%,rgb(11_10_9/0.1)_25%,rgb(11_10_9/0.7)_100%)] opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent"
      />
      {/* Soft scrim behind the wordmark: the film is brightest at the centre */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(38%_26%_at_50%_50%,rgb(11_10_9/0.62)_0%,rgb(11_10_9/0.35)_55%,rgb(11_10_9/0)_100%)] md:bg-[radial-gradient(30%_24%_at_50%_50%,rgb(11_10_9/0.62)_0%,rgb(11_10_9/0.35)_55%,rgb(11_10_9/0)_100%)]"
      />

      <CornerFrame
        belowHeader
        className="hero-chrome hero-fade"
        tl="fine jewellery"
        tr="2026"
        bl="atelier saint-honoré"
        br="pl. 01"
      />

      {/* Centre: spaced wordmark */}
      <div className="hero-centre hero-fade absolute inset-0 flex flex-col items-center justify-center px-gutter text-center">
        <h1 className="sr-only">
          {site.name} — {site.tagline}
        </h1>
        <p
          aria-hidden
          className="hero-word mr-[-0.5em] font-serif text-[clamp(1.35rem,3.6vw,3.1rem)] font-light uppercase leading-none tracking-[0.5em] text-ivory"
        >
          Maison Ondine
        </p>
        <p aria-hidden className="hero-sub mono mt-6 text-ivory/75 md:mt-8">
          fine jewellery
        </p>
        <p aria-hidden className="mt-7 flex items-center gap-4 md:mt-9 md:gap-6">
          <span className="hero-years mono text-ivory/70">09</span>
          <span className="hero-rule h-px w-8 origin-right bg-ivory/40 md:w-14" />
          <span className="hero-script px-2 font-script text-[clamp(2.8rem,5.4vw,4.6rem)] leading-[0.9] text-gold-light">
            Paris
          </span>
          <span className="hero-rule h-px w-8 origin-left bg-ivory/40 md:w-14" />
          <span className="hero-years mono text-ivory/70">26</span>
        </p>
      </div>

      {/* Bottom row: plate · scroll cue · timecode */}
      <div className="hero-chrome hero-fade absolute inset-x-0 bottom-14 grid grid-cols-[1fr_auto_1fr] items-end gap-4 px-gutter md:bottom-16">
        <p className="hidden items-baseline gap-3 text-ivory/80 sm:flex">
          <span className="micro shrink-0 text-ivory">Pl. 01 —</span>
          <span className="text-[0.8125rem] leading-snug">Oval and emerald cut, 18k gold and platinum</span>
        </p>
        <div className="col-start-2 flex flex-col items-center gap-3" aria-hidden>
          <span className="mono text-ivory/60">scroll</span>
          <span className="relative block h-14 w-px overflow-hidden bg-ivory/20">
            <span className="hero-cue absolute inset-0 bg-ivory" />
          </span>
        </div>
        <FilmControls video={video} onToggle={toggleFilm} onReplay={replayFilm} />
      </div>
    </section>
  );
}

function timecode(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Timecode + Pause/Play + Replay. Isolated so time updates don't re-render the hero. */
function FilmControls({
  video,
  onToggle,
  onReplay,
}: {
  video: RefObject<HTMLVideoElement | null>;
  onToggle: () => void;
  onReplay: () => void;
}) {
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("playing", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("playing", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [video]);

  return (
    <div className="col-start-3 flex items-center justify-end gap-5">
      <span className="mono tabular hidden text-ivory/80 sm:inline" aria-hidden>
        {timecode(time)} / {timecode(DURATION)}
      </span>
      <button type="button" onClick={onToggle} className="micro link-line text-ivory">
        {playing ? "Pause" : "Play"}
        <span className="sr-only"> the film</span>
      </button>
      <button type="button" onClick={onReplay} className="micro link-line text-ivory">
        Replay
        <span className="sr-only"> the film</span>
      </button>
    </div>
  );
}
