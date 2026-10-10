import { collections } from "@/data/collections";
import { products } from "@/data/products";
import { pad } from "@/lib/format";
import { Photo } from "@/components/media/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { CollectionsScene, type CollectionPanel } from "./CollectionsScene";

/** 04 — Collections. Sticky image wipes between the four collections. */
export function Collections() {
  const panels: CollectionPanel[] = collections.map((c, i) => {
    const count = products.filter((p) => p.collection === c.id).length;
    return {
      id: c.id,
      image: <Photo slot={c.image} sizes="(min-width: 1024px) 50vw, 100vw" quality={75} />,
      plate: (
        <p className="flex items-baseline gap-3 text-muted">
          <span className="micro shrink-0 text-fg">Pl. {pad(i + 4)} —</span>
          <span className="text-[0.8125rem] leading-snug">{c.plate}</span>
        </p>
      ),
      body: (
        <div>
          <p className="mono text-accent">
            {pad(i + 1)} / {pad(collections.length)}
          </p>
          <h3 className="display mt-6">{c.name}</h3>
          <p className="lead mt-6 text-fg">{c.line}</p>
          <p className="mt-5 max-w-md text-muted">{c.description}</p>
          <div className="mt-8 flex items-center gap-6">
            <TransitionLink href={`/jewellery?category=${c.id === "solitaires" || c.id === "bands" ? "rings" : c.id}`} className="micro link-line">
              See the pieces
            </TransitionLink>
            <span className="mono text-muted">
              {count} {count === 1 ? "piece" : "pieces"}
            </span>
          </div>
        </div>
      ),
    };
  });

  return (
    <section id="collections" aria-labelledby="collections-title" className="shell py-28 md:py-40 lg:pb-16">
      <Reveal className="grid-editorial gap-y-6">
        <div className="col-span-12 md:col-span-6">
          <SectionLabel n={4} as="h2">
            <span id="collections-title">Collections</span>
          </SectionLabel>
        </div>
        <p data-reveal className="heading col-span-12 max-w-2xl md:col-span-6">
          Four families, one way of holding a stone.
        </p>
      </Reveal>
      <div className="mt-16 lg:mt-0">
        <CollectionsScene panels={panels} />
      </div>
    </section>
  );
}
