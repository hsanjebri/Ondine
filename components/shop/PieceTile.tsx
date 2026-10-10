"use client";

import type { MetalId } from "@/lib/composer-options";
import { cn } from "@/lib/cn";
import { Toned } from "@/components/composer/Toned";

/**
 * A catalogue photograph: the cut-out piece, re-toned to `metal`, resting on
 * a softly lit tile with a contact shadow. Fills its positioned parent.
 */
export function PieceTile({
  cutout,
  metal,
  alt = "",
  dark = false,
  className,
  pieceClassName,
  flySource,
}: {
  cutout: string;
  metal: MetalId | null;
  alt?: string;
  dark?: boolean;
  className?: string;
  /** Extra classes on the piece (hover scale, zoom transforms…) */
  pieceClassName?: string;
  /** Marks the piece as the origin of the fly-to-bag animation */
  flySource?: string;
}) {
  return (
    <span
      className={cn(
        "absolute inset-0 block overflow-hidden",
        dark
          ? "bg-[radial-gradient(90%_80%_at_50%_42%,#2a231e,#14110f_60%,#0b0a09)]"
          : "bg-[radial-gradient(90%_80%_at_50%_40%,#fdfbf7,#efe9df_70%,#e6dfd3)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute bottom-[11%] left-1/2 h-[7%] w-[56%] -translate-x-1/2 rounded-[50%] blur-xl",
          dark ? "bg-black/70" : "bg-[#5b4a36]/25",
        )}
      />
      <span className={cn("absolute inset-[12%] block", pieceClassName)}>
        <span
          className="absolute inset-0 block"
          style={{ filter: dark ? "drop-shadow(0 14px 16px rgb(0 0 0 / 0.55))" : "drop-shadow(0 12px 14px rgb(60 45 30 / 0.22))" }}
          data-fly-source={flySource}
        >
          <Toned design={cutout} metal={metal} alt={alt} />
        </span>
      </span>
    </span>
  );
}
