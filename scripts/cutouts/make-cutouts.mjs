/*
 * Cut-out pipeline for the composer (run from the scratchpad, not the project):
 *   node make-cutouts.mjs <projectRoot> <srcDir> [id ...]
 * Downloads each photo (Unsplash, w=2400), crops, removes the background
 * (IS-Net via @imgly/background-removal-node), trims, and writes
 * public/cutouts/<id>.webp + data/cutouts.json (size + sparkle hotspots).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import sharp from "sharp";
import { removeBackground } from "@imgly/background-removal-node";

const [root, srcDir, ...only] = process.argv.slice(2);
const MANIFEST = JSON.parse(readFileSync(new URL("./manifest.json", import.meta.url), "utf8"));
const cache = JSON.parse(readFileSync(`${root}/scripts/.cache/unsplash-search.json`, "utf8"));
const all = Object.values(cache).flat();
const outDir = `${root}/public/cutouts`;
mkdirSync(outDir, { recursive: true });
const dataPath = `${root}/data/cutouts.json`;
const data = existsSync(dataPath) ? JSON.parse(readFileSync(dataPath, "utf8")) : {};

async function source(photo, width = 2400) {
  const file = `${srcDir}/${photo}${width === 2400 ? "" : "@" + width}.jpg`;
  if (!existsSync(file)) {
    const p = all.find((x) => x.id === photo);
    const r = await fetch(`${p.urls.raw}&w=${width}&q=90&fm=jpg`);
    writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  }
  return file;
}

function hotspots(raw, w, h, count = 12) {
  const cell = Math.max(4, Math.round(Math.max(w, h) / 90));
  const gw = Math.floor(w / cell), gh = Math.floor(h / cell);
  const score = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    let best = 0;
    for (let y = gy * cell; y < (gy + 1) * cell; y++) for (let x = gx * cell; x < (gx + 1) * cell; x++) {
      const i = (y * w + x) * 4;
      if (raw[i + 3] < 235) continue;
      const lum = 0.2126 * raw[i] + 0.7152 * raw[i + 1] + 0.0722 * raw[i + 2];
      if (lum > best) best = lum;
    }
    score[gy * gw + gx] = best;
  }
  const order = [...score.keys()].sort((a, b) => score[b] - score[a]);
  const picked = [];
  const minD = Math.max(5, Math.round(Math.min(gw, gh) / 9));
  for (const k of order) {
    if (score[k] < 200 || picked.length >= count) break;
    const x = k % gw, y = Math.floor(k / gw);
    if (picked.every(([px, py]) => Math.hypot(px - x, py - y) >= minD)) picked.push([x, y]);
  }
  return picked.map(([x, y]) => [+(((x + 0.5) * cell) / w).toFixed(4), +(((y + 0.5) * cell) / h).toFixed(4)]);
}

for (const item of MANIFEST) {
  if (only.length && !only.includes(item.id)) continue;
  const t0 = Date.now();
  // Crops are given in 2400-px-wide coordinates; srcWidth fetches a larger original.
  const srcWidth = item.srcWidth ?? 2400;
  const k = srcWidth / 2400;
  let img = sharp(await source(item.photo, srcWidth));
  if (item.crop) {
    const [left, top, width, height] = item.crop.map((v) => Math.round(v * k));
    img = img.extract({ left, top, width, height });
  }
  const png = await img.png().toBuffer();
  const blob = await removeBackground(new Blob([png], { type: "image/png" }), {
    model: "medium",
    output: { format: "image/png", quality: 1 },
  });
  // Alpha curve: drop the faint haze of soft shadows and out-of-focus areas, keep solid metal.
  const [lo, hi] = item.alpha ?? [70, 215];
  const { data: px, info: pi } = await sharp(Buffer.from(await blob.arrayBuffer())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < px.length; i += 4) px[i] = Math.max(0, Math.min(255, Math.round(((px[i] - lo) * 255) / (hi - lo))));
  // Optional: key out neutral near-white pixels (fabric seen through a hoop). Gold highlights keep their warmth.
  if (item.whiteKey) {
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], g = px[i + 1], b = px[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      if (mx > 205 && (mx - mn) / mx < item.whiteKey) px[i + 3] = 0;
    }
  }
  // Optional: pull out a colour cast picked up from a coloured backdrop.
  if (item.saturation !== undefined) {
    for (let i = 0; i < px.length; i += 4) {
      const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      for (let c = 0; c < 3; c++) px[i + c] = Math.round(l + (px[i + c] - l) * item.saturation);
    }
  }
  const cut = await sharp(px, { raw: { width: pi.width, height: pi.height, channels: 4 } }).png().toBuffer();
  const trimmed = await sharp(cut).trim({ threshold: 4 }).toBuffer({ resolveWithObject: true });
  const max = item.max ?? 1400;
  const pad = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * 0.04);
  const padded = await sharp(trimmed.data)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const final = sharp(padded).resize({ width: max, height: max, fit: "inside", withoutEnlargement: true });
  const { data: raw, info } = await final.clone().ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  await final.clone().webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(`${outDir}/${item.id}.webp`);
  data[item.id] = {
    src: `/cutouts/${item.id}.webp`,
    width: info.width,
    height: info.height,
    photo: item.photo,
    metal: item.metal ?? null,
    hotspots: hotspots(raw, info.width, info.height),
  };
  writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
  console.log(`✓ ${item.id.padEnd(22)} ${info.width}×${info.height}  ${((Date.now() - t0) / 1000).toFixed(1)} s`);
}
