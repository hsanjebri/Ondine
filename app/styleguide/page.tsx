import type { Metadata } from "next";
import { IMAGE_SLOTS } from "@/data/image-slots";
import { formatEuro } from "@/lib/format";
import { imagesGeneratedAt } from "@/lib/images";
import { CornerFrame } from "@/components/media/CornerFrame";
import { Photo } from "@/components/media/Photo";
import { Plate } from "@/components/media/Plate";
import { Foil } from "@/components/ui/Foil";
import { Monogram } from "@/components/ui/Monogram";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Style sheet",
  robots: { index: false, follow: false },
};

const swatches = [
  { name: "Ivory", hex: "#F6F1EA", className: "bg-ivory text-ink", note: "Paper, primary surface" },
  { name: "Ink", hex: "#14110F", className: "bg-ink text-ivory", note: "Text — 16.7:1 on ivory" },
  { name: "Black", hex: "#0B0A09", className: "bg-black text-ivory", note: "Dark sections" },
  { name: "Champagne", hex: "#B89B6A", className: "bg-gold text-black", note: "Accent, large text only on ivory" },
  { name: "Gold deep", hex: "#7D6538", className: "bg-gold-deep text-ivory", note: "Gold text on ivory — 4.9:1" },
  { name: "Diamond", hex: "#DCE6EE", className: "bg-diamond text-ink", note: "Cool accent" },
];

const type = [
  { label: "display-xl · Cormorant 300", className: "display-xl", text: "Light, held" },
  { label: "display", className: "display", text: "Held forever" },
  { label: "heading", className: "heading", text: "From stone to ring" },
  { label: "subheading", className: "subheading", text: "Solitaire, 18k yellow gold" },
  { label: "lead · Cormorant 400", className: "lead", text: "Every piece is designed, set and polished by hand in the atelier behind the boutique." },
  { label: "body · Manrope 400", className: "text-base max-w-xl", text: "The stone is chosen first. Then the setting is drawn around it, so the metal holds the light rather than the other way round." },
  { label: "micro · Manrope 500, tracked uppercase", className: "micro", text: "Book a private appointment" },
  { label: "smallcaps · names and prices", className: "smallcaps", text: `Aube solitaire — ${formatEuro(4900)}` },
  { label: "mono · IBM Plex Mono 400", className: "mono", text: "atelier saint-honoré — pl. 04" },
  { label: "wordmark", className: "wordmark text-sm", text: "Maison Ondine" },
];

export default function StyleguidePage() {
  return (
    <div className="pt-[calc(var(--header-h)+4rem)]">
      <header className="shell pb-20">
        <p className="mono text-muted">internal — not indexed</p>
        <h1 className="display mt-6">Style sheet</h1>
        <p className="lead mt-6 max-w-2xl text-muted">
          Tokens, type, foil, plates and cursor zones. Everything on the site is built from this page.
        </p>
      </header>

      {/* 01 — Palette */}
      <section className="shell border-t border-line py-20">
        <SectionLabel n={1} as="h2">
          Palette
        </SectionLabel>
        <ul className="mt-10 grid grid-cols-2 gap-px bg-line md:grid-cols-3 xl:grid-cols-6">
          {swatches.map((s) => (
            <li key={s.hex} className={`${s.className} flex aspect-[4/5] flex-col justify-between p-5`}>
              <span className="micro">{s.name}</span>
              <span>
                <span className="mono block">{s.hex.toLowerCase()}</span>
                <span className="mt-1 block text-xs opacity-80">{s.note}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* 02 — Type */}
      <section className="shell border-t border-line py-20">
        <SectionLabel n={2} as="h2">
          Type
        </SectionLabel>
        <ul className="mt-10 divide-y divide-line">
          {type.map((t) => (
            <li key={t.label} className="grid gap-4 py-8 md:grid-cols-[14rem_1fr] md:items-baseline">
              <span className="mono text-muted">{t.label}</span>
              <p className={t.className}>{t.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 03 — Foil & monogram */}
      <section className="theme-ink ink-surface py-24">
        <div className="shell">
          <SectionLabel n={3} as="h2">
            Gold foil &amp; monogram
          </SectionLabel>
          <div className="mt-14 grid items-center gap-16 md:grid-cols-[1fr_auto]">
            <p className="display-xl">
              <Foil className="pb-[0.08em]">Maison Ondine</Foil>
            </p>
            <Monogram className="h-40 w-auto text-gold" title="Maison Ondine monogram" />
          </div>
          <p className="mono mt-10 text-muted">hover the wordmark — the sheen sweeps again</p>
        </div>
      </section>

      {/* 04 — Plates & frames */}
      <section className="shell border-t border-line py-20">
        <SectionLabel n={4} as="h2">
          Plates &amp; frames
        </SectionLabel>
        <div className="mt-10 grid-editorial gap-y-14">
          <figure className="col-span-12 md:col-span-5">
            <Photo slot="ring-02" ratio="3 / 4" sizes="(min-width: 768px) 40vw, 100vw" />
            <Plate n={3}>Solitaire, 18k yellow gold</Plate>
          </figure>
          <figure className="col-span-12 md:col-span-6 md:col-start-7 md:mt-40">
            <Photo slot="hand-01" ratio="4 / 5" sizes="(min-width: 768px) 50vw, 100vw" />
            <Plate n={4}>Band, 18k rose gold, worn</Plate>
          </figure>
        </div>
        <figure className="relative mt-20 aspect-[16/9] w-full overflow-hidden">
          <Photo slot="ring-01" sizes="100vw" quality={85}>
            <CornerFrame br="pl. 05" />
          </Photo>
        </figure>
      </section>

      {/* 05 — Cursor zones */}
      <section className="shell border-t border-line py-20">
        <SectionLabel n={5} as="h2">
          Cursor
        </SectionLabel>
        <p className="mt-6 max-w-xl text-muted">
          Dot and ring on fine pointers only. Any element with a <code className="mono">data-cursor</code>{" "}
          attribute grows the ring and shows its label.
        </p>
        <div className="mt-10 grid gap-px bg-line md:grid-cols-3">
          {["view", "drag", "rotate"].map((label) => (
            <div
              key={label}
              data-cursor={label}
              className="flex aspect-[4/3] items-center justify-center bg-ivory-deep"
            >
              <span className="mono text-muted">data-cursor=&quot;{label}&quot;</span>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <button type="button" className="btn">
            Compose your ring
          </button>
          <button type="button" className="btn-ghost">
            Book an appointment
          </button>
          <a href="#main" className="micro link-line self-center">
            A quiet link
          </a>
        </div>
      </section>

      {/* 06 — Image slots */}
      <section className="shell border-t border-line py-20">
        <SectionLabel n={6} as="h2">
          Image slots
        </SectionLabel>
        <p className="mono mt-6 text-muted">
          {imagesGeneratedAt ? `unsplash selection — ${imagesGeneratedAt.slice(0, 10)}` : "not fetched yet — run npm run seed:images"}
        </p>
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 xl:grid-cols-6">
          {IMAGE_SLOTS.map((s, i) => (
            <li key={s.id}>
              <figure>
                <Photo slot={s.id} ratio="4 / 5" sizes="(min-width: 1280px) 16vw, (min-width: 768px) 25vw, 50vw" />
                <Plate n={i + 1}>
                  <span className="mono text-fg">{s.id}</span>
                  <span className="mt-1 block text-xs">{s.purpose}</span>
                </Plate>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
