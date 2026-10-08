import type { ImageRecord } from "@/lib/image-types";
import { UNSPLASH_HOME, withUtm } from "@/lib/images";

/**
 * Unsplash attribution, revealed on hover or keyboard focus of the frame.
 * Every photo is also listed on /credits.
 */
const REVEAL = {
  photo:
    "group-hover/photo:pointer-events-auto group-hover/photo:translate-y-0 group-hover/photo:opacity-100",
  card: "group-hover/card:pointer-events-auto group-hover/card:translate-y-0 group-hover/card:opacity-100",
} as const;

/**
 * `on`: which hovered ancestor reveals it — the photo frame (default) or a
 * whole card. Cards that are links render the credit outside the link (no
 * nested anchors) and reveal it on card hover.
 */
export function Credit({ image, on = "photo" }: { image: ImageRecord; on?: keyof typeof REVEAL }) {
  return (
    <p
      className={`mono pointer-events-none absolute right-2 bottom-2 z-10 translate-y-1 rounded-[2px] bg-black/55 px-2 py-1 text-ivory/90 opacity-0 backdrop-blur-sm transition duration-300 ease-ondine focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100 ${REVEAL[on]}`}
    >
      photo by{" "}
      <a
        href={withUtm(image.photographer.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-ivory/40 underline-offset-2 hover:decoration-ivory"
      >
        {image.photographer.name}
      </a>{" "}
      on{" "}
      <a
        href={UNSPLASH_HOME}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-ivory/40 underline-offset-2 hover:decoration-ivory"
      >
        unsplash
      </a>
    </p>
  );
}
