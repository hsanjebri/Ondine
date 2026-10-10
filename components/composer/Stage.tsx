"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import cutouts from "@/data/cutouts.json";
import { getDesign, label, pieceName, type Config, type DesignId, type ShapeId } from "@/lib/composer-options";
import { stoneFilter } from "@/lib/metal-tone";
import { EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/cn";
import { Toned } from "./Toned";

interface Cutout {
  src: string;
  width: number;
  height: number;
  hotspots: number[][];
}

const CUT = cutouts as Record<string, Cutout>;

export interface PhotoCredit {
  name: string;
  profile: string;
  photo: string;
}

/** Girdle diameter of a round brilliant of this weight, in mm (≈ 6.5 mm at 1 ct). */
export const stoneDiameter = (carat: number) => 6.5 * Math.cbrt(carat);

const SHADOW = "drop-shadow(0 26px 28px rgb(0 0 0 / 0.55)) drop-shadow(0 4px 6px rgb(0 0 0 / 0.4))";

/**
 * The photo stage: the chosen piece, cut out of its photograph, floating on
 * velvet under a spotlight. Pointer tilt, a light sheen that follows the
 * pointer across the metal, sparkles on the brightest facets, a soft
 * reflection, and a "look closer" zoom. The loose stone is shown to scale.
 */
export function Stage({
  config,
  credits,
  interactive = true,
  className,
}: {
  config: Config;
  credits?: Partial<Record<DesignId | "stones", PhotoCredit>>;
  interactive?: boolean;
  className?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const design = getDesign(config.design);
  const cut = CUT[config.design];
  const aspect = cut.width / cut.height;
  // A glass-floor reflection suits pieces that lie flat; pendants and earrings hang.
  const reflect = config.piece === "ring" || config.piece === "bracelet";
  const credit = credits?.[config.design];

  // Pointer → CSS variables (tilt, sheen, zoom origin), eased in rAF; no React re-renders.
  useEffect(() => {
    const el = stage.current;
    if (!el || !interactive) return;
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches || prefersReducedMotion()) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const tick = () => {
      x += (tx - x) * 0.1;
      y += (ty - y) * 0.1;
      el.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
      el.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
      el.style.setProperty("--lx", `${(50 + x * 110).toFixed(1)}%`);
      el.style.setProperty("--ly", `${(40 + y * 90).toFixed(1)}%`);
      el.style.setProperty("--ox", `${(50 + x * 100).toFixed(1)}%`);
      el.style.setProperty("--oy", `${(50 + y * 100).toFixed(1)}%`);
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = Math.max(-0.5, Math.min(0.5, (e.clientX - r.left) / r.width - 0.5));
      ty = Math.max(-0.5, Math.min(0.5, (e.clientY - r.top) / r.height - 0.5));
      start();
    };
    const leave = () => {
      tx = 0;
      ty = 0;
      start();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [interactive]);

  return (
    <div
      ref={stage}
      className={cn(
        "stage relative h-full w-full overflow-hidden bg-[radial-gradient(120%_90%_at_50%_42%,#2a231e_0%,#14110f_45%,#0b0a09_80%)] [container-type:size]",
        className,
      )}
    >
      {/* Spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(42%_36%_at_50%_44%,rgb(246_241_234/0.13),transparent_70%)]"
      />

      {/* The piece */}
      <div className="absolute inset-x-0 top-[6%] bottom-[16%] flex items-center justify-center [perspective:1400px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={config.design}
            initial={{ opacity: 0, y: 36, scale: 0.94, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -24, scale: 1.04, filter: "blur(8px)" }}
            transition={{ duration: 0.85, ease: EASE }}
            className="relative"
            style={{ width: `min(72cqw, ${(66 * aspect).toFixed(2)}cqh)`, aspectRatio: `${cut.width} / ${cut.height}` }}
          >
            {/* Floor: contact shadow + reflection */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-[96%] left-[12%] h-[14%] w-[76%] rounded-[50%] bg-black/70 blur-2xl"
            />
            {reflect ? (
              <div
                aria-hidden
                className="pointer-events-none absolute top-full left-0 h-full w-full -scale-y-100 opacity-25 [mask-image:linear-gradient(to_bottom,transparent_62%,#000)]"
              >
                <Toned design={config.design} metal={config.metal} />
              </div>
            ) : null}

            <div className="stage-float absolute inset-0">
              <div
                className="absolute inset-0 transition-transform duration-[900ms] ease-ondine [transform-style:preserve-3d]"
                style={{ transform: zoom ? "none" : "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))" }}
              >
                <div
                  className="absolute inset-0 transition-transform duration-[900ms] ease-ondine"
                  style={{
                    transform: zoom ? "scale(2.2)" : "scale(1)",
                    transformOrigin: "var(--ox, 50%) var(--oy, 50%)",
                  }}
                >
                  <div className="absolute inset-0" style={{ filter: SHADOW }} data-fly-source={interactive ? "stage" : undefined}>
                    <Toned
                      design={config.design}
                      metal={config.metal}
                      alt={`${pieceName(config)} in ${label.metal(config.metal).toLowerCase()}`}
                    />
                  </div>
                  {/* Light sheen, clipped to the piece itself */}
                  <span
                    aria-hidden
                    className="stage-sheen pointer-events-none absolute inset-0"
                    style={{ maskImage: `url(${cut.src})`, WebkitMaskImage: `url(${cut.src})` } as CSSProperties}
                  />
                  {/* Sparkles on the brightest facets */}
                  {cut.hotspots.slice(0, design.stone === "none" ? 4 : 9).map(([hx, hy], i) => (
                    <span
                      key={i}
                      aria-hidden
                      className="stage-glint"
                      style={{ left: `${hx * 100}%`, top: `${hy * 100}%`, animationDelay: `${(i * 0.73) % 3.4}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {design.stone !== "none" ? <StoneInset config={config} compact={!interactive} /> : null}

      {interactive ? (
        <button
          type="button"
          onClick={() => setZoom((z) => !z)}
          aria-pressed={zoom}
          className="micro link-line absolute top-[calc(var(--header-h)+2.75rem)] right-gutter z-[6] hidden text-ivory/70 hover:text-ivory [@media(hover:hover)_and_(pointer:fine)]:inline-block"
        >
          {zoom ? "Step back" : "Look closer"}
        </button>
      ) : null}

      {credit ? (
        <p className="mono absolute bottom-3 left-gutter z-[6] text-[0.6rem] text-ivory/45">
          photo{" "}
          <a href={credit.profile} target="_blank" rel="noopener noreferrer" className="link-line hover:text-ivory">
            {credit.name}
          </a>{" "}
          /{" "}
          <a href={credit.photo} target="_blank" rel="noopener noreferrer" className="link-line hover:text-ivory">
            unsplash
          </a>
          , background removed
        </p>
      ) : null}
    </div>
  );
}

/** The loose stone, drawn to scale against a 10 mm rule. */
function StoneInset({ config, compact }: { config: Config; compact: boolean }) {
  const design = getDesign(config.design);
  const line = design.stone === "line";
  const shape: ShapeId = line ? "round" : config.shape;
  const cut = CUT[`stone-${shape}`];
  const aspect = cut.width / cut.height;
  // One stone of a line weighs a few points; show three small brilliants instead.
  const d = line ? 2.4 : stoneDiameter(config.carat);
  const caption = line
    ? `${config.carat.toFixed(2)} ct in total`
    : `${config.carat.toFixed(2)} ct${config.piece === "earrings" ? " each" : ""} · ${d.toFixed(1)} mm`;

  return (
    <div
      className={cn(
        "absolute z-[6] flex flex-col items-center gap-2 text-ivory",
        compact
          ? "right-3 bottom-3 [--mm:5px]"
          : "top-[calc(var(--header-h)+2.25rem)] right-gutter [--mm:5px] md:top-auto md:bottom-12 md:[--mm:8px] lg:bottom-24",
      )}
    >
      <div className="flex h-[calc(var(--mm)*10)] items-end justify-center gap-[calc(var(--mm)*0.6)]">
        {(line ? [0, 1, 2] : [0]).map((k) => (
          <motion.img
            key={`${shape}-${k}`}
            src={cut.src}
            alt=""
            draggable={false}
            initial={false}
            animate={{
              width: `calc(var(--mm) * ${(d * Math.sqrt(aspect)).toFixed(3)})`,
              height: `calc(var(--mm) * ${(d / Math.sqrt(aspect)).toFixed(3)})`,
            }}
            transition={{ duration: 0.6, ease: EASE }}
            className="object-contain"
            style={{ filter: `${stoneFilter(config.colour)} drop-shadow(0 4px 6px rgb(0 0 0 / 0.6))` }}
          />
        ))}
      </div>
      <span aria-hidden className="relative block h-1.5 w-[calc(var(--mm)*10)] border-x border-b border-ivory/40">
        <span className="absolute bottom-0 left-1/2 h-1 w-px -translate-x-1/2 bg-ivory/40" />
      </span>
      {compact ? null : (
        <p className="mono text-center text-[0.6rem] leading-tight text-ivory/70 md:hidden">
          {config.carat.toFixed(2)} ct
        </p>
      )}
      {compact ? null : (
        <p className="mono hidden text-center text-[0.6rem] leading-tight text-ivory/70 md:block">
          {line ? "round brilliants" : `your ${label.shape(shape).toLowerCase()}`}
          <br />
          {caption}
          <br />
          <span className="text-ivory/45">rule: 10 mm</span>
        </p>
      )}
    </div>
  );
}
