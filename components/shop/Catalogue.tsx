"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { METALS, type MetalId } from "@/lib/composer-options";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { CATEGORIES, TAG_LABEL, priceFor, products, type CategoryId, type Product, type Tag } from "@/data/products";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ProductCard } from "./ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "name";

const SORTS: Array<{ id: Sort; label: string }> = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price, low to high" },
  { id: "price-desc", label: "Price, high to low" },
  { id: "name", label: "Name" },
];

const PRICES = [
  { id: "under-2000", label: "Under € 2,000", min: 0, max: 2000 },
  { id: "2000-5000", label: "€ 2,000 – 5,000", min: 2000, max: 5000 },
  { id: "5000-10000", label: "€ 5,000 – 10,000", min: 5000, max: 10000 },
  { id: "over-10000", label: "Over € 10,000", min: 10000, max: Infinity },
] as const;

type PriceId = (typeof PRICES)[number]["id"];

interface Filters {
  category: CategoryId | "all";
  metal: MetalId | "all";
  price: PriceId | "all";
  tag: Tag | "all";
  sort: Sort;
}

const DEFAULTS: Filters = { category: "all", metal: "all", price: "all", tag: "all", sort: "featured" };

function readUrl(): Filters {
  const p = new URLSearchParams(window.location.search);
  const one = <T extends string>(key: string, list: readonly T[], fallback: T): T => {
    const v = p.get(key);
    return v && (list as readonly string[]).includes(v) ? (v as T) : fallback;
  };
  return {
    category: one("category", [...CATEGORIES.map((c) => c.id), "all"] as const, "all"),
    metal: one("metal", [...METALS.map((m) => m.id), "all"] as const, "all"),
    price: one("price", [...PRICES.map((x) => x.id), "all"] as const, "all"),
    tag: one("tag", [...(Object.keys(TAG_LABEL) as Tag[]), "all"] as const, "all"),
    sort: one("sort", SORTS.map((s) => s.id), "featured"),
  };
}

function writeUrl(f: Filters) {
  const p = new URLSearchParams();
  (Object.keys(f) as Array<keyof Filters>).forEach((k) => {
    if (f[k] !== DEFAULTS[k]) p.set(k, f[k]);
  });
  const q = p.toString();
  window.history.replaceState(window.history.state, "", `${window.location.pathname}${q ? `?${q}` : ""}`);
}

function apply(list: Product[], f: Filters) {
  const range = PRICES.find((x) => x.id === f.price);
  const shownMetal = (p: Product) => (f.metal !== "all" && p.metals?.includes(f.metal) ? f.metal : p.metals?.[0]);
  const out = list.filter(
    (p) =>
      (f.category === "all" || p.category === f.category) &&
      (f.metal === "all" || p.metals?.includes(f.metal)) &&
      (f.tag === "all" || p.tags?.includes(f.tag)) &&
      (!range || (priceFor(p, shownMetal(p)) >= range.min && priceFor(p, shownMetal(p)) < range.max)),
  );
  const price = (p: Product) => priceFor(p, shownMetal(p));
  if (f.sort === "price-asc") out.sort((a, b) => price(a) - price(b));
  if (f.sort === "price-desc") out.sort((a, b) => price(b) - price(a));
  if (f.sort === "name") out.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return out;
}

function Chip({ on, onClick, children, count }: { on: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        "micro flex h-10 shrink-0 items-center gap-2 border px-4 transition-colors duration-300 ease-ondine",
        on ? "border-ink bg-ink text-ivory" : "border-line text-fg hover:border-ink/50",
      )}
    >
      {children}
      {count !== undefined ? <span className={cn("tabular", on ? "text-ivory/60" : "text-muted")}>{count}</span> : null}
    </button>
  );
}

/**
 * The catalogue: category tabs, filters (metal, price, occasion), sort, and
 * an animated grid. Filters live in the URL so a filtered view can be shared.
 */
export function Catalogue() {
  const [f, setF] = useState<Filters>(DEFAULTS);
  const [panel, setPanel] = useState(false);

  // Read the URL once on mount (the page itself is static).
  useEffect(() => {
    const id = requestAnimationFrame(() => setF(readUrl()));
    return () => cancelAnimationFrame(id);
  }, []);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) =>
    setF((prev) => {
      const next = { ...prev, [k]: v };
      writeUrl(next);
      return next;
    });

  const list = useMemo(() => apply(products, f), [f]);
  const active = (["metal", "price", "tag"] as const).filter((k) => f[k] !== "all").length;
  const countIn = (category: CategoryId | "all") => apply(products, { ...f, category }).length;

  return (
    <div>
      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Category">
        <Chip on={f.category === "all"} onClick={() => set("category", "all")} count={countIn("all")}>
          All
        </Chip>
        {CATEGORIES.map((c) => (
          <Chip key={c.id} on={f.category === c.id} onClick={() => set("category", c.id)} count={countIn(c.id)}>
            {c.label}
          </Chip>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
        <button
          type="button"
          className="micro link-line"
          aria-expanded={panel}
          aria-controls="catalogue-filters"
          onClick={() => setPanel((v) => !v)}
        >
          Filters{active ? ` (${active})` : ""}
        </button>
        <p className="mono text-muted" aria-live="polite">
          {list.length} {list.length === 1 ? "piece" : "pieces"}
        </p>
        <label className="micro flex items-center gap-3">
          <span className="text-muted">Sort</span>
          <select
            value={f.sort}
            onChange={(e) => set("sort", e.target.value as Sort)}
            className="micro h-10 border border-line bg-transparent px-3 focus:border-ink focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <AnimatePresence initial={false}>
        {panel ? (
          <motion.div
            id="catalogue-filters"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="grid gap-8 border-b border-line py-8 md:grid-cols-3">
              <fieldset>
                <legend className="micro mb-4 text-muted">Metal</legend>
                <div className="flex flex-wrap gap-2">
                  <Chip on={f.metal === "all"} onClick={() => set("metal", "all")}>
                    Any
                  </Chip>
                  {METALS.map((m) => (
                    <Chip key={m.id} on={f.metal === m.id} onClick={() => set("metal", m.id)}>
                      <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: m.swatch }} />
                      {m.short}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="micro mb-4 text-muted">Price</legend>
                <div className="flex flex-wrap gap-2">
                  <Chip on={f.price === "all"} onClick={() => set("price", "all")}>
                    Any
                  </Chip>
                  {PRICES.map((x) => (
                    <Chip key={x.id} on={f.price === x.id} onClick={() => set("price", x.id)}>
                      {x.label}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="micro mb-4 text-muted">Occasion</legend>
                <div className="flex flex-wrap gap-2">
                  <Chip on={f.tag === "all"} onClick={() => set("tag", "all")}>
                    Any
                  </Chip>
                  {(Object.keys(TAG_LABEL) as Tag[]).map((t) => (
                    <Chip key={t} on={f.tag === t} onClick={() => set("tag", t)}>
                      {TAG_LABEL[t]}
                    </Chip>
                  ))}
                </div>
              </fieldset>
              {active ? (
                <button
                  type="button"
                  className="mono link-line justify-self-start text-muted md:col-span-3"
                  onClick={() => {
                    const next = { ...f, metal: "all", price: "all", tag: "all" } as Filters;
                    setF(next);
                    writeUrl(next);
                  }}
                >
                  clear filters
                </button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Grid */}
      {list.length ? (
        <motion.ul layout className="mt-10 grid grid-cols-2 gap-x-[clamp(0.75rem,2vw,1.75rem)] gap-y-12 md:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.55, ease: EASE, delay: Math.min(i, 8) * 0.03 }}
              >
                <ProductCard product={p} index={i} preferredMetal={f.metal === "all" ? undefined : f.metal} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      ) : (
        <div className="py-24 text-center">
          <p className="subheading">Nothing matches these filters.</p>
          <p className="mt-3 text-muted">
            Try another metal or price, or{" "}
            <TransitionLink href="/composer" className="link-line text-fg">
              compose a piece of your own
            </TransitionLink>
            .
          </p>
        </div>
      )}
    </div>
  );
}
