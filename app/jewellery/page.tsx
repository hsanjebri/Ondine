import type { Metadata } from "next";
import { products } from "@/data/products";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { Catalogue } from "@/components/shop/Catalogue";

export const metadata: Metadata = {
  title: "Jewellery",
  description:
    "Rings, bracelets, necklaces and earrings made by hand in the Saint-Honoré atelier. Browse every piece, in every metal.",
  alternates: { canonical: "/jewellery" },
};

export default function JewelleryPage() {
  return (
    <div className="shell pt-[calc(var(--header-h)+3rem)] pb-32 md:pt-[calc(var(--header-h)+5rem)]">
      <header className="grid-editorial mb-12 gap-y-6 md:mb-16">
        <div className="col-span-12 md:col-span-7">
          <SectionLabel n={7} as="p">
            The catalogue
          </SectionLabel>
          <h1 className="display mt-6">Jewellery</h1>
        </div>
        <div className="col-span-12 self-end md:col-span-4 md:col-start-9">
          <p className="text-muted">
            {products.length} pieces, each made to order in the atelier. Choose the metal on any piece to see it
            as it will be made.
          </p>
          <TransitionLink href="/composer" className="micro link-line mt-5 inline-block">
            Or compose your own
          </TransitionLink>
        </div>
      </header>
      <Catalogue />
    </div>
  );
}
