import cutouts from "@/data/cutouts.json";

/**
 * Every choice in the composer. Shared by the panel, the photo stage,
 * pricing, the bag and the shareable URL — edit labels here.
 *
 * Each design is shown with a real photograph whose background has been
 * removed (public/cutouts, see MEDIA.md); the metal is re-toned live.
 */

export const PIECES = [
  { id: "ring", label: "Ring", note: "Engagement, eternity and everyday rings." },
  { id: "bracelet", label: "Bracelet", note: "Tennis lines, bangles and cuffs." },
  { id: "necklace", label: "Necklace", note: "Pendants and rivières, closed by hand." },
  { id: "earrings", label: "Earrings", note: "Studs and hoops, sold as a pair." },
] as const;

export type PieceId = (typeof PIECES)[number]["id"];

/**
 * How a design carries its diamonds:
 *   centre — one chosen stone (shape, weight, colour, clarity); earrings: one per ear
 *   line   — a line of round brilliants, priced on total weight
 *   none   — all metal
 */
export type StoneMode = "centre" | "line" | "none";

export const DESIGNS = [
  { id: "ring-solitaire", name: "Solitaire ring", piece: "ring", label: "Solitaire", note: "One stone, six claws, nothing else.", stone: "centre", accents: 0, weight: 1 },
  { id: "ring-halo", name: "Halo ring", piece: "ring", label: "Halo", note: "A crown of small diamonds around the centre stone.", stone: "centre", accents: 1, weight: 1.1 },
  { id: "ring-pave", name: "Pavé ring", piece: "ring", label: "Pavé", note: "The centre stone on a band set with small diamonds.", stone: "centre", accents: 1, weight: 1.05 },
  { id: "ring-eternity", name: "Eternity band", piece: "ring", label: "Eternity", note: "Diamonds all along the band, in milgrain bezels.", stone: "line", accents: 0, weight: 1 },
  { id: "bracelet-tennis", name: "Tennis bracelet", piece: "bracelet", label: "Tennis", note: "A supple line of claw-set brilliants.", stone: "line", accents: 0, weight: 2.4 },
  { id: "bracelet-bangle", name: "Diamond bangle", piece: "bracelet", label: "Bangle", note: "A rigid round, set all the way around.", stone: "line", accents: 0, weight: 3.2 },
  { id: "bracelet-cuff", name: "Engraved cuff", piece: "bracelet", label: "Cuff", note: "An open cuff, engraved and pavé-set.", stone: "line", accents: 0, weight: 4.5 },
  { id: "necklace-pendant", name: "Halo pendant", piece: "necklace", label: "Halo pendant", note: "A cushion halo on a fine box chain.", stone: "centre", accents: 1, weight: 1.3 },
  { id: "necklace-goutte", name: "Goutte pendant", piece: "necklace", label: "Goutte", note: "The house drop, outlined in small diamonds.", stone: "line", accents: 0, weight: 1.6 },
  { id: "necklace-riviere", name: "Rivière necklace", piece: "necklace", label: "Rivière", note: "A double line of brilliants, worn close.", stone: "line", accents: 0, weight: 2.8 },
  { id: "earrings-studs", name: "Stud earrings", piece: "earrings", label: "Studs", note: "One stone each side, four claws.", stone: "centre", accents: 0, weight: 0.5 },
  { id: "earrings-halo", name: "Halo stud earrings", piece: "earrings", label: "Halo studs", note: "Each stone ringed with small diamonds.", stone: "centre", accents: 1, weight: 0.6 },
  { id: "earrings-hoops", name: "Hoop earrings", piece: "earrings", label: "Hoops", note: "Three gold rings twisted into one.", stone: "none", accents: 0, weight: 1.4 },
] as const satisfies ReadonlyArray<{
  id: keyof typeof cutouts;
  /** Full name, e.g. "Halo stud earrings" */
  name: string;
  piece: PieceId;
  label: string;
  note: string;
  stone: StoneMode;
  /** Small accent diamonds included in the design (halo, pavé) */
  accents: 0 | 1;
  /** Gold used, relative to a solitaire ring */
  weight: number;
}>;

export type DesignId = (typeof DESIGNS)[number]["id"];
export type Design = (typeof DESIGNS)[number];

export const METALS = [
  { id: "yellow", label: "18k yellow gold", short: "Yellow gold", color: "#E3BC74", note: "750 ‰", swatch: "linear-gradient(135deg,#8a6a2e,#e8c27e 45%,#f6e2b0 55%,#b8903f)" },
  { id: "rose", label: "18k rose gold", short: "Rose gold", color: "#E2A88E", note: "750 ‰", swatch: "linear-gradient(135deg,#8c5a46,#e2a88e 45%,#f4d2c2 55%,#b97b63)" },
  { id: "white", label: "18k white gold", short: "White gold", color: "#DCDCD8", note: "750 ‰, rhodium finish", swatch: "linear-gradient(135deg,#7e7e7b,#d9d9d5 45%,#f7f7f4 55%,#a9a9a5)" },
  { id: "platinum", label: "Platinum", short: "Platinum", color: "#C9CACE", note: "950 ‰, naturally white", swatch: "linear-gradient(135deg,#6f7074,#c4c5c9 45%,#ecedf0 55%,#98999d)" },
] as const;

export type MetalId = (typeof METALS)[number]["id"];

export const SHAPES = [
  { id: "round", label: "Round brilliant" },
  { id: "oval", label: "Oval" },
  { id: "princess", label: "Princess" },
  { id: "emerald", label: "Emerald" },
  { id: "pear", label: "Pear" },
  { id: "cushion", label: "Cushion" },
] as const;

export type ShapeId = (typeof SHAPES)[number]["id"];

/** Colour grades, best first */
export const COLOURS = ["D", "E", "F", "G", "H"] as const;
/** Clarity grades, best first */
export const CLARITIES = ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1"] as const;

export type ColourGrade = (typeof COLOURS)[number];
export type ClarityGrade = (typeof CLARITIES)[number];

/** Carat ranges: one stone (per stone for earrings) vs. total weight of a line. */
export const CARAT: Record<Exclude<StoneMode, "none">, { min: number; max: number; step: number; initial: number }> = {
  centre: { min: 0.3, max: 3, step: 0.05, initial: 0.5 },
  line: { min: 0.5, max: 8, step: 0.25, initial: 2 },
};

/** Sizes by piece. Rings: EU size = inner circumference in mm. */
export const SIZES: Record<PieceId, { label: string; unit: string; values: number[]; initial: number | null }> = {
  ring: { label: "Ring size", unit: "EU", values: Array.from({ length: 17 }, (_, i) => 46 + i), initial: 52 },
  bracelet: { label: "Wrist length", unit: "cm", values: [15, 16, 17, 18, 19, 20], initial: 17 },
  necklace: { label: "Chain length", unit: "cm", values: [38, 40, 42, 45, 50], initial: 42 },
  earrings: { label: "Size", unit: "", values: [], initial: null },
};

export const BOXES = [
  { id: "leather", label: "Classic leather", note: "Ink calfskin, gold monogram. Included." },
  { id: "velvet", label: "Velvet", note: "Midnight velvet over oak, ivory satin inside." },
  { id: "oak", label: "Oak travel case", note: "Solid oak, felt-lined, for a piece that travels." },
] as const;

export type BoxId = (typeof BOXES)[number]["id"];

export const ENGRAVING_MAX = 20;

/** Where the engraving goes, by piece (earrings are not engraved). */
export const ENGRAVING_PLACE: Record<PieceId, string | null> = {
  ring: "inside the band",
  bracelet: "on the clasp",
  necklace: "on the clasp tag",
  earrings: null,
};

export interface Config {
  piece: PieceId;
  design: DesignId;
  metal: MetalId;
  shape: ShapeId;
  /** Centre: weight of one stone. Line: total weight. */
  carat: number;
  colour: ColourGrade;
  clarity: ClarityGrade;
  /** Size in the piece's unit; null = ring sizer posted to the client */
  size: number | null;
  engraving: string;
  box: BoxId;
}

export const DEFAULT_CONFIG: Config = {
  piece: "ring",
  design: "ring-solitaire",
  metal: "yellow",
  shape: "round",
  carat: 0.5,
  colour: "G",
  clarity: "VS2",
  size: 52,
  engraving: "",
  box: "leather",
};

export const getDesign = (id: DesignId) => DESIGNS.find((d) => d.id === id)!;
export const designsFor = (piece: PieceId) => DESIGNS.filter((d) => d.piece === piece);

/** Clamp and round a carat value to the grid of its stone mode. */
export function snapCarat(v: number, mode: StoneMode) {
  if (mode === "none") return 0;
  const { min, max, step } = CARAT[mode];
  const c = Math.min(max, Math.max(min, v));
  return Math.round(c / step) * step;
}

/**
 * Keep a configuration consistent after any change: the design belongs to
 * the piece, the carat fits the design's stones, the size fits the piece.
 * `prev` lets a change of design carry the carat over when it still fits.
 */
export function normalize(c: Config, prev?: Config): Config {
  const next = { ...c };
  const designs = designsFor(next.piece);
  if (!designs.some((d) => d.id === next.design)) next.design = designs[0].id;
  const mode = getDesign(next.design).stone;
  const prevMode = prev ? getDesign(prev.design).stone : mode;
  if (mode === "none") next.carat = 0;
  else if (mode !== prevMode || !next.carat) next.carat = CARAT[mode].initial;
  else next.carat = snapCarat(next.carat, mode);
  if (mode === "line") next.shape = "round";
  const sizes = SIZES[next.piece];
  if (!sizes.values.length) next.size = null;
  else if (next.size === null) next.size = next.piece === "ring" ? null : sizes.initial;
  else if (!sizes.values.includes(next.size)) next.size = sizes.initial;
  if (!ENGRAVING_PLACE[next.piece]) next.engraving = "";
  next.engraving = next.engraving.slice(0, ENGRAVING_MAX);
  return next;
}

export const STEPS = [
  { id: "piece", label: "Piece" },
  { id: "design", label: "Design" },
  { id: "metal", label: "Metal" },
  { id: "stone", label: "Stone" },
  { id: "size", label: "Size" },
  { id: "engraving", label: "Engraving" },
  { id: "box", label: "Box" },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

/** The steps that apply to a configuration (no stone step for all-gold pieces, etc.). */
export function stepsFor(c: Config) {
  return STEPS.filter((s) => {
    if (s.id === "stone") return getDesign(c.design).stone !== "none";
    if (s.id === "size") return SIZES[c.piece].values.length > 0;
    if (s.id === "engraving") return ENGRAVING_PLACE[c.piece] !== null;
    return true;
  }).map((s) => (s.id === "size" && c.piece !== "ring" ? { ...s, label: "Length" } : s));
}

export const label = {
  piece: (id: PieceId) => PIECES.find((p) => p.id === id)!.label,
  design: (id: DesignId) => getDesign(id).label,
  metal: (id: MetalId) => METALS.find((m) => m.id === id)!.label,
  shape: (id: ShapeId) => SHAPES.find((s) => s.id === id)!.label,
  box: (id: BoxId) => BOXES.find((b) => b.id === id)!.label,
};

/** "Halo ring", "Tennis bracelet", "Hoop earrings"… */
export function pieceName(c: Config) {
  return getDesign(c.design).name;
}

export function stoneLine(c: Config) {
  const d = getDesign(c.design);
  if (d.stone === "none") return "all 18k gold";
  if (d.stone === "line") return `${c.carat.toFixed(2)} ct total, round brilliants, ${c.colour} ${c.clarity}`;
  const each = c.piece === "earrings" ? " each" : "";
  return `${c.carat.toFixed(2)} ct${each} ${label.shape(c.shape).toLowerCase()}, ${c.colour} ${c.clarity}`;
}

export function sizeLine(c: Config) {
  const s = SIZES[c.piece];
  if (!s.values.length) return null;
  if (c.size === null) return "ring sizer posted to you";
  return c.piece === "ring" ? `size ${c.size}` : `${c.size} cm`;
}

/** One line for the bag: "Halo ring · 0.50 ct round brilliant, G VS2 · 18k rose gold · size 52" */
export function describe(c: Config) {
  return [pieceName(c), stoneLine(c), label.metal(c.metal), sizeLine(c)].filter(Boolean).join(" · ");
}
