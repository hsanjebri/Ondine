import { ScrubWords } from "@/components/motion/ScrubWords";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

const MANIFESTO =
  "We set every stone by hand in the small atelier behind the boutique, bending each claw until it holds without hiding, so that what you wear is not the gold, nor even the diamond, but the light they keep between them.";

/** 02 — The house: one long sentence, revealed word by word on scroll. */
export function Manifesto() {
  return (
    <section aria-labelledby="manifesto-title" className="shell grid-editorial gap-y-10 py-32 md:py-48">
      <Reveal className="col-span-12 md:col-span-3">
        <SectionLabel n={1} as="h2" className="text-fg">
          <span id="manifesto-title">The house</span>
        </SectionLabel>
        <p data-reveal className="mono mt-6 max-w-[14rem] text-muted">
          independent jewellers, saint-honoré, since 2009
        </p>
      </Reveal>
      <div className="col-span-12 md:col-span-9">
        <ScrubWords
          text={MANIFESTO}
          className="font-serif text-[clamp(1.9rem,4.1vw,4.3rem)] font-light leading-[1.08] tracking-[-0.012em] text-fg"
        />
        <Reveal className="mt-12 flex items-center gap-4 text-muted">
          <span data-reveal aria-hidden className="h-px w-10 bg-current" />
          <p data-reveal className="mono">the founder, stone-setter — paris, 2009</p>
        </Reveal>
      </div>
    </section>
  );
}
