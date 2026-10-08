import type { CSSProperties, ReactNode } from "react";
import type { SlotId } from "@/data/image-slots";
import { getImage } from "@/lib/images";
import { cn } from "@/lib/cn";
import { UnsplashImage, type UnsplashImageProps } from "./UnsplashImage";
import { Credit } from "./Credit";
import { Placeholder } from "./Placeholder";

interface PhotoProps extends Omit<UnsplashImageProps, "image" | "className" | "style"> {
  slot: SlotId;
  /** CSS aspect-ratio, e.g. "4 / 5". Omit to fill the parent (absolute). */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  imgStyle?: CSSProperties;
  /** Show "Photo by … on Unsplash" on hover/focus. */
  credit?: boolean;
  /** Overlays inside the frame (corner labels, gradients…). */
  children?: ReactNode;
}

/** A slot-based photo frame: placeholder colour → BlurHash → photo. */
export function Photo({
  slot,
  ratio,
  className,
  imgClassName,
  imgStyle,
  credit = true,
  children,
  ...img
}: PhotoProps) {
  const image = getImage(slot);
  return (
    <div
      className={cn(
        "group/photo overflow-hidden",
        ratio ? "relative w-full" : "absolute inset-0",
        className,
      )}
      style={{
        aspectRatio: ratio,
        backgroundColor: image?.color ?? "var(--ivory-deep)",
        backgroundImage: image ? `url(${image.blurDataURL})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {image ? (
        <UnsplashImage image={image} className={imgClassName} style={imgStyle} {...img} />
      ) : (
        <Placeholder slot={slot} />
      )}
      {children}
      {credit && image ? <Credit image={image} /> : null}
    </div>
  );
}
