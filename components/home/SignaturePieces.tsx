import { signaturePieces } from "@/data/products";
import { getCollection } from "@/data/collections";
import { formatEuro, pad } from "@/lib/format";
import { getImage } from "@/lib/images";
import { Photo } from "@/components/media/Photo";
import { Credit } from "@/components/media/Credit";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { SignatureCarousel } from "./SignatureCarousel";

/** 05 — Signature pieces: a horizontal, draggable catalogue. */
export function SignaturePieces() {
  const cards = signaturePieces.map((p, i) => {
    const image = getImage(p.images[0]);
    return (
      <article key={p.slug} className="sp-card group/card relative will-change-transform">
        <TransitionLink href={`/jewellery/${p.slug}`} prefetch={false} className="block" draggable={false}>
          <div className="relative overflow-hidden">
            <div className="transition-transform duration-[1200ms] ease-ondine group-hover/card:scale-[1.06]">
              <Photo slot={p.images[0]} ratio="4 / 5" sizes="(min-width: 1024px) 24vw, 70vw" credit={false} />
            </div>
            <span className="mono pointer-events-none absolute top-3 left-3 z-[2] text-ivory mix-blend-difference">pl. {pad(i + 1)}</span>
          </div>
          <div className="mt-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="smallcaps text-fg">{p.name}</h3>
              <p className="mt-1.5 text-sm text-muted">
                {p.type} · {p.metal}
              </p>
            </div>
            <p className="smallcaps tabular whitespace-nowrap text-fg">{formatEuro(p.price)}</p>
          </div>
          <p className="mono mt-3 text-muted">{getCollection(p.collection).name.toLowerCase()}</p>
        </TransitionLink>
        {/* Attribution sits outside the link: no nested anchors */}
        {image ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5]">
            <Credit image={image} on="card" />
          </div>
        ) : null}
      </article>
    );
  });

  return (
    <section id="signature" aria-labelledby="signature-title" className="theme-ink ink-surface py-28 md:py-40">
      <Reveal className="shell grid-editorial mb-14 gap-y-6 md:mb-20">
        <div className="col-span-12 md:col-span-6">
          <SectionLabel n={5} as="h2">
            <span id="signature-title">Signature pieces</span>
          </SectionLabel>
          <p data-reveal className="heading mt-8 max-w-xl">
            The pieces we are asked for by name.
          </p>
        </div>
        <p data-reveal className="col-span-12 max-w-sm self-end text-muted md:col-span-4 md:col-start-9">
          Each is made to order in the atelier. Prices include taxes, engraving and delivery.
        </p>
      </Reveal>
      <SignatureCarousel cards={cards} label="Signature pieces" />
    </section>
  );
}
