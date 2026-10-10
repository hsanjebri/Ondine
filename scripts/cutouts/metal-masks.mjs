/*
 * Metal masks for re-toning: alpha = "this pixel is metal".
 * Metal photographs as smooth gradients; diamonds as dense high-contrast
 * facets. Texture energy (|L − blur(L)|, blurred) separates the two; in gold
 * photographs, colour saturation marks metal too.
 *   node metal-masks.mjs <projectRoot> [id ...]
 */
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const [root, ...only] = process.argv.slice(2);
const dataPath = `${root}/data/cutouts.json`;
const data = JSON.parse(readFileSync(dataPath, "utf8"));
/** Centre stones with broad flat facets read as "smooth": keep them out of the mask. [cx, cy, rx, ry], normalised. */
const KEEP_OUT = {
  "ring-halo": [[0.5, 0.48, 0.125, 0.24]],
  "ring-solitaire": [[0.51, 0.62, 0.15, 0.28]],
  "necklace-pendant": [[0.53, 0.72, 0.27, 0.15]],
  "earrings-halo": [[0.19, 0.5, 0.1, 0.22], [0.79, 0.5, 0.1, 0.22]],
};
const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };

for (const [id, rec] of Object.entries(data)) {
  if (id.startsWith("stone-") || (only.length && !only.includes(id))) continue;
  const W = 700;
  const base = sharp(`${root}/public${rec.src}`).resize({ width: W });
  const { data: rgba, info } = await base.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const L = Buffer.alloc(n);
  for (let i = 0; i < n; i++) L[i] = Math.round(0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2]);
  const raw = { raw: { width: info.width, height: info.height, channels: 1 } };
  const grey = (img) => img.extractChannel(0).raw().toBuffer();
  const blurred = await grey(sharp(L, raw).blur(1.2));
  if (blurred.length !== n) throw new Error(`stride mismatch: ${blurred.length} vs ${n}`);
  const hf = Buffer.alloc(n);
  for (let i = 0; i < n; i++) hf[i] = Math.min(255, Math.abs(L[i] - blurred[i]) * 4);
  const energy = await grey(sharp(hf, raw).blur(5));
  // Normalise on the piece's own pixels.
  const vals = [];
  for (let i = 0; i < n; i++) if (rgba[i * 4 + 3] > 200) vals.push(energy[i]);
  vals.sort((a, b) => a - b);
  const q = (p) => vals[Math.floor(p * (vals.length - 1))] || 1;
  const lo = q(0.35), hi = q(0.8);
  const coloured = rec.metal === "yellow" || rec.metal === "rose";
  const out = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2], a = rgba[i * 4 + 3] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx ? (mx - mn) / mx : 0;
    // Smooth = metal; but bright, near-neutral pixels are stones or specular highlights: leave them.
    const brightWhite = smooth(190, 235, L[i]) * (1 - smooth(0.16, 0.3, sat));
    let m = (1 - smooth(lo, hi, energy[i])) * (1 - brightWhite);
    if (coloured) m = Math.max(m, smooth(0.3, 0.45, sat));
    const px = (i % info.width) / info.width, py = Math.floor(i / info.width) / info.height;
    for (const [cx, cy, rx, ry] of KEEP_OUT[id] ?? []) {
      const d = Math.hypot((px - cx) / rx, (py - cy) / ry);
      m *= smooth(0.85, 1.05, d);
    }
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = 255;
    out[i * 4 + 3] = Math.round(255 * m * a);
  }
  const file = rec.src.replace(".webp", "-metal.webp");
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).blur(0.8).webp({ quality: 80, alphaQuality: 100 }).toFile(`${root}/public${file}`);
  rec.metalMask = file;
  console.log("✓", id);
}
writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
