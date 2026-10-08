"use client";

import { useEffect, type RefObject } from "react";
import { lockScroll } from "@/components/providers/SmoothScroll";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for drawers/overlays: scroll lock, Escape to close,
 * focus moved inside, Tab trapped, focus restored on close.
 */
export function useDialog(open: boolean, onClose: () => void, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll(true);

    const focusFirst = requestAnimationFrame(() => {
      const first =
        el?.querySelector<HTMLElement>("[data-autofocus]") ?? el?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus({ preventScroll: true });
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !el) return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (n) => n.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(focusFirst);
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      previous?.focus?.({ preventScroll: true });
    };
  }, [open, onClose, ref]);
}
