"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/site";
import { cn } from "@/lib/cn";
import { useUI } from "@/store/ui";
import { useCart, cartCount } from "@/store/cart";
import { Monogram } from "@/components/ui/Monogram";
import { TransitionLink } from "@/components/ui/TransitionLink";

/**
 * Fixed header in `mix-blend-mode: difference`, so one ivory colour reads
 * on the black hero, ivory paper and photography alike. Slides away while
 * scrolling down, returns on the way up.
 */
export function Header() {
  const pathname = usePathname();
  const count = useCart(cartCount);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenuOpen = useUI((s) => s.setMenuOpen);
  const setBagOpen = useUI((s) => s.setBagOpen);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - last;
        if (Math.abs(delta) > 4) setHidden(delta > 0 && y > 160);
        last = y;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[60] text-ivory mix-blend-difference transition-transform duration-700 ease-ondine",
        hidden && !menuOpen && "-translate-y-full",
      )}
    >
      <div className="shell flex h-header items-center justify-between gap-6">
        <TransitionLink href="/" className="flex items-center gap-3" aria-label="Maison Ondine, home">
          <Monogram className="h-7 w-auto" />
          <span className="wordmark hidden text-[0.66rem] sm:inline">Maison Ondine</span>
        </TransitionLink>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {nav.map((item) => (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  className="micro link-line"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-6">
          <button type="button" className="micro link-line" onClick={() => setBagOpen(true)}>
            Bag <span className="tabular">({count})</span>
          </button>
          <button
            type="button"
            className="micro link-line lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
    </header>
  );
}
