import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { pad } from "@/lib/format";

/** Plate caption under an image: "PL. 03 — Solitaire, 18k yellow gold". */
export function Plate({
  n,
  children,
  className,
}: {
  n: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figcaption className={cn("mt-3 flex items-baseline gap-3 text-muted", className)}>
      <span className="micro shrink-0 text-fg">Pl. {pad(n)} —</span>
      <span className="text-[0.8125rem] leading-snug">{children}</span>
    </figcaption>
  );
}
