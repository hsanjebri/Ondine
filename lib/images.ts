import imagesFile from "@/data/images.json";
import { IMAGE_SLOTS, type SlotId } from "@/data/image-slots";
import type { ImageRecord, ImagesFile } from "./image-types";

export type { ImageRecord } from "./image-types";

const file = imagesFile as ImagesFile;

/** Read-only access to the cached Unsplash selection (build time only). */
export function getImage(slot: SlotId): ImageRecord | null {
  return file.slots[slot] ?? null;
}

export function getSlot(slot: SlotId) {
  return IMAGE_SLOTS.find((s) => s.id === slot)!;
}

/** Every distinct photo in use, for the credits page. */
export function getAllImages(): ImageRecord[] {
  const seen = new Set<string>();
  return IMAGE_SLOTS.flatMap((s) => {
    const r = file.slots[s.id];
    if (!r || seen.has(r.id)) return [];
    seen.add(r.id);
    return [r];
  });
}

export const imagesGeneratedAt = file.generatedAt;

const UTM = "utm_source=maison_ondine&utm_medium=referral";

/** Unsplash requires referral params on every attribution link. */
export function withUtm(url: string) {
  return url + (url.includes("?") ? "&" : "?") + UTM;
}

export const UNSPLASH_HOME = withUtm("https://unsplash.com/");
