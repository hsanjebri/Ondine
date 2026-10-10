"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "./cart";

export type DeliveryMethod = "courier" | "boutique";
export type PaymentMethod = "link" | "transfer" | "boutique";

export interface Order {
  number: string;
  /** ISO date */
  placedAt: string;
  items: CartItem[];
  customer: { firstName: string; lastName: string; email: string; phone: string };
  delivery: {
    method: DeliveryMethod;
    address?: { line1: string; line2?: string; postcode: string; city: string; country: string };
  };
  gift: { wrap: boolean; message: string };
  payment: PaymentMethod;
  subtotal: number;
  total: number;
}

interface OrdersState {
  orders: Order[];
  addOrder: (o: Order) => void;
}

/**
 * Orders placed on this device. There is no back office behind this site:
 * an order is kept in the browser and shown on the confirmation page.
 */
export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders].slice(0, 20) })),
    }),
    { name: "ondine-orders", storage: createJSONStorage(() => localStorage), skipHydration: true, version: 1 },
  ),
);

/** e.g. "MO-261010-7K4Q" */
export function newOrderNumber(date = new Date()) {
  const d = date.toISOString().slice(2, 10).replace(/-/g, "");
  const r = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "0");
  return `MO-${d}-${r}`;
}
