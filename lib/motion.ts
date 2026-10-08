/** The one ease used everywhere: cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";
/** Registered with GSAP's CustomEase in lib/gsap.ts */
export const GSAP_EASE = "ondine";

export const DURATION = {
  hover: 0.3,
  reveal: 1,
  revealLong: 1.2,
  revealShort: 0.6,
} as const;
