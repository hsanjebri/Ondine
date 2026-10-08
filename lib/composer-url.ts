import {
  BOXES,
  CLARITIES,
  COLOURS,
  DEFAULT_CONFIG,
  ENGRAVING_MAX,
  METALS,
  SETTINGS,
  SHAPES,
  SIZES,
  snapCarat,
  type RingConfig,
} from "./composer-options";

/*
 * Shareable link: every choice in the query string, short keys.
 *   /composer?s=halo&m=rose&sh=oval&ct=1.20&c=E&cl=VVS2&sz=52&e=A+toi&b=velvet
 */

const KEYS = {
  setting: "s",
  metal: "m",
  shape: "sh",
  carat: "ct",
  colour: "c",
  clarity: "cl",
  size: "sz",
  engraving: "e",
  box: "b",
} as const;

export function encodeConfig(c: RingConfig): string {
  const p = new URLSearchParams();
  p.set(KEYS.setting, c.setting);
  p.set(KEYS.metal, c.metal);
  p.set(KEYS.shape, c.shape);
  p.set(KEYS.carat, c.carat.toFixed(2));
  p.set(KEYS.colour, c.colour);
  p.set(KEYS.clarity, c.clarity);
  p.set(KEYS.size, c.size ? String(c.size) : "0");
  if (c.engraving) p.set(KEYS.engraving, c.engraving);
  p.set(KEYS.box, c.box);
  return p.toString();
}

const pick = <T extends string>(list: readonly T[], v: string | null): T | undefined =>
  v && (list as readonly string[]).includes(v) ? (v as T) : undefined;

/** Parse a query string. Unknown or invalid values fall back to `base`. Returns null when no composer keys are present. */
export function decodeConfig(search: string, base: RingConfig = DEFAULT_CONFIG): RingConfig | null {
  const p = new URLSearchParams(search);
  if (!Object.values(KEYS).some((k) => p.has(k))) return null;
  const carat = Number(p.get(KEYS.carat));
  const size = Number(p.get(KEYS.size));
  return {
    setting: pick(SETTINGS.map((s) => s.id), p.get(KEYS.setting)) ?? base.setting,
    metal: pick(METALS.map((m) => m.id), p.get(KEYS.metal)) ?? base.metal,
    shape: pick(SHAPES.map((s) => s.id), p.get(KEYS.shape)) ?? base.shape,
    carat: Number.isFinite(carat) && carat > 0 ? snapCarat(carat) : base.carat,
    colour: pick(COLOURS, p.get(KEYS.colour)) ?? base.colour,
    clarity: pick(CLARITIES, p.get(KEYS.clarity)) ?? base.clarity,
    size: p.has(KEYS.size) ? (SIZES.includes(size) ? size : null) : base.size,
    engraving: (p.get(KEYS.engraving) ?? base.engraving).slice(0, ENGRAVING_MAX),
    box: pick(BOXES.map((b) => b.id), p.get(KEYS.box)) ?? base.box,
  };
}

/** Stable short id for a configuration (bag line key). */
export function configKey(c: RingConfig) {
  const s = encodeConfig(c);
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return `composed-${(h >>> 0).toString(36)}`;
}
