import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Cookies",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      intro="This site sets no advertising or tracking cookies."
      sections={[
        {
          title: "What is stored",
          body: (
            <p>
              Your bag and the ring you compose are kept in your browser&apos;s local storage so they are
              still there when you return. Nothing is sent to us until you place an order or book an
              appointment.
            </p>
          ),
        },
        {
          title: "Third parties",
          body: (
            <p>
              Photographs load from Unsplash, which receives the technical information any image request
              carries (address and browser). Fonts are served from this site.
            </p>
          ),
        },
        {
          title: "Clearing it",
          body: <p>You can clear local storage at any time from your browser settings.</p>,
        },
      ]}
    />
  );
}
