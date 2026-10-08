import type { Metadata } from "next";
import { IMAGE_SLOTS, type SlotId } from "@/data/image-slots";
import { getAllImages, imagesGeneratedAt, UNSPLASH_HOME, withUtm } from "@/lib/images";
import { pad } from "@/lib/format";
import { films } from "@/data/media";
import { Photo } from "@/components/media/Photo";
import { SectionLabel } from "@/components/ui/SectionLabel";

export const metadata: Metadata = {
  title: "Credits",
  description: "Photography and film credits for the Maison Ondine website.",
  alternates: { canonical: "/credits" },
};

export default function CreditsPage() {
  const images = getAllImages();

  return (
    <div className="shell pt-[calc(var(--header-h)+4rem)] pb-32">
      <SectionLabel n={1}>Credits</SectionLabel>
      <h1 className="display mt-8 max-w-4xl">With thanks to the photographers.</h1>
      <p className="lead mt-8 max-w-2xl text-muted">
        Until the house&apos;s own photography is complete, the images on this site are
        by photographers on{" "}
        <a href={UNSPLASH_HOME} target="_blank" rel="noopener noreferrer" className="link-line text-fg">
          Unsplash
        </a>
        . Each is listed below with a link to its author.
      </p>

      {images.length === 0 ? (
        <p className="mono mt-16 text-muted">
          no photographs selected yet — {IMAGE_SLOTS.length} slots are waiting for the seed script.
        </p>
      ) : (
        <ol className="mt-20 divide-y divide-line border-y border-line">
          {images.map((img, i) => (
            <li key={img.id} className="grid grid-cols-[4.5rem_1fr] items-center gap-5 py-5 md:grid-cols-[3rem_6rem_1fr_auto] md:gap-8">
              <span className="mono hidden text-muted md:block">pl. {pad(i + 1)}</span>
              <div className="relative w-[4.5rem] md:w-24">
                <Photo slot={img.slot as SlotId} ratio="4 / 5" sizes="96px" credit={false} />
              </div>
              <div className="min-w-0">
                <p className="text-[0.95rem] leading-snug">{img.alt}</p>
                <p className="mt-1 text-sm text-muted">
                  Photo by{" "}
                  <a
                    href={withUtm(img.photographer.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-line text-fg"
                  >
                    {img.photographer.name}
                  </a>{" "}
                  on{" "}
                  <a href={UNSPLASH_HOME} target="_blank" rel="noopener noreferrer" className="link-line text-fg">
                    Unsplash
                  </a>
                </p>
              </div>
              <a
                href={withUtm(img.photoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="mono link-line col-start-2 justify-self-start text-muted md:col-start-auto md:justify-self-end"
              >
                view photo ↗
              </a>
            </li>
          ))}
        </ol>
      )}

      <section className="mt-24 max-w-2xl">
        <h2 className="micro">Film</h2>
        <ul className="mt-4 space-y-4">
          {films.map((f) => (
            <li key={f.slot} className="text-muted">
              <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="link-line text-fg">
                {f.title}
              </a>{" "}
              by{" "}
              <a href={f.authorUrl} target="_blank" rel="noopener noreferrer" className="link-line text-fg">
                {f.author}
              </a>{" "}
              on Pexels, under the{" "}
              <a href={f.licenceUrl} target="_blank" rel="noopener noreferrer" className="link-line text-fg">
                {f.licence}
              </a>
              . {f.edit}
            </li>
          ))}
        </ul>
        {imagesGeneratedAt ? (
          <p className="mono mt-10 text-muted">selection made {imagesGeneratedAt.slice(0, 10)}</p>
        ) : null}
      </section>
    </div>
  );
}
