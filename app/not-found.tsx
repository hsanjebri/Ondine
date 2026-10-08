import { Monogram } from "@/components/ui/Monogram";
import { TransitionLink } from "@/components/ui/TransitionLink";

export default function NotFound() {
  return (
    <section className="theme-ink ink-surface flex min-h-svh flex-col items-center justify-center px-gutter text-center">
      <Monogram className="h-16 w-auto text-gold" />
      <p className="mono mt-10 text-muted">error 404</p>
      <h1 className="heading mt-4">This page was never set.</h1>
      <p className="mt-6 max-w-md text-muted">
        The link may be old, or the piece may have found its owner.
      </p>
      <TransitionLink href="/" className="btn mt-10">
        Return to the house
      </TransitionLink>
    </section>
  );
}
