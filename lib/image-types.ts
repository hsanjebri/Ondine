export interface ImageRecord {
  slot: string;
  /** Unsplash photo id */
  id: string;
  /** `urls.raw` — resized on the fly with imgix params, never downloaded */
  raw: string;
  width: number;
  height: number;
  color: string;
  blurHash: string | null;
  /** Tiny PNG decoded from the BlurHash, used as next/image placeholder */
  blurDataURL: string;
  alt: string;
  photographer: { name: string; username: string; url: string };
  /** Photo page on unsplash.com */
  photoUrl: string;
  query: string;
  downloadTracked: boolean;
}

export interface ImagesFile {
  generatedAt: string | null;
  source: "unsplash";
  slots: Record<string, ImageRecord>;
}
