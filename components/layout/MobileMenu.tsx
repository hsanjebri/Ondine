"use client";

import { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { nav, site } from "@/lib/site";
import { EASE } from "@/lib/motion";
import { pad } from "@/lib/format";
import { useDialog } from "@/lib/use-dialog";
import { useUI } from "@/store/ui";
import { TransitionLink } from "@/components/ui/TransitionLink";

export function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setMenuOpen(false), [setMenuOpen]);
  useDialog(open, close, ref);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={ref}
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="theme-ink ink-surface fixed inset-0 z-[55] flex flex-col justify-between px-gutter pt-[calc(var(--header-h)+2rem)] pb-8 lg:hidden"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <nav aria-label="Menu">
            <ul className="space-y-1">
              {nav.map((item, i) => (
                <li key={item.href} className="line-mask">
                  <motion.div
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "105%" }}
                    transition={{ duration: 0.9, ease: EASE, delay: 0.15 + i * 0.06 }}
                  >
                    <TransitionLink href={item.href} onNavigate={close} className="flex items-baseline gap-4 py-1">
                      <span className="mono text-gold">{pad(i + 1)}</span>
                      <span className="heading">{item.label}</span>
                    </TransitionLink>
                  </motion.div>
                </li>
              ))}
            </ul>
          </nav>
          <motion.div
            className="grid grid-cols-2 gap-6 border-t border-line pt-6 text-sm text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.6 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <p>
              {site.address.line}
              <br />
              <a href={site.phoneHref} className="link-line">
                {site.phone}
              </a>
            </p>
            <p>
              {site.hours.map((h) => (
                <span key={h.short} className="block">
                  {h.short} · {h.time}
                </span>
              ))}
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
