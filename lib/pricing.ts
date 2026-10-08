import type { BoxId, ClarityGrade, ColourGrade, MetalId, RingConfig, SettingId, ShapeId } from "./composer-options";

/*
 * Ring composer pricing, in euros, all taxes included.
 * Every number lives in this file so prices can change without touching a
 * component. Calibrated against Paris retail:
 *   0.50 ct round, G VS2, 18k gold solitaire   ≈ € 3,200
 *   2.00 ct round, D IF, platinum solitaire    > € 40,000
 */

/** Design and making of the setting (labour, head, gallery). */
export const SETTING_BASE: Record<SettingId, number> = {
  solitaire: 700,
  halo: 1100,
  trilogy: 950,
  pave: 1050,
};

/** Metal for band and head. */
export const METAL_PRICE: Record<MetalId, number> = {
  yellow: 600,
  rose: 600,
  white: 700, // rhodium finish
  platinum: 1250,
};

/** Price per carat for a round G VS2, by weight bracket (lower bound in ct). */
export const PER_CARAT: Array<[minCarat: number, euros: number]> = [
  [0.3, 2600],
  [0.5, 3800],
  [0.7, 4800],
  [0.9, 6000],
  [1.0, 8500],
  [1.5, 11000],
  [2.0, 15000],
  [3.0, 19000],
];

export const COLOUR_FACTOR: Record<ColourGrade, number> = { D: 1.45, E: 1.3, F: 1.18, G: 1.0, H: 0.88 };

export const CLARITY_FACTOR: Record<ClarityGrade, number> = {
  IF: 1.6,
  VVS1: 1.38,
  VVS2: 1.26,
  VS1: 1.12,
  VS2: 1.0,
  SI1: 0.84,
};

/** Fancy shapes trade below rounds of the same weight and grade. */
export const SHAPE_FACTOR: Record<ShapeId, number> = {
  round: 1,
  oval: 0.86,
  princess: 0.78,
  emerald: 0.8,
  pear: 0.84,
  cushion: 0.8,
};

/** Accent diamonds (F–G, VS), by setting. */
export const ACCENTS = {
  /** Halo stones scale with the circumference of the centre stone. */
  halo: (carat: number) => 650 + 420 * Math.cbrt(carat),
  /** Two side stones of a quarter of the centre weight each. */
  trilogyRatio: 0.25,
  pave: 1200,
} as const;

export const BOX_PRICE: Record<BoxId, number> = { leather: 0, velvet: 90, oak: 240 };

/** Engraving and sizing are complimentary. */
export const ENGRAVING_PRICE = 0;

function perCarat(carat: number) {
  let price = PER_CARAT[0][1];
  for (const [min, euros] of PER_CARAT) if (carat >= min - 1e-9) price = euros;
  return price;
}

export function stonePrice(carat: number, shape: ShapeId, colour: ColourGrade, clarity: ClarityGrade) {
  return carat * perCarat(carat) * SHAPE_FACTOR[shape] * COLOUR_FACTOR[colour] * CLARITY_FACTOR[clarity];
}

export interface PriceBreakdown {
  setting: number;
  metal: number;
  stone: number;
  accents: number;
  box: number;
  total: number;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

export function priceRing(c: RingConfig): PriceBreakdown {
  const setting = SETTING_BASE[c.setting];
  const metal = METAL_PRICE[c.metal];
  const stone = stonePrice(c.carat, c.shape, c.colour, c.clarity);
  let accents = 0;
  if (c.setting === "halo") accents = ACCENTS.halo(c.carat);
  if (c.setting === "pave") accents = ACCENTS.pave;
  if (c.setting === "trilogy") {
    const side = c.carat * ACCENTS.trilogyRatio;
    accents = 2 * stonePrice(side, "round", c.colour, c.clarity);
  }
  const box = BOX_PRICE[c.box];
  const parts = { setting, metal, stone, accents, box };
  const total = round10(setting + metal + stone + accents + box + ENGRAVING_PRICE);
  return {
    setting: round10(parts.setting),
    metal: round10(parts.metal),
    stone: round10(parts.stone),
    accents: round10(parts.accents),
    box: parts.box,
    total,
  };
}
