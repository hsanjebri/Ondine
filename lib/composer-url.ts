import {
  BOXES,
  CLARITIES,
  COLOURS,
  DEFAULT_CONFIG,
  DESIGNS,
  METALS,
  PIECES,
  SHAPES,
  normalize,
  type Config,
} from "./composer-options";

/*
 * Shareable link: every choice in the query string, short keys.
 *   /composer?p=ring&d=ring-halo&m=rose&sh=oval&ct=1.20&c=E&cl=VVS2&sz=52&e=A+toi&b=velvet
 */

const KEYS = {
  piece: "p",
  design: "d",
  metal: "m",
  shape: "sh",
  carat: "ct",
  colour: "c",
  clarity: "cl",
  size: "sz",
  engraving: "e",
  box: "b",
} as const;

export function encodeConfig(c: Config): string {
  const p = new URLSearchParams();
  p.set(KEYS.piece, c.piece);
  p.set(KEYS.design, c.design);
  p.set(KEYS.metal, c.metal);
  p.set(KEYS.shape, c.shape);
  p.set(KEYS.carat, c.carat.toFixed(2));
  p.set(KEYS.colour, c.colour);
  p.set(KEYS.clarity, c.clarity);
  if (c.size !== null || c.piece === "ring") p.set(KEYS.size, c.size === null ? "0" : String(c.size));
  if (c.engraving) p.set(KEYS.engraving, c.engraving);
  p.set(KEYS.box, c.box);
  return p.toString();
}

const pick = <T extends string>(list: readonly T[], v: string | null): T | undefined =>
  v && (list as readonly string[]).includes(v) ? (v as T) : undefined;

/** Parse a query string. Invalid values fall back to `base`. Returns null when no composer keys are present. */
export function decodeConfig(search: string, base: Config = DEFAULT_CONFIG): Config | null {
  const p = new URLSearchParams(search);
  if (!p.has(KEYS.piece) && !p.has(KEYS.design)) return null;
  const carat = Number(p.get(KEYS.carat));
  const size = p.get(KEYS.size);
  const design = pick(DESIGNS.map((d) => d.id), p.get(KEYS.design));
  const piece = pick(PIECES.map((x) => x.id), p.get(KEYS.piece)) ?? (design ? DESIGNS.find((d) => d.id === design)!.piece : base.piece);
  const raw: Config = {
    piece,
    design: design ?? base.design,
    metal: pick(METALS.map((m) => m.id), p.get(KEYS.metal)) ?? base.metal,
    shape: pick(SHAPES.map((s) => s.id), p.get(KEYS.shape)) ?? base.shape,
    carat: Number.isFinite(carat) && carat > 0 ? carat : base.carat,
    colour: pick(COLOURS, p.get(KEYS.colour)) ?? base.colour,
    clarity: pick(CLARITIES, p.get(KEYS.clarity)) ?? base.clarity,
    size: size === null ? base.size : size === "0" ? null : Number(size),
    engraving: p.get(KEYS.engraving) ?? base.engraving,
    box: pick(BOXES.map((b) => b.id), p.get(KEYS.box)) ?? base.box,
  };
  // Treat the decoded design's own stone mode as the previous one so a valid carat is kept.
  return normalize(raw, raw);
}

/** Stable short id for a configuration (bag line key). */
export function configKey(c: Config) {
  const s = encodeConfig(c);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return `composed-${(h >>> 0).toString(36)}`;
}
