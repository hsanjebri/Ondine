"use client";

import type { CartItem } from "@/store/cart";
import { formatEuro } from "@/lib/format";
import { Toned } from "@/components/composer/Toned";

/** Order lines with thumbnails, used by the checkout summary and the confirmation. */
export function OrderLines({ items }: { items: CartItem[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.key} className="flex gap-4 py-4">
          <span className="relative block h-20 w-16 shrink-0 bg-[radial-gradient(90%_90%_at_50%_40%,#fdfbf7,#ece5da)] p-2">
            {item.cutout ? (
              <span className="relative block h-full w-full [filter:drop-shadow(0_4px_5px_rgb(20_17_15/0.25))]">
                <Toned design={item.cutout} metal={item.metal ?? null} />
              </span>
            ) : null}
            {item.quantity > 1 ? (
              <span className="mono absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.6rem] text-ivory">
                {item.quantity}
              </span>
            ) : null}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg leading-tight">{item.name}</p>
            {item.detail ? <p className="mt-1 text-xs leading-snug text-muted">{item.detail}</p> : null}
          </div>
          <p className="smallcaps tabular whitespace-nowrap text-sm">{formatEuro(item.price * item.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}
