"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { ImageRecord } from "@/lib/image-types";
import { unsplashLoader } from "@/lib/unsplash-loader";
import { cn } from "@/lib/cn";

export interface UnsplashImageProps {
  image: ImageRecord;
  /** Required: how wide the image renders at each breakpoint. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  quality?: 70 | 75 | 85;
  /** LCP image: preload in <head>, no fade-in, counted by the preloader. */
  critical?: boolean;
  /** Override the stored alt (e.g. decorative duplicates → ""). */
  alt?: string;
}

/**
 * next/image hotlinked from images.unsplash.com. Fills its positioned
 * parent; the parent shows the BlurHash placeholder until the photo fades in.
 */
export function UnsplashImage({
  image,
  sizes,
  className,
  style,
  quality = 75,
  critical = false,
  alt,
}: UnsplashImageProps) {
  const [loaded, setLoaded] = useState(critical);
  return (
    <Image
      loader={unsplashLoader}
      src={image.raw}
      alt={alt ?? image.alt}
      fill
      sizes={sizes}
      quality={quality}
      preload={critical}
      data-critical={critical || undefined}
      onLoad={() => setLoaded(true)}
      className={cn(
        "object-cover",
        !critical && "transition-opacity duration-[900ms] ease-ondine",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
      style={style}
    />
  );
}
