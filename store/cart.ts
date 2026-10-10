"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MetalId } from "@/lib/composer-options";

export interface CartItem {
  /** Product slug, or `composed-<hash>` for a ring from the composer */
  key: string;
  name: string;
  price: number;
  quantity: number;
  /** Short spec line, e.g. "18k yellow gold · 0.5 ct · size 52" */
  detail?: string;
  image?: string;
  /** Cut-out shown as the thumbnail (key of data/cutouts.json), re-toned to `metal` */
  cutout?: string;
  metal?: MetalId | null;
  /** Product page or composer link */
  href?: string;
}

interface CartState {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.key === item.key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === item.key ? { ...i, quantity: i.quantity + quantity } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, quantity }] };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items:
            quantity <= 0
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ondine-bag",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      version: 1,
    },
  ),
);

export const cartCount = (s: CartState) => s.items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (s: CartState) =>
  s.items.reduce((n, i) => n + i.price * i.quantity, 0);
