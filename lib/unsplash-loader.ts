import type { ImageLoaderProps } from "next/image";

/**
 * Hotlinks images.unsplash.com directly (required by the Unsplash API
 * guidelines) while keeping next/image's responsive srcset. `urls.raw`
 * already carries the `ixid` param, which must be preserved.
 * `auto=format` lets imgix serve AVIF (or WebP) to browsers that accept it.
 */
export function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("w", String(Math.min(width, 2560)));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "crop");
  return url.toString();
}
