/**
 * Every choice in the ring composer. Shared by the panel, the 3D scene,
 * the 2D fallback, pricing and the shareable URL — edit labels here.
 */

export const SETTINGS = [
  { id: "solitaire", label: "Solitaire", note: "One stone, six claws, nothing else." },
  { id: "halo", label: "Halo", note: "A ring of small diamonds around the centre stone." },
  { id: "trilogy", label: "Trilogy", note: "A centre stone between two smaller ones." },
  { id: "pave", label: "Pavé band", note: "Small diamonds set along the upper band." },
] as const;

export const METALS = [
  { id: "yellow", label: "18k yellow gold", short: "Yellow gold", color: "#E3BC74", roughness: 0.17, swatch: "linear-gradient(135deg,#8a6a2e,#e8c27e 45%,#f6e2b0 55%,#b8903f)" },
  { id: "rose", label: "18k rose gold", short: "Rose gold", color: "#E2A88E", roughness: 0.19, swatch: "linear-gradient(135deg,#8c5a46,#e2a88e 45%,#f4d2c2 55%,#b97b63)" },
  { id: "white", label: "18k white gold", short: "White gold", color: "#DCDCD8", roughness: 0.13, swatch: "linear-gradient(135deg,#7e7e7b,#d9d9d5 45%,#f7f7f4 55%,#a9a9a5)" },
  { id: "platinum", label: "Platinum", short: "Platinum", color: "#C9CACE", roughness: 0.21, swatch: "linear-gradient(135deg,#6f7074,#c4c5c9 45%,#ecedf0 55%,#98999d)" },
] as const;

export const SHAPES = [
  { id: "round", label: "Round brilliant" },
  { id: "oval", label: "Oval" },
  { id: "princess", label: "Princess" },
  { id: "emerald", label: "Emerald" },
  { id: "pear", label: "Pear" },
  { id: "cushion", label: "Cushion" },
] as const;

/** Colour grades, best first */
export const COLOURS = ["D", "E", "F", "G", "H"] as const;
/** Clarity grades, best first */
export const CLARITIES = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"] as const;

export const CARAT = { min: 0.3, max: 3, step: 0.05 } as const;

/** EU ring sizes = inner circumference in millimetres */
export const SIZES = Array.from({ length: 17 }, (_, i) => 46 + i);

export const BOXES = [
  { id: "leather", label: "Classic leather", note: "Ink calfskin, gold monogram. Included." },
  { id: "velvet", label: "Velvet", note: "Midnight velvet over oak, ivory satin inside." },
  { id: "oak", label: "Oak travel case", note: "Solid oak, felt-lined, for a ring that travels." },
] as const;

export const ENGRAVING_MAX = 20;

export type SettingId = (typeof SETTINGS)[number]["id"];
export type MetalId = (typeof METALS)[number]["id"];
export type ShapeId = (typeof SHAPES)[number]["id"];
export type ColourGrade = (typeof COLOURS)[number];
export type ClarityGrade = (typeof CLARITIES)[number];
export type BoxId = (typeof BOXES)[number]["id"];

export interface RingConfig {
  setting: SettingId;
  metal: MetalId;
  shape: ShapeId;
  carat: number;
  colour: ColourGrade;
  clarity: ClarityGrade;
  /** EU size, or null when the client does not know it yet */
  size: number | null;
  engraving: string;
  box: BoxId;
}

export const DEFAULT_CONFIG: RingConfig = {
  setting: "solitaire",
  metal: "yellow",
  shape: "round",
  carat: 0.5,
  colour: "G",
  clarity: "VS2",
  size: 52,
  engraving: "",
  box: "leather",
};

export const STEPS = [
  { id: "setting", label: "Setting" },
  { id: "metal", label: "Metal" },
  { id: "stone", label: "Stone" },
  { id: "size", label: "Size" },
  { id: "engraving", label: "Engraving" },
  { id: "box", label: "Box" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

export const label = {
  setting: (id: SettingId) => SETTINGS.find((s) => s.id === id)!.label,
  metal: (id: MetalId) => METALS.find((m) => m.id === id)!.label,
  shape: (id: ShapeId) => SHAPES.find((s) => s.id === id)!.label,
  box: (id: BoxId) => BOXES.find((b) => b.id === id)!.label,
};

/** Clamp and round a carat value to the slider's grid. */
export function snapCarat(v: number) {
  const c = Math.min(CARAT.max, Math.max(CARAT.min, v));
  return Math.round(c / CARAT.step) * CARAT.step;
}

/** One-line description, e.g. for the bag: "Solitaire · 0.50 ct round · G VS2 · 18k yellow gold · size 52" */
export function describe(c: RingConfig) {
  return [
    label.setting(c.setting),
    `${c.carat.toFixed(2)} ct ${label.shape(c.shape).toLowerCase()}`,
    `${c.colour} ${c.clarity}`,
    label.metal(c.metal),
    c.size ? `size ${c.size}` : "size to confirm",
  ].join(" · ");
}
