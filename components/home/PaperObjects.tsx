import { site } from "@/lib/site";
import { Monogram } from "@/components/ui/Monogram";

/*
 * Stationery for the moodboard, drawn in HTML/SVG rather than photographed,
 * so the house's own mark appears on every object.
 */

/** Sealed envelope with a gold wax seal carrying the monogram. */
export function Envelope() {
  return (
    <div className="@container relative aspect-[3/2] w-full bg-[#efe7da] shadow-[inset_0_0_0_1px_rgb(20_17_15/0.06)]">
      <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M0 0 L150 112 L300 0" fill="#e8dfd0" stroke="rgb(20 17 15 / 0.12)" strokeWidth="0.75" />
        <path d="M0 200 L120 92 M300 200 L180 92" stroke="rgb(20 17 15 / 0.08)" strokeWidth="0.75" fill="none" />
      </svg>
      <div className="absolute top-[56%] left-1/2 flex aspect-square w-[22%] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#c9ad7a,#8a6d3c_70%,#6f5630)] shadow-[0_2px_6px_rgb(20_17_15/0.35)]">
        <Monogram className="h-[58%] w-auto text-[#f3e3be]/85" strokeWidth={1.2} />
      </div>
      <span className="mono absolute bottom-[8%] left-[7%] text-[3.4cqw] text-ink/45">
        par porteur — saint-honoré
      </span>
    </div>
  );
}

/** Business card: spaced wordmark, address in mono. */
export function BusinessCard() {
  return (
    <div className="@container relative flex aspect-[1.75/1] w-full flex-col justify-between bg-[#f8f4ee] p-[7%] shadow-[inset_0_0_0_1px_rgb(20_17_15/0.06)]">
      <div className="flex items-center gap-[5%]">
        <Monogram className="h-[11cqw] w-auto text-gold-deep" strokeWidth={1.2} />
        <span className="wordmark text-[3.9cqw] text-ink">Maison Ondine</span>
      </div>
      <div className="mono space-y-[0.6cqw] text-[3.3cqw] leading-tight text-ink/60">
        <p>{site.address.line.toLowerCase()}</p>
        <p>{site.phone}</p>
        <p>{site.email}</p>
      </div>
    </div>
  );
}

/** A swatch of 18k gold, like a printer's colour chip. */
export function GoldSwatch() {
  return (
    <div className="@container w-full bg-[#f8f4ee] p-[8%] pb-[10%] shadow-[inset_0_0_0_1px_rgb(20_17_15/0.06)]">
      <div className="aspect-square w-full bg-[linear-gradient(125deg,#7d6538_0%,#c9b07f_32%,#f0deb3_46%,#b89b6a_60%,#8a6f40_100%)]" />
      <p className="mono mt-[10%] text-[8cqw] text-ink/70">or jaune 18k</p>
      <p className="mono text-[6.5cqw] text-ink/45">750 ‰ — pl. 07</p>
    </div>
  );
}

/** The box, seen from above: ink leather, gold monogram. */
export function BoxTop() {
  return (
    <div className="@container relative flex aspect-square w-full items-center justify-center bg-[radial-gradient(120%_120%_at_30%_20%,#2a2420,#0b0a09_70%)] shadow-[inset_0_0_0_1px_rgb(246_241_234/0.06)]">
      <div className="absolute inset-[7%] border border-gold/25" />
      <Monogram className="h-[34%] w-auto text-gold" strokeWidth={1.2} />
      <span className="mono absolute bottom-[10%] text-[6cqw] text-gold/70">écrin</span>
    </div>
  );
}

/** The palette as printer's chips. */
export function ColourChips() {
  const chips = [
    { hex: "#F6F1EA", name: "ivory", dark: false },
    { hex: "#14110F", name: "ink", dark: true },
    { hex: "#B89B6A", name: "champagne", dark: false },
    { hex: "#DCE6EE", name: "diamond", dark: false },
  ];
  return (
    <div className="@container grid w-full grid-cols-4 gap-[3%] bg-[#f8f4ee] p-[5%] shadow-[inset_0_0_0_1px_rgb(20_17_15/0.06)]">
      {chips.map((c) => (
        <div key={c.hex}>
          <div className="aspect-[3/5] w-full shadow-[inset_0_0_0_1px_rgb(20_17_15/0.08)]" style={{ background: c.hex }} />
          <p className="mono mt-1.5 truncate text-[3.6cqw] text-ink/60">{c.name}</p>
        </div>
      ))}
    </div>
  );
}

/** Handwritten-looking tag with the tagline. */
export function Tag() {
  return (
    <div className="@container relative flex aspect-[2/3] w-full flex-col items-center justify-center gap-[6%] bg-[#f3ece1] px-[10%] shadow-[inset_0_0_0_1px_rgb(20_17_15/0.06)] [clip-path:polygon(18%_0,82%_0,100%_12%,100%_100%,0_100%,0_12%)]">
      <span className="mt-[2%] block aspect-square w-[12%] rounded-full shadow-[inset_0_0_0_1px_rgb(20_17_15/0.3)]" />
      <p className="text-center font-script text-[17cqw] leading-[1.05] text-gold-deep">Light, held forever</p>
      <span className="mono text-[7cqw] text-ink/45">no. 0412</span>
    </div>
  );
}
