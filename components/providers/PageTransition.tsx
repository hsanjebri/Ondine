"use client";

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { animate } from "framer-motion";
import { ScrollTrigger } from "@/lib/gsap";
import { EASE } from "@/lib/motion";
import { prefersReducedMotion } from "@/lib/hooks";
import { useUI } from "@/store/ui";
import { lockScroll, scrollToTop } from "./SmoothScroll";
import { MONOGRAM_PATH } from "@/components/ui/Monogram";

type Navigate = (href: string) => void;

const TransitionContext = createContext<Navigate | null>(null);

export function usePageTransition(): Navigate {
  const navigate = useContext(TransitionContext);
  if (!navigate) throw new Error("usePageTransition must be used inside <PageTransition>");
  return navigate;
}

/**
 * Route transition: an ivory panel wipes up over the page, the monogram
 * flashes, the next route renders underneath, then the panel continues up
 * and away. Triggered by <TransitionLink>; back/forward stay instant.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const layer = useRef<HTMLDivElement>(null);
  const arrival = useRef<{ path: string; resolve: () => void } | null>(null);
  const busy = useRef(false);
  const setTransitioning = useUI((s) => s.setTransitioning);

  useEffect(() => {
    if (arrival.current && arrival.current.path === pathname) {
      arrival.current.resolve();
      arrival.current = null;
    }
  }, [pathname]);

  const navigate = useCallback<Navigate>(
    async (href) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.assign(href);
        return;
      }

      // Same page: just glide to the anchor (or the top).
      if (url.pathname === window.location.pathname) {
        if (url.search !== window.location.search) router.push(href, { scroll: false });
        scrollToTarget(url.hash, true);
        return;
      }

      const root = layer.current;
      if (busy.current || !root) return;
      busy.current = true;
      setTransitioning(true);
      useUI.getState().setMenuOpen(false);

      const panel = root.querySelector<HTMLElement>(".pt-panel")!;
      const mono = root.querySelector<SVGPathElement>(".pt-mono path")!;
      const reduced = prefersReducedMotion();

      root.style.visibility = "visible";
      root.style.pointerEvents = "auto";
      lockScroll(true);

      // 1 — cover
      if (reduced) {
        await animate(panel, { opacity: [0, 1], y: "0%" }, { duration: 0.25, ease: "linear" });
      } else {
        await Promise.all([
          animate(panel, { y: ["100%", "0%"] }, { duration: 0.75, ease: EASE }),
          animate(mono, { strokeDashoffset: [1, 0], opacity: [0, 1] }, { duration: 0.7, delay: 0.25, ease: EASE }),
        ]);
      }

      // 2 — swap routes behind the panel
      const arrived = new Promise<void>((resolve) => {
        arrival.current = { path: url.pathname, resolve };
      });
      router.push(url.pathname + url.search + url.hash, { scroll: false });
      await Promise.race([arrived, wait(5000)]);
      await nextFrame();
      await nextFrame();
      scrollToTop();
      ScrollTrigger.refresh();
      lockScroll(false);
      if (url.hash) scrollToTarget(url.hash, false);

      // 3 — reveal
      if (reduced) {
        await animate(panel, { opacity: 0 }, { duration: 0.25, ease: "linear" });
      } else {
        await Promise.all([
          animate(mono, { opacity: 0 }, { duration: 0.3, ease: EASE }),
          animate(panel, { y: "-100%" }, { duration: 0.85, delay: 0.1, ease: EASE }),
        ]);
      }

      animate(panel, { y: "100%", opacity: 1 }, { duration: 0 });
      root.style.visibility = "hidden";
      root.style.pointerEvents = "none";
      setTransitioning(false);
      busy.current = false;
    },
    [router, setTransitioning],
  );

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <div
        ref={layer}
        aria-hidden
        className="pointer-events-none invisible fixed inset-0 z-[140]"
      >
        <div
          className="pt-panel paper absolute inset-0 flex items-center justify-center"
          style={{ transform: "translateY(100%)" }}
        >
          <svg
            viewBox="0 0 64 74"
            className="pt-mono h-16 w-auto text-gold-deep"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.1}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d={MONOGRAM_PATH}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1}
            />
          </svg>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}

function scrollToTarget(hash: string, smooth: boolean) {
  const { lenis } = useUI.getState();
  const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  if (hash && !target) return;
  if (lenis) {
    lenis.scrollTo(target ?? 0, smooth ? { duration: 1.6 } : { immediate: true, force: true });
  } else if (target) {
    target.scrollIntoView({ behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
  } else {
    window.scrollTo({ top: 0, behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto" });
  }
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function nextFrame() {
  return new Promise((r) => requestAnimationFrame(() => r(null)));
}
