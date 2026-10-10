"use client";

import { useState } from "react";
import cutouts from "@/data/cutouts.json";
import {
  ENGRAVING_PLACE,
  describe,
  label,
  pieceName,
  sizeLine,
  stepsFor,
  stoneLine,
  type StepId,
} from "@/lib/composer-options";
import { configKey, encodeConfig } from "@/lib/composer-url";
import { formatEuro } from "@/lib/format";
import { price } from "@/lib/pricing";
import { useComposer } from "@/store/composer";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { flyToBag } from "@/lib/fly-to-bag";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { CountingPrice } from "./PriceBar";
import { Stage } from "./Stage";

const CUT = cutouts as Record<string, { src: string }>;

/** Summary card: the piece on its stage, every choice, the total and the next steps. */
export function Summary() {
  const config = useComposer((s) => s.config);
  const setStep = useComposer((s) => s.setStep);
  const add = useCart((s) => s.add);
  const setBagOpen = useUI((s) => s.setBagOpen);
  const [copied, setCopied] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const p = price(config);
  const query = encodeConfig(config);
  const available = new Set(stepsFor(config).map((s) => s.id));

  const rows: Array<{ step: StepId; label: string; value: string }> = (
    [
      { step: "piece", label: "Piece", value: pieceName(config) },
      { step: "metal", label: "Metal", value: label.metal(config.metal) },
      { step: "stone", label: "Stones", value: stoneLine(config) },
      { step: "size", label: config.piece === "ring" ? "Size" : "Length", value: sizeLine(config) ?? "" },
      {
        step: "engraving",
        label: "Engraving",
        value: config.engraving ? `“${config.engraving}”, ${ENGRAVING_PLACE[config.piece]}` : "None",
      },
      { step: "box", label: "Box", value: label.box(config.box) },
    ] as const
  ).filter((r) => r.step === "piece" || available.has(r.step));

  const addToBag = async () => {
    if (adding) return;
    setAdding(true);
    // The piece on the big stage flies into the Bag button; it is added when it lands.
    await flyToBag(document.querySelector<HTMLElement>('[data-fly-source="stage"]'));
    add({
      key: configKey(config),
      name: `Composed — ${pieceName(config).toLowerCase()}`,
      price: p.total,
      detail: describe(config),
      image: CUT[config.design].src,
      cutout: config.design,
      metal: config.metal,
      href: `/composer?${query}`,
    });
    setAdded(true);
    setAdding(false);
    window.setTimeout(() => setBagOpen(true), 750);
  };

  const share = async () => {
    const url = `${window.location.origin}/composer?${query}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.prompt("Copy this link", url);
    }
  };

  const lines: Array<[string, number]> = [
    ["Design and making", p.making],
    ["Metal", p.metal],
    ...(p.stones ? [["Diamonds", p.stones] as [string, number]] : []),
    ...(p.accents ? [["Accent diamonds", p.accents] as [string, number]] : []),
    ...(p.box ? [["Box", p.box] as [string, number]] : []),
  ];

  return (
    <div className="space-y-8">
      <figure className="theme-ink relative aspect-[4/3] overflow-hidden bg-black">
        <Stage config={config} interactive={false} />
        <span className="mono absolute top-3 left-3 z-[7] text-ivory/70">your piece</span>
        <span className="mono absolute top-3 right-3 z-[7] text-ivory/70">pl. —</span>
      </figure>

      <dl className="divide-y divide-line border-y border-line">
        {rows.map((r) => (
          <div key={r.step} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="micro w-24 shrink-0 text-muted">{r.label}</dt>
            <dd className="min-w-0 flex-1 text-sm">{r.value}</dd>
            <dd>
              <button type="button" className="mono link-line text-muted" onClick={() => setStep(r.step)}>
                edit<span className="sr-only"> {r.label.toLowerCase()}</span>
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <dl className="space-y-1.5 text-sm text-muted">
        {lines.map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <dt>{k}</dt>
            <dd className="tabular">{formatEuro(v)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-line pt-3 text-fg">
          <dt className="micro">Total</dt>
          <dd className="font-serif text-3xl">
            <CountingPrice value={p.total} />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <button type="button" className="btn w-full" onClick={addToBag} disabled={adding} aria-busy={adding}>
          {adding ? "Adding…" : "Add to bag"}
        </button>
        <p className="sr-only" aria-live="polite">
          {added ? `${pieceName(config)} added to your bag` : ""}
        </p>
        <TransitionLink href={`/?${query}#appointment`} className="btn-ghost w-full">
          Book an appointment to see it
        </TransitionLink>
        <button type="button" className="mono link-line self-center text-muted" onClick={share}>
          {copied ? "link copied" : "copy a link to this piece"}
        </button>
      </div>
    </div>
  );
}
