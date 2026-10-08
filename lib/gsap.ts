"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";
import { GSAP_EASE } from "./motion";

let registered = false;

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText, Draggable, InertiaPlugin, useGSAP);
  CustomEase.create(GSAP_EASE, "0.22, 1, 0.36, 1");
  gsap.defaults({ ease: GSAP_EASE, duration: 1 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

/** gsap.matchMedia conditions shared by every scene. */
export const MOTION_QUERIES = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 1024px)",
  fine: "(hover: hover) and (pointer: fine)",
} as const;

export { gsap, ScrollTrigger, SplitText, Draggable, InertiaPlugin, useGSAP };
