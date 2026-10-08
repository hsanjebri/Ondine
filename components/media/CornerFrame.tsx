import { cn } from "@/lib/cn";

interface CornerFrameProps {
  tl?: string;
  tr?: string;
  bl?: string;
  br?: string;
  /** Full-viewport sections under the fixed header: drop the top labels below it. */
  belowHeader?: boolean;
  className?: string;
}

/**
 * Four-corner mono micro-labels framing a full-bleed image:
 * "fine jewellery" · "2026" · "atelier saint-honoré" · "pl. 04".
 */
export function CornerFrame({
  tl = "fine jewellery",
  tr = "2026",
  bl = "atelier saint-honoré",
  br,
  belowHeader = false,
  className,
}: CornerFrameProps) {
  const pos = "mono pointer-events-none absolute z-[5]";
  // Full-viewport frames align with the header gutter; in-image frames sit tighter.
  const top = belowHeader ? "top-[calc(var(--header-h)+0.25rem)]" : "top-4 md:top-5";
  const left = belowHeader ? "left-gutter" : "left-4 md:left-6";
  const right = belowHeader ? "right-gutter" : "right-4 md:right-6";
  const bottom = belowHeader ? "bottom-6" : "bottom-4 md:bottom-5";
  return (
    <div aria-hidden className={cn("absolute inset-0 text-ivory/80", className)}>
      <span className={cn(pos, top, left)}>{tl}</span>
      <span className={cn(pos, top, right)}>{tr}</span>
      <span className={cn(pos, bottom, left)}>{bl}</span>
      {br ? <span className={cn(pos, bottom, right)}>{br}</span> : null}
    </div>
  );
}
