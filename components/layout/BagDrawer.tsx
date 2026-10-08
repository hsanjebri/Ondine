"use client";

import { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/lib/motion";
import { formatEuro } from "@/lib/format";
import { useDialog } from "@/lib/use-dialog";
import { useUI } from "@/store/ui";
import { useCart, cartSubtotal } from "@/store/cart";
import { TransitionLink } from "@/components/ui/TransitionLink";

/** Bag drawer from the right. Items, quantity, subtotal, checkout. */
export function BagDrawer() {
  const open = useUI((s) => s.bagOpen);
  const setBagOpen = useUI((s) => s.setBagOpen);
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSubtotal);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setBagOpen(false), [setBagOpen]);
  useDialog(open, close, ref);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[120]">
          <motion.button
            type="button"
            aria-label="Close bag"
            tabIndex={-1}
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onClick={close}
          />
          <motion.aside
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            data-lenis-prevent
            className="paper absolute inset-y-0 right-0 flex w-full max-w-[28rem] flex-col"
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="flex h-header items-center justify-between border-b border-line px-6">
              <h2 id="bag-title" className="micro">
                Your bag <span className="tabular text-muted">({items.length})</span>
              </h2>
              <button type="button" className="micro link-line" onClick={close} data-autofocus>
                Close
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
                <p className="subheading">Your bag is empty.</p>
                <p className="text-muted">
                  Begin with a signature piece, or compose a ring of your own in the atelier.
                </p>
                <TransitionLink href="/composer" className="micro link-line" onNavigate={close}>
                  Compose your ring
                </TransitionLink>
              </div>
            ) : (
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-4 py-5">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xl leading-tight">{item.name}</p>
                      {item.detail ? <p className="mt-1 text-sm text-muted">{item.detail}</p> : null}
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center border border-line">
                          <button
                            type="button"
                            className="h-8 w-8"
                            aria-label={`Decrease quantity of ${item.name}`}
                            onClick={() => setQuantity(item.key, item.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="tabular w-6 text-center text-sm" aria-live="polite">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="h-8 w-8"
                            aria-label={`Increase quantity of ${item.name}`}
                            onClick={() => setQuantity(item.key, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button type="button" className="micro link-line text-muted" onClick={() => remove(item.key)}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="smallcaps tabular whitespace-nowrap">{formatEuro(item.price * item.quantity)}</p>
                  </li>
                ))}
              </ul>
            )}

            <div className="border-t border-line px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="micro">Subtotal</span>
                <span className="smallcaps tabular whitespace-nowrap text-base">{formatEuro(subtotal)}</span>
              </div>
              <p className="mt-2 text-xs text-muted">
                Complimentary delivery and engraving. Duties and taxes included.
              </p>
              {items.length ? (
                <TransitionLink
                  href="/checkout"
                  onNavigate={close}
                  className="micro mt-5 flex h-12 w-full items-center justify-center bg-ink text-ivory transition-colors duration-300 hover:bg-black"
                >
                  Checkout
                </TransitionLink>
              ) : (
                <span
                  aria-disabled="true"
                  className="micro mt-5 flex h-12 w-full items-center justify-center bg-ink/20 text-ink/50"
                >
                  Checkout
                </span>
              )}
            </div>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
