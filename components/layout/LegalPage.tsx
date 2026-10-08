import type { ReactNode } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

export interface LegalSection {
  title: string;
  body: ReactNode;
}

/** Shared layout for the placeholder legal pages. */
export function LegalPage({
  title,
  intro,
  sections,
  updated = "October 2026",
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
  updated?: string;
}) {
  return (
    <article className="shell pt-[calc(var(--header-h)+4rem)] pb-32">
      <SectionLabel n={1}>Legal</SectionLabel>
      <h1 className="display mt-8">{title}</h1>
      <p className="lead mt-8 max-w-2xl text-muted">{intro}</p>
      <p className="mono mt-6 text-muted">
        placeholder text — to be reviewed by counsel · last updated {updated.toLowerCase()}
      </p>
      <div className="mt-20 max-w-3xl divide-y divide-line border-t border-line">
        {sections.map((s, i) => (
          <section key={s.title} className="grid gap-4 py-10 md:grid-cols-[4rem_1fr]">
            <span className="mono text-accent">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="subheading">{s.title}</h2>
              <div className="mt-4 space-y-4 text-muted">{s.body}</div>
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
