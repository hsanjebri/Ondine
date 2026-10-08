import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LegalPage } from "@/components/layout/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy"
      intro="What we keep about you, why, and for how long. We keep as little as we can."
      sections={[
        {
          title: "What we collect",
          body: (
            <p>
              Your name, email and telephone when you book an appointment or join the newsletter, and the
              details of any order. Your bag and the ring you compose are stored only in your own browser.
            </p>
          ),
        },
        {
          title: "Why",
          body: (
            <p>
              To prepare your appointment, to answer you, to make and deliver your piece, and, if you ask
              for it, to write to you a few times a year.
            </p>
          ),
        },
        {
          title: "How long",
          body: (
            <p>
              Appointment requests: one year. Orders: as long as accounting law requires. Newsletter: until
              you unsubscribe.
            </p>
          ),
        },
        {
          title: "Your rights",
          body: (
            <p>
              You may access, correct or delete your data, or object to its use, by writing to{" "}
              {site.email}. You may also complain to the CNIL (cnil.fr).
            </p>
          ),
        },
      ]}
    />
  );
}
