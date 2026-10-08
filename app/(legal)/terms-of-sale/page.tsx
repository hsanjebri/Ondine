import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Terms of sale",
  alternates: { canonical: "/terms-of-sale" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of sale"
      intro="The conditions under which the house sells its pieces, online and in the boutique."
      sections={[
        {
          title: "Prices",
          body: (
            <p>
              Prices are shown in euros, all taxes included. Delivery within the European Union and
              engraving are complimentary. The price confirmed at checkout is the price you pay.
            </p>
          ),
        },
        {
          title: "Orders and payment",
          body: (
            <p>
              An order is confirmed by email once payment is accepted. Online payment is not yet open;
              until then, orders are taken in the boutique or by appointment.
            </p>
          ),
        },
        {
          title: "Made to order",
          body: (
            <p>
              Rings composed in the composer, engraved pieces and resized pieces are made to your
              specification in the atelier. Making takes the time shown with each piece.
            </p>
          ),
        },
        {
          title: "Right of withdrawal",
          body: (
            <p>
              You have fourteen days from delivery to return a piece from the collection, unworn and in
              its box. Pieces made to your specification are excluded, as French consumer law allows.
            </p>
          ),
        },
        {
          title: "Guarantees",
          body: (
            <p>
              Every piece carries the legal guarantee of conformity for two years and the guarantee
              against hidden defects. The atelier also cleans and checks settings free of charge for
              life. Contact {site.email}.
            </p>
          ),
        },
      ]}
    />
  );
}
