"use client";

import { useId, useState } from "react";
import {
  BOXES,
  CARAT,
  CLARITIES,
  COLOURS,
  ENGRAVING_MAX,
  METALS,
  SETTINGS,
  SHAPES,
  SIZES,
  type RingConfig,
  type ShapeId,
} from "@/lib/composer-options";
import { BOX_PRICE, priceRing, stonePrice } from "@/lib/pricing";
import { formatEuro } from "@/lib/format";
import { useComposer } from "@/store/composer";
import { OUTLINES } from "./three/geometry/gem";
import { OptionGroup, Segmented } from "./Options";

const useConfig = () => useComposer((s) => s.config);
const useSet = () => useComposer((s) => s.set);

/* ───────────────────────── 01 Setting ───────────────────────── */

function SettingIcon({ id }: { id: (typeof SETTINGS)[number]["id"] }) {
  return (
    <svg viewBox="0 0 48 40" className="h-10 w-12 text-fg" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
      <ellipse cx="24" cy="30" rx="15" ry="6" />
      {id === "pave" ? [12, 16, 20, 28, 32, 36].map((x) => <circle key={x} cx={x} cy={x < 24 ? 33 : 33} r="1.1" />) : null}
      {id === "trilogy" ? (
        <>
          <path d="M12 22 l3 -5 l3 5 l-3 3z" />
          <path d="M30 22 l3 -5 l3 5 l-3 3z" />
        </>
      ) : null}
      <path d="M19 18 l5 -9 l5 9 l-5 6z" />
      {id === "halo" ? <ellipse cx="24" cy="17" rx="9" ry="3.5" strokeDasharray="1.4 1.4" /> : null}
      <path d="M20 24 L22 18 M28 24 L26 18" />
    </svg>
  );
}

export function SettingStep() {
  const c = useConfig();
  const set = useSet();
  return (
    <OptionGroup
      name="setting"
      legend="Choose the setting"
      value={c.setting}
      options={SETTINGS.map((s) => ({ id: s.id, label: s.label, note: s.note }))}
      onChange={(v) => set("setting", v)}
      render={(o, checked) => (
        <>
          <SettingIcon id={o.id} />
          <span className="text-[0.95rem] font-medium">{o.label}</span>
          <span className="text-sm leading-snug text-muted">{o.note}</span>
          <span className="mono mt-auto text-muted">{checked ? "selected" : " "}</span>
        </>
      )}
    />
  );
}

/* ───────────────────────── 02 Metal ───────────────────────── */

export function MetalStep() {
  const c = useConfig();
  const set = useSet();
  return (
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
            <span className="mono text-muted">{m.id === "platinum" ? "950 ‰, naturally white" : m.id === "white" ? "750 ‰, rhodium finish" : "750 ‰"}</span>
          </>
        );
      }}
    />
  );
}

/* ───────────────────────── 03 Stone ───────────────────────── */

function ShapeIcon({ shape }: { shape: ShapeId }) {
  const d = Array.from({ length: 72 }, (_, i) => {
    const [x, z] = OUTLINES[shape]((i / 72) * Math.PI * 2);
    return `${(20 + z * 11).toFixed(2)},${(20 - x * 11).toFixed(2)}`;
  });
  return (
    <svg viewBox="0 0 40 40" className="mx-auto h-9 w-9" aria-hidden>
      <path d={`M${d.join("L")}Z`} fill="none" stroke="currentColor" strokeWidth={1} />
      <path d={`M${d.filter((_, i) => i % 9 === 0).join("L")}Z`} fill="none" stroke="currentColor" strokeWidth={0.5} opacity={0.5} />
    </svg>
  );
}

export function StoneStep() {
  const c = useConfig();
  const set = useSet();
  const caratId = useId();
  const stone = stonePrice(c.carat, c.shape, c.colour, c.clarity);
  return (
    <div className="space-y-10">
      <OptionGroup
        name="shape"
        legend="Shape"
        value={c.shape}
        columns={3}
        options={SHAPES.map((s) => ({ id: s.id, label: s.label }))}
        onChange={(v) => set("shape", v)}
        render={(o) => (
          <span className="flex flex-col items-center gap-2 py-1 text-center">
            <ShapeIcon shape={o.id} />
            <span className="text-sm">{o.label}</span>
          </span>
        )}
      />

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <label htmlFor={caratId} className="micro text-muted">
            Carat weight
          </label>
          <output htmlFor={caratId} className="font-serif text-3xl leading-none tabular">
            {c.carat.toFixed(2)} <span className="mono text-muted">ct</span>
          </output>
        </div>
        <input
          id={caratId}
          type="range"
          min={CARAT.min}
          max={CARAT.max}
          step={CARAT.step}
          value={c.carat}
          onChange={(e) => set("carat", Number(e.target.value))}
          className="carat-range w-full"
          aria-valuetext={`${c.carat.toFixed(2)} carats`}
          data-cursor="drag"
        />
        <div className="mono mt-2 flex justify-between text-muted" aria-hidden>
          <span>0.30</span>
          <span>1.00</span>
          <span>2.00</span>
          <span>3.00</span>
        </div>
      </div>

      <Segmented
        name="colour"
        legend="Colour"
        value={c.colour}
        options={COLOURS}
        onChange={(v) => set("colour", v)}
        hint="d is colourless"
      />
      <Segmented
        name="clarity"
        legend="Clarity"
        value={c.clarity}
        options={CLARITIES}
        onChange={(v) => set("clarity", v)}
        hint="if is flawless under 10×"
      />

      <p className="flex items-baseline justify-between border-t border-line pt-4 text-sm text-muted">
        <span>
          The stone alone, {c.carat.toFixed(2)} ct {c.colour} {c.clarity}
        </span>
        <span className="smallcaps tabular text-fg">{formatEuro(Math.round(stone / 10) * 10)}</span>
      </p>
    </div>
  );
}

/* ───────────────────────── 04 Size ───────────────────────── */

export function SizeStep() {
  const c = useConfig();
  const set = useSet();
  const [helper, setHelper] = useState(false);
  const [mm, setMm] = useState("");
  const measured = Number(mm.replace(",", "."));
  const suggestion = Number.isFinite(measured) && measured >= 40 && measured <= 70
    ? Math.min(62, Math.max(46, Math.round(measured)))
    : null;
  const helperId = useId();

  return (
    <div className="space-y-8">
      <OptionGroup
        name="size"
        legend="EU size (inner circumference, mm)"
        value={c.size}
        columns={6}
        options={SIZES.map((s) => ({ id: s, label: String(s) }))}
        onChange={(v) => set("size", v)}
        render={(o) => <span className="smallcaps block py-1 text-center tabular">{o.label}</span>}
      />

      {c.size === null ? (
        <p className="border-l-2 border-accent pl-4 text-sm text-muted">
          We will post you a ring sizer with your order confirmation, and confirm the size before the ring is made.
        </p>
      ) : null}

      <div className="border-t border-line pt-6">
        <button
          type="button"
          className="micro link-line"
          aria-expanded={helper}
          aria-controls={helperId}
          onClick={() => setHelper((v) => !v)}
        >
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
    </div>
  );
}

/* ───────────────────────── 05 Engraving ───────────────────────── */

export function EngravingStep() {
  const c = useConfig();
  const set = useSet();
  const id = useId();
  const metal = METALS.find((m) => m.id === c.metal)!;
  const text = c.engraving || "Your words, inside the band";

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
          onChange={(e) => set("engraving", e.target.value.slice(0, ENGRAVING_MAX))}
          placeholder="A date, initials, a word"
          className="h-12 w-full border border-line bg-transparent px-4 font-serif text-xl text-fg italic placeholder:text-muted/70 placeholder:not-italic focus:border-fg focus:outline-none"
          autoComplete="off"
        />
        <p className="mt-2 text-sm text-muted">Engraved by hand inside the band. Complimentary.</p>
      </div>

      <figure>
        <figcaption className="mono mb-3 text-muted">preview — inside the band</figcaption>
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
            <path id="engrave-arc" d="M40 78 Q260 52 480 78" />
          </defs>
          <path d="M20 40 Q260 8 500 40 L500 92 Q260 64 20 92 Z" fill="url(#engrave-metal)" />
          <path d="M20 40 Q260 8 500 40 L500 92 Q260 64 20 92 Z" fill="url(#engrave-fade)" />
          <text
            fontFamily="var(--font-cormorant), serif"
            fontStyle="italic"
            fontSize="26"
            fill="#000"
            fillOpacity={c.engraving ? 0.55 : 0.28}
            letterSpacing="1"
          >
            <textPath href="#engrave-arc" startOffset="50%" textAnchor="middle">
              {text}
            </textPath>
          </text>
        </svg>
      </figure>
    </div>
  );
}

/* ───────────────────────── 06 Box ───────────────────────── */

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
  setting: SettingStep,
  metal: MetalStep,
  stone: StoneStep,
  size: SizeStep,
  engraving: EngravingStep,
  box: BoxStep,
} as const;

export function priceOf(c: RingConfig) {
  return priceRing(c);
}
