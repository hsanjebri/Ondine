"use client";

/* eslint-disable @next/next/no-img-element -- the snapshot is a data URL taken from the canvas */
import { useEffect, useState } from "react";
import { describe, label, type StepId } from "@/lib/composer-options";
import { configKey, encodeConfig } from "@/lib/composer-url";
import { formatEuro } from "@/lib/format";
import { priceRing } from "@/lib/pricing";
import { useComposer } from "@/store/composer";
import { useCart } from "@/store/cart";
import { useUI } from "@/store/ui";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { CountingPrice } from "./PriceBar";

/** Summary card: snapshot of the ring, every choice, the total and the next steps. */
export function Summary() {
  const config = useComposer((s) => s.config);
  const snapshot = useComposer((s) => s.snapshot);
  const setStep = useComposer((s) => s.setStep);
  const add = useCart((s) => s.add);
  const setBagOpen = useUI((s) => s.setBagOpen);
  const [image, setImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const price = priceRing(config);
  const query = encodeConfig(config);

  // Take the picture once the panel has settled (the camera may still be easing).
  useEffect(() => {
    if (!snapshot) return;
    const id = window.setTimeout(() => setImage(snapshot(720)), 450);
    return () => window.clearTimeout(id);
  }, [snapshot, config]);

  const rows: Array<{ step: StepId; label: string; value: string }> = [
    { step: "setting", label: "Setting", value: label.setting(config.setting) },
    { step: "metal", label: "Metal", value: label.metal(config.metal) },
    { step: "stone", label: "Stone", value: `${config.carat.toFixed(2)} ct ${label.shape(config.shape).toLowerCase()}, ${config.colour} ${config.clarity}` },
    { step: "size", label: "Size", value: config.size ? `EU ${config.size}` : "Ring sizer posted to you" },
    { step: "engraving", label: "Engraving", value: config.engraving ? `“${config.engraving}”` : "None" },
    { step: "box", label: "Box", value: label.box(config.box) },
  ];

  const addToBag = () => {
    add({
      key: configKey(config),
      name: `Composed ${label.setting(config.setting).toLowerCase()}`,
      price: price.total,
      detail: describe(config),
      image: snapshot?.(240) ?? undefined,
    });
    setBagOpen(true);
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

  return (
    <div className="space-y-8">
      <figure className="theme-ink relative aspect-[4/3] overflow-hidden bg-black">
        {image ? (
          <img src={image} alt={`Your ring: ${describe(config)}`} className="h-full w-full object-cover" />
        ) : (
          <div className="mono absolute inset-0 flex items-center justify-center text-muted">preparing the picture…</div>
        )}
        <span className="mono absolute top-3 left-3 text-ivory/70">your ring</span>
        <span className="mono absolute top-3 right-3 text-ivory/70">pl. —</span>
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
        {[
          ["Setting and making", price.setting],
          ["Metal", price.metal],
          ["Centre stone", price.stone],
          ...(price.accents ? [["Accent diamonds", price.accents] as const] : []),
          ...(price.box ? [["Box", price.box] as const] : []),
        ].map(([k, v]) => (
          <div key={k as string} className="flex justify-between">
            <dt>{k}</dt>
            <dd className="tabular">{formatEuro(v as number)}</dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between border-t border-line pt-3 text-fg">
          <dt className="micro">Total</dt>
          <dd className="font-serif text-3xl">
            <CountingPrice value={price.total} />
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <button type="button" className="btn w-full" onClick={addToBag}>
          Add to bag
        </button>
        <TransitionLink href={`/?${query}#appointment`} className="btn-ghost w-full">
          Book an appointment to see it
        </TransitionLink>
        <button type="button" className="mono link-line self-center text-muted" onClick={share}>
          {copied ? "link copied" : "copy a link to this ring"}
        </button>
      </div>
    </div>
  );
}
