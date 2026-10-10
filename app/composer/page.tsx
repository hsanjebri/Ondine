import type { Metadata } from "next";
import { DESIGNS } from "@/lib/composer-options";
import { getImage, withUtm } from "@/lib/images";
import type { SlotId } from "@/data/image-slots";
import { Composer } from "@/components/composer/Composer";
import type { PhotoCredit } from "@/components/composer/Stage";

export const metadata: Metadata = {
  title: "Compose your piece",
  description:
    "Choose a ring, bracelet, necklace or earrings, then the design, metal, diamonds, size, engraving and box, and see it with its price, made by hand in the Saint-Honoré atelier.",
  alternates: { canonical: "/composer" },
};

/** Photographer credits for each cut-out, resolved on the server. */
function credits() {
  const out: Record<string, PhotoCredit> = {};
  for (const d of DESIGNS) {
    const image = getImage(`cut-${d.id}` as SlotId);
    if (image) {
      out[d.id] = { name: image.photographer.name, profile: withUtm(image.photographer.url), photo: withUtm(image.photoUrl) };
    }
  }
  return out;
}

export default function ComposerPage() {
  return <Composer credits={credits()} />;
}
