"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ENGRAVING_MAX, METALS, SIZES, type MetalId } from "@/lib/composer-options";
import { formatEuro } from "@/lib/format";
import { flyToBag } from "@/lib/fly-to-bag";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { prefersReducedMotion } from "@/lib/hooks";
import { priceFor, type Product } from "@/data/products";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { CountingPrice } from "@/components/composer/PriceBar";
import { PieceTile } from "./PieceTile";

const SIZE_FOR: Record<NonNullable<Product["sizes"]>, keyof typeof SIZES> = {
  ring: "ring",
  bracelet: "bracelet",
  necklace: "necklace",
};

/** Main image of the cut-out with a loupe that follows the pointer. */
function ZoomTile({ product, metal }: { product: Product; metal: MetalId | null }) {
  const box = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const move = (e: React.PointerEvent) => {
    const el = box.current;
    if (!el || e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--zx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--zy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };
  return (
    <div
      ref={box}
      className="relative aspect-[4/5] overflow-hidden lg:aspect-auto lg:h-full"
      data-cursor="view"
      onPointerMove={move}
      onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
      onPointerLeave={() => setZoom(false)}
    >
      <PieceTile
        cutout={product.cutout}
        metal={metal}
        alt={`${product.name}, ${product.type.toLowerCase()}`}
        flySource="product"
        pieceClassName={cn(
          "origin-[var(--zx,50%)_var(--zy,50%)] transition-transform duration-[700ms] ease-ondine",
          zoom && "scale-[1.9]",
        )}
      />
      <span className="mono pointer-events-none absolute bottom-4 left-4 hidden text-ink/45 [@media(hover:hover)_and_(pointer:fine)]:block">
        {zoom ? "move to look closer" : "hover to look closer"}
      </span>
    </div>
  );
}

/**
 * Product page body: gallery on the left, the piece and its choices on the
 * right (metal, size, engraving), add to bag, then the details.
 */
export function ProductView({
  product,
  gallery,
  credit,
}: {
  product: Product;
  /** Photographs rendered on the server (jewellery worn, the atelier) */
  gallery: ReactNode[];
  credit?: ReactNode;
}) {
  const sizeKind = product.sizes ? SIZE_FOR[product.sizes] : null;
  const sizes = sizeKind ? SIZES[sizeKind] : null;
  const [metal, setMetal] = useState<MetalId | null>(product.metals?.[0] ?? null);
  const [size, setSize] = useState<number | null>(sizes?.initial ?? null);
  const [engrave, setEngrave] = useState(false);
  const [engraving, setEngraving] = useState("");
  const [view, setView] = useState(0);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const setBagOpen = useUI((s) => s.setBagOpen);
  const ids = { size: useId(), engraving: useId() };
  const price = priceFor(product, metal ?? undefined);
  const metalLabel = metal ? METALS.find((m) => m.id === metal)!.label : (product.fixedMetal ?? "");

  // A link from the catalogue may carry ?metal=rose
  useEffect(() => {
    const m = new URLSearchParams(window.location.search).get("metal") as MetalId | null;
    if (m && product.metals?.includes(m)) {
      const id = requestAnimationFrame(() => setMetal(m));
      return () => cancelAnimationFrame(id);
    }
  }, [product.metals]);

  const chooseMetal = (m: MetalId) => {
    setMetal(m);
    setView(0);
    const p = new URLSearchParams(window.location.search);
    if (m === product.metals?.[0]) p.delete("metal");
    else p.set("metal", m);
    const q = p.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
  };

  const addToBag = async () => {
    if (adding) return;
    setAdding(true);
    setView(0);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await flyToBag(document.querySelector<HTMLElement>('[data-fly-source="product"]'));
    const text = engrave ? engraving.trim() : "";
    const detail = [
      metalLabel,
      product.stones,
      size !== null && sizes ? (sizeKind === "ring" ? `size ${size}` : `${size} cm`) : null,
      text ? `engraved “${text}”` : null,
    ]
      .filter(Boolean)
      .join(" · ");
    add({
      key: [product.slug, metal ?? "fixed", size ?? "-", text].join("|"),
      name: product.name,
      price,
      detail: `${product.type} · ${detail}`,
      cutout: product.cutout,
      metal,
      href: `/jewellery/${product.slug}${metal && metal !== product.metals?.[0] ? `?metal=${metal}` : ""}`,
    });
    setAdding(false);
    setAdded(true);
    window.setTimeout(() => setBagOpen(true), 750);
  };

  const views = [{ key: "piece", node: null as ReactNode }, ...gallery.map((node, i) => ({ key: `g${i}`, node }))];

  return (
    <div className="grid gap-x-[clamp(1rem,3vw,3rem)] gap-y-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(22rem,1fr)]">
      {/* Gallery */}
      <div className="lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:h-[calc(100svh-var(--header-h)-2rem)]">
        <div className="relative h-full overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={views[view].key}
              className="h-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              {view === 0 ? (
                <ZoomTile product={product} metal={metal} />
              ) : (
                <div className="relative aspect-[4/5] lg:aspect-auto lg:h-full">{views[view].node}</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Purchase */}
      <div className="lg:py-4">
        <div className="flex gap-2" role="group" aria-label="Photographs">
          {views.map((v, i) => (
            <button
              key={v.key}
              type="button"
              aria-pressed={view === i}
              aria-label={i === 0 ? "The piece" : `Photograph ${i}`}
              onClick={() => setView(i)}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden border transition-colors duration-300",
                view === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {i === 0 ? <PieceTile cutout={product.cutout} metal={metal} /> : <span className="pointer-events-none absolute inset-0">{v.node}</span>}
            </button>
          ))}
        </div>

        <h1 className="display mt-10 text-[clamp(2.8rem,5vw,4.6rem)]">{product.name}</h1>
        <p className="lead mt-3 text-muted">{product.type}</p>
        <p className="mt-6 font-serif text-[2rem] leading-none">
          <CountingPrice value={price} />
        </p>
        <p className="mono mt-2 text-muted">taxes included · complimentary delivery and engraving</p>

        {/* Metal */}
        <div className="mt-10">
          <p className="micro mb-3 flex justify-between text-muted">
            <span>Metal</span>
            <span className="normal-case tracking-normal text-fg">{metalLabel}</span>
          </p>
          {product.metals ? (
            <div role="radiogroup" aria-label="Metal" className="flex flex-wrap gap-3">
              {product.metals.map((m) => {
                const info = METALS.find((x) => x.id === m)!;
                const on = m === metal;
                return (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => chooseMetal(m)}
                    className={cn(
                      "flex h-11 items-center gap-2 border px-3 text-sm transition-colors duration-300",
                      on ? "border-ink" : "border-line hover:border-ink/50",
                    )}
                  >
                    <span aria-hidden className="h-4 w-4 rounded-full" style={{ background: info.swatch }} />
                    {info.short}
                    <span className="mono text-muted">{formatEuro(priceFor(product, m))}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">Made only in this combination of golds.</p>
          )}
        </div>

        {/* Size */}
        {sizes ? (
          <div className="mt-8">
            <label htmlFor={ids.size} className="micro mb-3 block text-muted">
              {sizes.label} ({sizes.unit})
            </label>
            <select
              id={ids.size}
              value={size ?? ""}
              onChange={(e) => setSize(e.target.value ? Number(e.target.value) : null)}
              className="h-12 w-full border border-line bg-transparent px-4 focus:border-ink focus:outline-none"
            >
              {sizeKind === "ring" ? <option value="">I don&apos;t know — send me a ring sizer</option> : null}
              {sizes.values.map((v) => (
                <option key={v} value={v}>
                  {sizeKind === "ring" ? `Size ${v}` : `${v} cm`}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {/* Engraving */}
        {product.engravable ? (
          <div className="mt-8">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" checked={engrave} onChange={(e) => setEngrave(e.target.checked)} className="h-4 w-4 accent-[var(--gold)]" />
              Add an engraving <span className="mono text-muted">complimentary</span>
            </label>
            {engrave ? (
              <div className="mt-3">
                <label htmlFor={ids.engraving} className="sr-only">
                  Engraving text
                </label>
                <input
                  id={ids.engraving}
                  value={engraving}
                  maxLength={ENGRAVING_MAX}
                  onChange={(e) => setEngraving(e.target.value)}
                  placeholder="A date, initials, a word"
                  className="h-12 w-full border border-line bg-transparent px-4 font-serif text-lg italic focus:border-ink focus:outline-none"
                />
                <p className="mono mt-1 text-right text-muted">
                  {engraving.length} / {ENGRAVING_MAX}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col gap-3">
          <button type="button" className="btn w-full" onClick={addToBag} disabled={adding} aria-busy={adding}>
            {adding ? "Adding…" : added ? "Add another" : "Add to bag"}
          </button>
          <TransitionLink href="/#appointment" className="btn-ghost w-full">
            Book an appointment to see it
          </TransitionLink>
          <p className="sr-only" aria-live="polite">
            {added ? `${product.name} added to your bag` : ""}
          </p>
        </div>

        <p className="mt-6 text-sm text-muted">
          Made to order in the atelier in {product.leadTime} working days, then delivered by insured courier or
          ready to collect at the boutique.
        </p>

        {/* Details */}
        <div className="mt-10 divide-y divide-line border-y border-line">
          {[
            { title: "The piece", body: <p>{product.description}</p>, open: true },
            {
              title: "Details",
              body: (
                <ul className="space-y-1.5">
                  <li>{metalLabel}</li>
                  {product.stones ? <li>{product.stones}</li> : null}
                  {product.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              ),
            },
            {
              title: "Delivery and returns",
              body: (
                <p>
                  Complimentary insured delivery in France and Europe, or collection at the boutique, 12 rue
                  Saint-Honoré. Returns within 30 days for pieces that are not engraved or resized. Resizing is
                  complimentary within 60 days.
                </p>
              ),
            },
            {
              title: "Care",
              body: (
                <p>
                  Keep each piece in its own pouch. Clean with warm water, a drop of mild soap and a soft brush. The
                  atelier cleans, checks claws and re-polishes your jewellery free of charge, every year.
                </p>
              ),
            },
          ].map((s) => (
            <details key={s.title} open={s.open} className="group py-5">
              <summary className="micro flex cursor-pointer list-none items-center justify-between">
                {s.title}
                <span aria-hidden className="text-lg leading-none transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="mt-4 text-sm leading-relaxed text-muted">{s.body}</div>
            </details>
          ))}
        </div>
        {credit ? <div className="mono mt-6 text-[0.65rem] text-muted">{credit}</div> : null}
      </div>
    </div>
  );
}
