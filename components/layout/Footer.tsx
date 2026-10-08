import { legalNav, site } from "@/lib/site";
import { Monogram } from "@/components/ui/Monogram";
import { TransitionLink } from "@/components/ui/TransitionLink";

/**
 * Footer — phase 1 version (address, hours, contact, legal).
 * Phase 4 adds the oversized wordmark reveal and the newsletter field.
 */
export function Footer() {
  return (
    <footer className="theme-ink ink-surface relative">
      <div className="shell grid-editorial gap-y-12 pt-24 pb-10">
        <div className="col-span-12 md:col-span-4">
          <Monogram className="h-10 w-auto text-gold" />
          <p className="lead mt-6 max-w-xs text-ivory/90">{site.tagline}</p>
        </div>

        <div className="col-span-6 md:col-span-3">
          <h2 className="micro text-muted">The boutique</h2>
          <address className="mt-4 not-italic leading-relaxed">
            {site.address.line}
            <br />
            <a href={site.phoneHref} className="link-line">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="link-line">
              {site.email}
            </a>
          </address>
        </div>

        <div className="col-span-6 md:col-span-3">
          <h2 className="micro text-muted">Hours</h2>
          <dl className="mt-4 space-y-1 leading-relaxed">
            {site.hours.map((h) => (
              <div key={h.short} className="flex gap-3">
                <dt className="w-16 shrink-0 text-muted">{h.short}</dt>
                <dd>{h.time}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="col-span-12 md:col-span-2">
          <h2 className="micro text-muted">Follow</h2>
          <ul className="mt-4 space-y-1">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} className="link-line" target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-12 flex flex-col gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <p className="mono text-muted">
            © {site.founded}–2026 maison ondine · all pieces made by hand in paris
          </p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {legalNav.map((l) => (
                <li key={l.href}>
                  <TransitionLink href={l.href} className="mono link-line text-muted hover:text-ivory">
                    {l.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
