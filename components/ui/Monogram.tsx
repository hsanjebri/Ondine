import type { SVGProps } from "react";

/**
 * The house monogram: an "O" drawn as one continuous fine line that rises
 * through a small opening at the top into a drop — a stone in its setting.
 * `pathLength={1}` lets CSS/GSAP draw it with stroke-dashoffset 1 → 0.
 */
export const MONOGRAM_PATH =
  "M28.5 21.35 A21 25 0 1 0 35.5 21.35 C33.4 19.3 26 17.4 26 13.2 C26 9.6 29.4 6.4 32 2 C34.6 6.4 38 9.6 38 13.2 C38 17.4 30.6 19.3 28.5 21.35";

export function Monogram({
  strokeWidth = 1,
  title,
  ...props
}: SVGProps<SVGSVGElement> & { strokeWidth?: number; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 74"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={MONOGRAM_PATH} pathLength={1} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
