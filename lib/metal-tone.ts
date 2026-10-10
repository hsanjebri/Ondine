import cutouts from "@/data/cutouts.json";
import type { ColourGrade, MetalId } from "./composer-options";

/*
 * Re-toning a photographed piece into another metal.
 * The original photograph stays underneath; a toned copy is drawn on top
 * through the piece's metal mask (public/cutouts/<id>-metal.webp), so the
 * gold changes colour while the diamonds stay white. Every recipe uses the
 * same functions in the same order, so the browser interpolates between
 * metals.
 */

const RECIPES: Record<MetalId, string> = {
  yellow: "grayscale(1) sepia(0.72) saturate(1.65) hue-rotate(2deg) brightness(1.04) contrast(1.05)",
  rose: "grayscale(1) sepia(0.62) saturate(1.45) hue-rotate(-20deg) brightness(1.04) contrast(1.03)",
  white: "grayscale(1) sepia(0) saturate(1) hue-rotate(0deg) brightness(1.05) contrast(1.06)",
  platinum: "grayscale(1) sepia(0.04) saturate(0.6) hue-rotate(170deg) brightness(0.97) contrast(1.09)",
};

interface CutoutRecord {
  metal: string | null;
  metalMask?: string;
}

const CUT = cutouts as Record<string, CutoutRecord>;

/** The metal a cut-out was photographed in ("mixed" for several golds). */
export function sourceMetal(cutout: string): MetalId | "mixed" {
  return (CUT[cutout]?.metal ?? "white") as MetalId | "mixed";
}

/** The layer to draw over the photograph, or null when it is already in that metal. */
export function metalTone(cutout: string, metal: MetalId | null) {
  const mask = CUT[cutout]?.metalMask;
  const active = Boolean(mask) && metal !== null && sourceMetal(cutout) !== metal;
  return { filter: metal ? RECIPES[metal] : "none", mask: mask ?? null, active };
}

/** A faint warmth for lower colour grades on the loose stone. */
const STONE_SEPIA: Record<ColourGrade, number> = { D: 0, E: 0.03, F: 0.06, G: 0.1, H: 0.17 };

export function stoneFilter(colour: ColourGrade) {
  return `sepia(${STONE_SEPIA[colour]}) saturate(${1 + STONE_SEPIA[colour] * 2})`;
}
