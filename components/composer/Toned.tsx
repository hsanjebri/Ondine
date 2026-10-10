"use client";

/* eslint-disable @next/next/no-img-element -- transparent cut-outs, already sized and compressed */
import type { CSSProperties } from "react";
import cutouts from "@/data/cutouts.json";
import type { MetalId } from "@/lib/composer-options";
import { metalTone } from "@/lib/metal-tone";
import { cn } from "@/lib/cn";

const CUT = cutouts as Record<string, { src: string; width: number; height: number }>;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * A cut-out piece in the chosen metal: the photograph, plus a re-toned copy
 * drawn only where the metal is. Fills its (positioned) parent.
 * `metal = null` shows the photograph as taken (pieces in a fixed mix of golds).
 */
export function Toned({
  design,
  metal,
  alt = "",
  className,
  loading,
}: {
  /** Key of data/cutouts.json (composer design or catalogue piece) */
  design: string;
  metal: MetalId | null;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const cut = CUT[design];
  const tone = metalTone(design, metal);
  const mask = tone.mask ? `url(${tone.mask})` : undefined;
  return (
    <span className={cn("absolute inset-0 block", className)}>
      <img
        src={cut.src}
        width={cut.width}
        height={cut.height}
        alt={alt}
        loading={loading}
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-contain"
      />
      {mask ? (
        <img
          src={cut.src}
          alt=""
          aria-hidden
          loading={loading}
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-contain"
          style={
            {
              filter: tone.filter,
              opacity: tone.active ? 1 : 0,
              maskImage: mask,
              WebkitMaskImage: mask,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              transition: `opacity 0.7s ${EASE}, filter 0.7s ${EASE}`,
            } as CSSProperties
          }
        />
      ) : null}
    </span>
  );
}
