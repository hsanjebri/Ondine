import { signaturePieces } from "@/data/products";
import { Reveal } from "@/components/motion/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { ProductCard } from "@/components/shop/ProductCard";
import { SignatureCarousel } from "./SignatureCarousel";

/** 05 — Signature pieces: a horizontal, draggable catalogue. */
export function SignaturePieces() {
  const cards = signaturePieces.map((p, i) => (
    <div key={p.slug} className="sp-card will-change-transform">
      <ProductCard product={p} dark index={i} />
    </div>
  ));

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
      <div className="shell mt-12">
        <TransitionLink href="/jewellery" className="micro link-line text-ivory">
          See all the jewellery
        </TransitionLink>
      </div>
    </section>
  );
}
