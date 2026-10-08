import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Legal notice",
  alternates: { canonical: "/legal-notice" },
};

export default function LegalNoticePage() {
  return (
    <LegalPage
      title="Legal notice"
      intro="Who publishes this website, who hosts it, and who owns what you see on it."
      sections={[
        {
          title: "Publisher",
          body: (
            <>
              <p>
                {site.name}, independent jewellery house. Registered office: {site.address.line}. Company
                registration, share capital and VAT number to be completed.
              </p>
              <p>
                Telephone {site.phone} · {site.email}
              </p>
            </>
          ),
        },
        {
          title: "Director of publication",
          body: <p>The founder of {site.name}. Name to be completed.</p>,
        },
        {
          title: "Hosting",
          body: <p>Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, United States.</p>,
        },
        {
          title: "Intellectual property",
          body: (
            <p>
              The name, monogram, texts and designs on this site belong to {site.name}. Photographs are
              credited to their authors on the Credits page. No reproduction without written permission.
            </p>
          ),
        },
      ]}
    />
  );
}
