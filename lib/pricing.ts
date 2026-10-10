import {
  getDesign,
  type BoxId,
  type ClarityGrade,
  type ColourGrade,
  type Config,
  type DesignId,
  type MetalId,
  type ShapeId,
} from "./composer-options";

/*
 * Composer pricing, in euros, all taxes included.
 * Every number lives in this file so prices can change without touching a
 * component. Calibrated against Paris retail:
 *   solitaire ring, 0.50 ct round G VS2, 18k yellow gold  ≈ € 3,200
 *   solitaire ring, 2.00 ct round D IF, platinum           > € 40,000
 *   tennis bracelet, 2.00 ct total G VS2, 18k white gold   ≈ € 6,000
 */

/** Design and making (labour, findings, setting work), by design. */
export const MAKING: Record<DesignId, number> = {
  "ring-solitaire": 700,
  "ring-halo": 1100,
  "ring-pave": 1050,
  "ring-eternity": 900,
  "bracelet-tennis": 1400,
  "bracelet-bangle": 1600,
  "bracelet-cuff": 1900,
  "necklace-pendant": 900,
  "necklace-goutte": 1100,
  "necklace-riviere": 2200,
  "earrings-studs": 600,
  "earrings-halo": 1000,
  "earrings-hoops": 650,
};

/** Metal for a solitaire ring's weight; scaled by each design's `weight`. */
export const METAL_PRICE: Record<MetalId, number> = {
  yellow: 600,
  rose: 600,
  white: 700, // rhodium finish
  platinum: 1250,
};

/** Price per carat for one round G VS2, by weight bracket (lower bound in ct). */
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

/** Small round brilliants (lines, pavé), per carat for G VS2. */
export const LINE_PER_CARAT = 1900;

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

/** Small stones are less sensitive to grade: factors are softened by this exponent. */
const LINE_GRADE_EXPONENT = 0.6;

/** Accent diamonds of halo and pavé designs (F–G, VS), per centre stone. */
export const ACCENTS = (carat: number) => 650 + 420 * Math.cbrt(carat);

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

export function linePrice(totalCarat: number, colour: ColourGrade, clarity: ClarityGrade) {
  const grade = Math.pow(COLOUR_FACTOR[colour] * CLARITY_FACTOR[clarity], LINE_GRADE_EXPONENT);
  return totalCarat * LINE_PER_CARAT * grade;
}

export interface PriceBreakdown {
  making: number;
  metal: number;
  stones: number;
  accents: number;
  box: number;
  total: number;
}

const round10 = (n: number) => Math.round(n / 10) * 10;

export function price(c: Config): PriceBreakdown {
  const d = getDesign(c.design);
  const pair = c.piece === "earrings" ? 2 : 1;
  const making = MAKING[c.design];
  const metal = METAL_PRICE[c.metal] * d.weight;
  let stones = 0;
  if (d.stone === "centre") stones = pair * stonePrice(c.carat, c.shape, c.colour, c.clarity);
  if (d.stone === "line") stones = linePrice(c.carat, c.colour, c.clarity);
  const accents = d.accents && d.stone === "centre" ? pair * ACCENTS(c.carat) : 0;
  const box = BOX_PRICE[c.box];
  return {
    making: round10(making),
    metal: round10(metal),
    stones: round10(stones),
    accents: round10(accents),
    box,
    total: round10(making + metal + stones + accents + box + ENGRAVING_PRICE),
  };
}
