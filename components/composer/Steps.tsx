"use client";

/* eslint-disable @next/next/no-img-element -- small transparent cut-outs used as option thumbnails */
import { useId, useState } from "react";
import cutouts from "@/data/cutouts.json";
import {
  BOXES,
  CARAT,
  CLARITIES,
  COLOURS,
  ENGRAVING_MAX,
  ENGRAVING_PLACE,
  METALS,
  PIECES,
  SHAPES,
  SIZES,
  designsFor,
  getDesign,
  type DesignId,
  type MetalId,
} from "@/lib/composer-options";
import { BOX_PRICE, linePrice, stonePrice } from "@/lib/pricing";
import { Toned } from "./Toned";
import { formatEuro } from "@/lib/format";
import { useComposer } from "@/store/composer";
import { OptionGroup, Segmented } from "./Options";

const CUT = cutouts as Record<string, { src: string }>;
const useConfig = () => useComposer((s) => s.config);
const useSet = () => useComposer((s) => s.set);

/** A cut-out on a small ink tile; pieces are shown in the chosen metal. */
function Thumb({ design, metal, className }: { design: DesignId | `stone-${string}`; metal?: MetalId; className?: string }) {
  return (
    <span className={`flex aspect-[4/3] w-full items-center justify-center bg-[radial-gradient(90%_90%_at_50%_40%,#2a231e,#0b0a09)] p-3 ${className ?? ""}`}>
      <span className="relative block h-full w-full [filter:drop-shadow(0_6px_8px_rgb(0_0_0/0.5))]">
        {metal && !design.startsWith("stone-") ? (
          <Toned design={design as DesignId} metal={metal} loading="lazy" />
        ) : (
          <img src={CUT[design].src} alt="" loading="lazy" draggable={false} className="absolute inset-0 h-full w-full object-contain" />
        )}
      </span>
    </span>
  );
}

/* ───────────────────────── Piece ───────────────────────── */

export function PieceStep() {
  const c = useConfig();
  const set = useSet();
  return (
    <OptionGroup
      name="piece"
      legend="What are we making?"
      value={c.piece}
      options={PIECES.map((p) => ({ id: p.id, label: p.label, note: p.note }))}
      onChange={(v) => set("piece", v)}
      render={(o) => (
        <>
          <Thumb design={designsFor(o.id)[0].id} metal={c.metal} />
          <span className="mt-1 text-[0.95rem] font-medium">{o.label}</span>
          <span className="text-sm leading-snug text-muted">{o.note}</span>
        </>
      )}
    />
  );
}

/* ───────────────────────── Design ───────────────────────── */

export function DesignStep() {
  const c = useConfig();
  const set = useSet();
  return (
    <OptionGroup
      name="design"
      legend="Choose the design"
      value={c.design}
      options={designsFor(c.piece).map((d) => ({ id: d.id, label: d.label, note: d.note }))}
      onChange={(v) => set("design", v)}
      render={(o) => (
        <>
          <Thumb design={o.id} metal={c.metal} />
          <span className="mt-1 text-[0.95rem] font-medium">{o.label}</span>
          <span className="text-sm leading-snug text-muted">{o.note}</span>
        </>
      )}
    />
  );
}

/* ───────────────────────── Metal ───────────────────────── */

export function MetalStep() {
  const c = useConfig();
  const set = useSet();
  return (
    <div className="space-y-6">
      <OptionGroup
        name="metal"
        legend="Choose the metal"
        value={c.metal}
        options={METALS.map((m) => ({ id: m.id, label: m.label }))}
        onChange={(v) => set("metal", v)}
        render={(o) => {
          const m = METALS.find((x) => x.id === o.id)!;
          return (
            <>
              <span aria-hidden className="h-10 w-10 rounded-full shadow-[inset_0_0_0_1px_rgb(20_17_15/0.15)]" style={{ background: m.swatch }} />
              <span className="text-[0.95rem] font-medium">{m.label}</span>
              <span className="mono text-muted">{m.note}</span>
            </>
          );
        }}
      />
      <p className="text-sm text-muted">
        The piece on the left is photographed in one metal and re-toned to show the others. In the atelier it is
        made in the metal you choose.
      </p>
    </div>
  );
}

/* ───────────────────────── Stone ───────────────────────── */

export function StoneStep() {
  const c = useConfig();
  const set = useSet();
  const caratId = useId();
  const d = getDesign(c.design);
  if (d.stone === "none") return null;
  const range = CARAT[d.stone];
  const pair = c.piece === "earrings";
  const stones =
    d.stone === "line"
      ? linePrice(c.carat, c.colour, c.clarity)
      : (pair ? 2 : 1) * stonePrice(c.carat, c.shape, c.colour, c.clarity);
  const ticks = d.stone === "line" ? [0.5, 2, 4, 6, 8] : [0.3, 1, 2, 3];

  return (
    <div className="space-y-10">
      {d.stone === "centre" ? (
        <p className="text-sm text-muted">
          The photograph shows the design. Your own stone is drawn beside it, to scale against a 10 mm rule.
        </p>
      ) : null}
      {d.stone === "centre" ? (
        <OptionGroup
          name="shape"
          legend="Shape"
          value={c.shape}
          columns={3}
          options={SHAPES.map((s) => ({ id: s.id, label: s.label }))}
          onChange={(v) => set("shape", v)}
          render={(o) => (
            <span className="flex flex-col items-center gap-2 text-center">
              <Thumb design={`stone-${o.id}`} className="aspect-square" />
              <span className="text-sm">{o.label}</span>
            </span>
          )}
        />
      ) : (
        <p className="border-l-2 border-accent pl-4 text-sm text-muted">
          A line of round brilliants, matched by hand for colour and size. Choose the total weight and the grade.
        </p>
      )}

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <label htmlFor={caratId} className="micro text-muted">
            {d.stone === "line" ? "Total weight" : pair ? "Weight, each stone" : "Carat weight"}
          </label>
          <output htmlFor={caratId} className="font-serif text-3xl leading-none tabular">
            {c.carat.toFixed(2)} <span className="mono text-muted">ct</span>
          </output>
        </div>
        <input
          id={caratId}
          type="range"
          min={range.min}
          max={range.max}
          step={range.step}
          value={c.carat}
          onChange={(e) => set("carat", Number(e.target.value))}
          className="carat-range w-full"
          aria-valuetext={`${c.carat.toFixed(2)} carats`}
          data-cursor="drag"
        />
        <div className="mono mt-2 flex justify-between text-muted" aria-hidden>
          {ticks.map((t) => (
            <span key={t}>{t.toFixed(2)}</span>
          ))}
        </div>
      </div>

      <Segmented name="colour" legend="Colour" value={c.colour} options={COLOURS} onChange={(v) => set("colour", v)} hint="d is colourless" />
      <Segmented name="clarity" legend="Clarity" value={c.clarity} options={CLARITIES} onChange={(v) => set("clarity", v)} hint="if is flawless under 10×" />

      <p className="flex items-baseline justify-between border-t border-line pt-4 text-sm text-muted">
        <span>{d.stone === "line" ? "The diamonds" : pair ? "The pair of stones" : "The stone alone"}</span>
        <span className="smallcaps tabular text-fg">{formatEuro(Math.round(stones / 10) * 10)}</span>
      </p>
    </div>
  );
}

/* ───────────────────────── Size ───────────────────────── */

export function SizeStep() {
  const c = useConfig();
  const set = useSet();
  const [helper, setHelper] = useState(false);
  const [mm, setMm] = useState("");
  const helperId = useId();
  const sizes = SIZES[c.piece];
  const ring = c.piece === "ring";
  const measured = Number(mm.replace(",", "."));
  const suggestion = Number.isFinite(measured) && measured >= 40 && measured <= 70 ? Math.min(62, Math.max(46, Math.round(measured))) : null;

  return (
    <div className="space-y-8">
      <OptionGroup
        name="size"
        legend={ring ? "EU size (inner circumference, mm)" : `${sizes.label} (${sizes.unit})`}
        value={c.size}
        columns={ring ? 6 : 3}
        options={sizes.values.map((s) => ({ id: s, label: ring ? String(s) : `${s} cm` }))}
        onChange={(v) => set("size", v)}
        render={(o) => <span className="smallcaps block py-1 text-center tabular">{o.label}</span>}
      />

      {ring && c.size === null ? (
        <p className="border-l-2 border-accent pl-4 text-sm text-muted">
          We will post you a ring sizer with your order confirmation, and confirm the size before the ring is made.
        </p>
      ) : null}

      {ring ? (
        <div className="border-t border-line pt-6">
          <button type="button" className="micro link-line" aria-expanded={helper} aria-controls={helperId} onClick={() => setHelper((v) => !v)}>
            I don&apos;t know my size
          </button>
          <div id={helperId} hidden={!helper} className="mt-6 space-y-6 text-sm text-muted">
            <div>
              <p className="text-fg">Measure at home</p>
              <p className="mt-2">
                Wrap a thin strip of paper around the base of the finger, mark where it meets, and measure the length in
                millimetres. In Europe, that length is the size.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor={`${helperId}-mm`}>
                  Circumference in millimetres
                </label>
                <input
                  id={`${helperId}-mm`}
                  inputMode="decimal"
                  placeholder="e.g. 52.5"
                  value={mm}
                  onChange={(e) => setMm(e.target.value)}
                  className="h-11 w-32 border border-line bg-transparent px-3 text-fg placeholder:text-muted/70 focus:border-fg focus:outline-none"
                />
                <span className="mono">mm</span>
                {suggestion ? (
                  <button type="button" className="btn-ghost min-h-11 px-4" onClick={() => set("size", suggestion)}>
                    Use size {suggestion}
                  </button>
                ) : null}
              </div>
            </div>
            <div>
              <p className="text-fg">Or let us help</p>
              <p className="mt-2">We post a ring sizer with the order, and resizing is complimentary within 60 days.</p>
              <button type="button" className="micro link-line mt-3 text-fg" onClick={() => set("size", null)}>
                Send me a ring sizer
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">
          {c.piece === "bracelet"
            ? "Measure the wrist just above the bone and add one centimetre for a comfortable fit."
            : "42 cm sits at the base of the neck; 45 cm falls just below the collarbone."}{" "}
          Adjustments are complimentary within 60 days.
        </p>
      )}
    </div>
  );
}

/* ───────────────────────── Engraving ───────────────────────── */

export function EngravingStep() {
  const c = useConfig();
  const set = useSet();
  const id = useId();
  const place = ENGRAVING_PLACE[c.piece];
  const metal = METALS.find((m) => m.id === c.metal)!;
  if (!place) return null;
  const text = c.engraving || `Your words, ${place}`;

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <label htmlFor={id} className="micro text-muted">
            Engraving
          </label>
          <span className="mono tabular text-muted" aria-live="polite">
            {c.engraving.length} / {ENGRAVING_MAX}
          </span>
        </div>
        <input
          id={id}
          type="text"
          maxLength={ENGRAVING_MAX}
          value={c.engraving}
          onChange={(e) => set("engraving", e.target.value)}
          placeholder="A date, initials, a word"
          className="h-12 w-full border border-line bg-transparent px-4 font-serif text-xl text-fg italic placeholder:text-muted/70 placeholder:not-italic focus:border-fg focus:outline-none"
          autoComplete="off"
        />
        <p className="mt-2 text-sm text-muted">Engraved by hand {place}. Complimentary.</p>
      </div>

      <figure>
        <figcaption className="mono mb-3 text-muted">preview — {place}</figcaption>
        <svg viewBox="0 0 520 120" className="w-full" role="img" aria-label={`Engraving preview: ${c.engraving || "empty"}`}>
          <defs>
            <linearGradient id="engrave-metal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={metal.color} stopOpacity={0.6} />
              <stop offset="0.45" stopColor={metal.color} />
              <stop offset="0.6" stopColor="#ffffff" stopOpacity={0.7} />
              <stop offset="1" stopColor={metal.color} stopOpacity={0.65} />
            </linearGradient>
            <linearGradient id="engrave-fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity={0.55} />
              <stop offset="0.18" stopColor="#000" stopOpacity={0} />
              <stop offset="0.82" stopColor="#000" stopOpacity={0} />
              <stop offset="1" stopColor="#000" stopOpacity={0.55} />
            </linearGradient>
            <path id="engrave-arc" d={c.piece === "ring" ? "M40 78 Q260 52 480 78" : "M40 70 L480 70"} />
          </defs>
          {c.piece === "ring" ? (
            <>
              <path d="M20 40 Q260 8 500 40 L500 92 Q260 64 20 92 Z" fill="url(#engrave-metal)" />
              <path d="M20 40 Q260 8 500 40 L500 92 Q260 64 20 92 Z" fill="url(#engrave-fade)" />
            </>
          ) : (
            <rect x="20" y="34" width="480" height="56" rx="10" fill="url(#engrave-metal)" />
          )}
          <text fontFamily="var(--font-cormorant), serif" fontStyle="italic" fontSize="26" fill="#000" fillOpacity={c.engraving ? 0.55 : 0.28} letterSpacing="1">
            <textPath href="#engrave-arc" startOffset="50%" textAnchor="middle">
              {text}
            </textPath>
          </text>
        </svg>
      </figure>
    </div>
  );
}

/* ───────────────────────── Box ───────────────────────── */

function BoxArt({ id }: { id: (typeof BOXES)[number]["id"] }) {
  const styles = {
    leather: "bg-[radial-gradient(120%_120%_at_30%_20%,#2a2420,#0b0a09_70%)]",
    velvet: "bg-[radial-gradient(120%_120%_at_30%_20%,#28304a,#0d1020_70%)]",
    oak: "bg-[repeating-linear-gradient(100deg,#b88c5a_0px,#a77b4b_6px,#c39a69_11px,#9f7343_15px)]",
  } as const;
  return (
    <span aria-hidden className={`relative flex aspect-[4/3] w-full items-center justify-center ${styles[id]}`}>
      <span className="absolute inset-[8%] border border-gold/30" />
      <svg viewBox="0 0 64 74" className="h-1/3 w-auto text-gold" fill="none" stroke="currentColor" strokeWidth={1.4}>
        <path d="M28.5 21.35 A21 25 0 1 0 35.5 21.35 C33.4 19.3 26 17.4 26 13.2 C26 9.6 29.4 6.4 32 2 C34.6 6.4 38 9.6 38 13.2 C38 17.4 30.6 19.3 28.5 21.35" />
      </svg>
    </span>
  );
}

export function BoxStep() {
  const c = useConfig();
  const set = useSet();
  return (
    <OptionGroup
      name="box"
      legend="Choose the box"
      value={c.box}
      columns={3}
      options={BOXES.map((b) => ({ id: b.id, label: b.label, note: b.note }))}
      onChange={(v) => set("box", v)}
      render={(o) => (
        <>
          <BoxArt id={o.id} />
          <span className="mt-1 text-[0.95rem] font-medium">{o.label}</span>
          <span className="text-sm leading-snug text-muted">{o.note}</span>
          <span className="smallcaps mt-auto tabular">{BOX_PRICE[o.id] ? `+ ${formatEuro(BOX_PRICE[o.id])}` : "Included"}</span>
        </>
      )}
    />
  );
}

export const STEP_COMPONENTS = {
  piece: PieceStep,
  design: DesignStep,
  metal: MetalStep,
  stone: StoneStep,
  size: SizeStep,
  engraving: EngravingStep,
  box: BoxStep,
} as const;
