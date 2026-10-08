import { atelierStats } from "@/data/atelier";
import { Photo } from "@/components/media/Photo";
import { Plate } from "@/components/media/Plate";
import { Odometer } from "@/components/motion/Odometer";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";

/** 03 — The atelier in numbers. Dark section; counters roll up in view. */
export function AtelierNumbers() {
  return (
    <section id="atelier" aria-labelledby="atelier-title" className="theme-ink ink-surface relative py-28 md:py-44">
      <div className="shell grid-editorial gap-y-14">
        <Reveal className="col-span-12 md:col-span-6">
          <SectionLabel n={3} as="h2">
            <span id="atelier-title">The atelier in numbers</span>
          </SectionLabel>
          <p data-reveal className="heading mt-8 max-w-xl">
            Seventeen years at the same bench, behind the same door.
          </p>
          <p data-reveal className="mt-8 max-w-md text-muted">
            Four people work in the atelier: two setters, a polisher and the founder, who still sets every
            centre stone.
          </p>
        </Reveal>
        <figure className="col-span-12 md:col-span-5 md:col-start-8">
          <Photo slot="atelier-04" ratio="3 / 2" sizes="(min-width: 768px) 40vw, 100vw" />
          <Plate n={2}>The bench, Saint-Honoré</Plate>
        </figure>

        <dl className="col-span-12 mt-6 grid grid-cols-2 border-t border-line md:mt-16 lg:grid-cols-4">
          {atelierStats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-5 border-line py-10 pr-6 ${i % 2 === 1 ? "border-l pl-6" : ""} ${i >= 2 ? "border-t lg:border-t-0" : ""} lg:border-l lg:pl-8 lg:first:border-l-0 lg:first:pl-0`}
            >
              <dt className="order-2">
                <span className="micro block text-fg">{s.label}</span>
                <span className="mono mt-2 block text-muted">{s.note}</span>
              </dt>
              <dd className="order-1 font-serif text-[clamp(3.25rem,7vw,7rem)] font-light leading-none tracking-[-0.02em] text-gold-light">
                <Odometer value={s.value} className="tabular" />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
