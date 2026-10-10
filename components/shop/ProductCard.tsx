"use client";

import { useState } from "react";
import { METALS, type MetalId } from "@/lib/composer-options";
import { formatEuro } from "@/lib/format";
import { cn } from "@/lib/cn";
import { TAG_LABEL, priceFor, type Product } from "@/data/products";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { PieceTile } from "./PieceTile";

/**
 * A catalogue card. The metal dots re-tone the photograph on hover or tap,
 * and the price follows; the card links to the piece in that metal.
 */
export function ProductCard({
  product,
  dark = false,
  index,
  preferredMetal,
}: {
  product: Product;
  dark?: boolean;
  index?: number;
  /** Show the piece in this metal when it is made in it (catalogue metal filter) */
  preferredMetal?: MetalId;
}) {
  const initial = preferredMetal && product.metals?.includes(preferredMetal) ? preferredMetal : (product.metals?.[0] ?? null);
  const [metal, setMetal] = useState<MetalId | null>(initial);
  const [lastInitial, setLastInitial] = useState(initial);
  if (initial !== lastInitial) {
    setLastInitial(initial);
    setMetal(initial);
  }
  const href = `/jewellery/${product.slug}${metal && product.metals && metal !== product.metals[0] ? `?metal=${metal}` : ""}`;
  const tag = product.tags?.[0];
  const several = (product.metals?.length ?? 0) > 1;

  return (
    <article className="group/card relative">
      <TransitionLink href={href} prefetch={false} className="block" aria-label={`${product.name}, ${product.type}`}>
        <div className="relative aspect-[4/5] overflow-hidden">
          <PieceTile
            cutout={product.cutout}
            metal={metal}
            dark={dark}
            alt={`${product.name}, ${product.type.toLowerCase()}`}
            pieceClassName="transition-transform duration-[1100ms] ease-ondine group-hover/card:scale-[1.07] group-hover/card:-translate-y-[2%]"
          />
          {tag ? (
            <span className={cn("mono absolute top-3 left-3 z-[2]", dark ? "text-ivory/80" : "text-ink/70")}>
              {TAG_LABEL[tag].toLowerCase()}
            </span>
          ) : null}
          {index !== undefined ? (
            <span className={cn("mono absolute top-3 right-3 z-[2]", dark ? "text-ivory/50" : "text-ink/40")}>
              pl. {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
        </div>
      </TransitionLink>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="smallcaps">
            <TransitionLink href={href} prefetch={false} className="hover:underline" tabIndex={-1}>
              {product.name}
            </TransitionLink>
          </h3>
          <p className={cn("mt-1 text-sm", dark ? "text-ivory/60" : "text-muted")}>{product.type}</p>
        </div>
        <p className="smallcaps tabular whitespace-nowrap">{formatEuro(priceFor(product, metal ?? undefined))}</p>
      </div>

      {product.metals && several ? (
        <div role="group" aria-label={`${product.name}: metal`} className="mt-3 flex items-center gap-2">
          {product.metals.map((m) => {
            const info = METALS.find((x) => x.id === m)!;
            const on = m === metal;
            return (
              <button
                key={m}
                type="button"
                aria-pressed={on}
                aria-label={info.label}
                title={info.label}
                onClick={() => setMetal(m)}
                onPointerEnter={(e) => e.pointerType === "mouse" && setMetal(m)}
                className={cn(
                  "relative h-4 w-4 rounded-full transition-transform duration-300 ease-ondine hover:scale-110",
                  on ? (dark ? "ring-1 ring-ivory ring-offset-2 ring-offset-black" : "ring-1 ring-ink ring-offset-2 ring-offset-ivory") : "",
                )}
                style={{ background: info.swatch }}
              />
            );
          })}
        </div>
      ) : (
        <p className={cn("mono mt-3", dark ? "text-ivory/50" : "text-muted")}>{product.fixedMetal?.toLowerCase()}</p>
      )}
    </article>
  );
}
