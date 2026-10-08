/**
 * One-off seed: fills every image slot from the Unsplash API.
 *
 *   npm run seed:images            fill missing slots (resumable)
 *   npm run seed:images -- --force refetch every slot
 *   npm run seed:images -- --dry-run search (cached) and print the picks; no downloads, no writes
 *   npm run media:doc              only regenerate the slot table in MEDIA.md
 *
 * Rules followed (https://help.unsplash.com/en/collections/1463188-unsplash-api):
 * - The key stays server-side: read from .env.local, never bundled.
 * - Photos are hotlinked: only metadata + `urls.raw` are stored, no files.
 * - `links.download_location` is called once for every photo selected.
 * - Attribution data (photographer + photo page) is stored for every photo.
 *
 * The demo key allows 50 requests/hour. Searches are cached in
 * scripts/.cache, progress is written after every photo, and the script
 * stops before the remaining quota runs out, so a second run resumes.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { deflateSync, crc32 } from "node:zlib";
import { decode } from "blurhash";
import { IMAGE_SLOTS, type ImageSlot } from "../data/image-slots";
import type { ImageRecord, ImagesFile } from "../lib/image-types";

const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "data", "images.json");
const CACHE = join(ROOT, "scripts", ".cache", "unsplash-search.json");
const MEDIA_DOC = join(ROOT, "MEDIA.md");
const API = "https://api.unsplash.com";
const RESERVE = 1; // keep one request spare

const args = new Set(process.argv.slice(2));
const FORCE = args.has("--force");
const DOC_ONLY = args.has("--doc-only");
const DRY_RUN = args.has("--dry-run");

/* ------------------------------------------------------------------ types */

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  color: string | null;
  blur_hash: string | null;
  likes: number;
  alt_description: string | null;
  description: string | null;
  premium?: boolean;
  plus?: boolean;
  urls: { raw: string };
  links: { html: string; download_location: string };
  user: { name: string; username: string; links: { html: string } };
}

type SearchCache = Record<string, UnsplashPhoto[]>;

/* ---------------------------------------------------------------- helpers */

function readJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function loadKey(): string {
  const envFile = join(ROOT, ".env.local");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const key = process.env.UNSPLASH_ACCESS_KEY?.trim();
  if (!key) {
    console.error(
      "\n  UNSPLASH_ACCESS_KEY is missing.\n  Create .env.local in the project root with:\n\n    UNSPLASH_ACCESS_KEY=your_access_key\n",
    );
    process.exit(1);
  }
  return key;
}

let remaining = Number.POSITIVE_INFINITY;

async function api<T>(key: string, url: string): Promise<T> {
  if (remaining <= RESERVE) throw new QuotaError();
  const res = await fetch(url.startsWith("http") ? url : API + url, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
  });
  const left = Number(res.headers.get("x-ratelimit-remaining"));
  if (Number.isFinite(left)) remaining = left;
  if (res.status === 403 && remaining === 0) throw new QuotaError();
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`);
  return (await res.json()) as T;
}

class QuotaError extends Error {
  constructor() {
    super("Unsplash hourly quota reached");
  }
}

/** 8px-wide PNG from a BlurHash, as a data URL usable by next/image. */
function blurHashToDataURL(hash: string, w: number, h: number): string {
  const width = 8;
  const height = Math.max(4, Math.min(12, Math.round((width * h) / w)));
  const pixels = decode(hash, width, height); // RGBA
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < width * 4; x++) {
      raw[y * (width * 4 + 1) + 1 + x] = pixels[y * width * 4 + x];
    }
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

function colorDataURL(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="${color}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

function sentence(text: string): string {
  const t = text.trim().replace(/\s+/g, " ");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/* -------------------------------------------------------------- selection */

const MIN_LONG_EDGE = 3000;
const MIN_SHORT_EDGE = 1800;

function matchesOrientation(p: UnsplashPhoto, o: ImageSlot["orientation"]) {
  const r = p.width / p.height;
  if (o === "landscape") return r >= 1.25;
  if (o === "portrait") return r <= 0.85;
  return true;
}

function isUsable(p: UnsplashPhoto) {
  const long = Math.max(p.width, p.height);
  const short = Math.min(p.width, p.height);
  return (
    !p.premium &&
    !p.plus &&
    p.urls.raw.startsWith("https://images.unsplash.com/") &&
    long >= MIN_LONG_EDGE &&
    short >= MIN_SHORT_EDGE
  );
}

/** Relevance first (API order), then appreciation (likes), then resolution. */
function score(p: UnsplashPhoto, rank: number) {
  const pixels = (p.width * p.height) / 1e6;
  return -rank * 0.12 + Math.log10(p.likes + 1) * 0.6 + Math.min(pixels, 24) * 0.02;
}

function pick(results: UnsplashPhoto[], slot: ImageSlot, used: Set<string>) {
  const candidates = results
    .map((p, rank) => ({ p, rank }))
    .filter(({ p }) => isUsable(p) && !used.has(p.id) && matchesOrientation(p, slot.orientation))
    .sort((a, b) => score(b.p, b.rank) - score(a.p, a.rank));
  return candidates[0]?.p;
}

function toRecord(p: UnsplashPhoto, slot: ImageSlot, tracked: boolean): ImageRecord {
  const alt = p.alt_description || p.description;
  return {
    slot: slot.id,
    id: p.id,
    raw: p.urls.raw,
    width: p.width,
    height: p.height,
    color: p.color ?? "#cfc6b8",
    blurHash: p.blur_hash,
    blurDataURL: p.blur_hash
      ? blurHashToDataURL(p.blur_hash, p.width, p.height)
      : colorDataURL(p.color ?? "#cfc6b8"),
    alt: alt ? sentence(alt) : slot.altFallback,
    photographer: { name: p.user.name, username: p.user.username, url: p.user.links.html },
    photoUrl: p.links.html,
    query: slot.query,
    downloadTracked: tracked,
  };
}

/* ------------------------------------------------------------- MEDIA.md */

function writeMediaDoc(file: ImagesFile) {
  const start = "<!-- slots:start -->";
  const end = "<!-- slots:end -->";
  const rows = IMAGE_SLOTS.map((s) => {
    const r = file.slots[s.id];
    const source = r
      ? `Unsplash — [${r.photographer.name}](${r.photoUrl}) (\`${r.id}\`)`
      : "**placeholder** (not fetched yet)";
    return `| \`${s.id}\` | ${s.purpose} | ${s.ratio} | ${s.orientation} | ${source} |`;
  });
  const table = [
    start,
    "",
    `_Generated by \`npm run media:doc\` — ${file.generatedAt ?? "never fetched"}._`,
    "",
    "| Slot | Used for | Display ratio | Orientation | Current source |",
    "| --- | --- | --- | --- | --- |",
    ...rows,
    "",
    end,
  ].join("\n");

  const doc = existsSync(MEDIA_DOC) ? readFileSync(MEDIA_DOC, "utf8") : "";
  const next =
    doc.includes(start) && doc.includes(end)
      ? doc.slice(0, doc.indexOf(start)) + table + doc.slice(doc.indexOf(end) + end.length)
      : `${doc.trimEnd()}\n\n## Image slots\n\n${table}\n`;
  writeFileSync(MEDIA_DOC, next);
}

/* ------------------------------------------------------------------ main */

async function main() {
  const file = readJson<ImagesFile>(OUT, { generatedAt: null, source: "unsplash", slots: {} });

  if (DOC_ONLY) {
    writeMediaDoc(file);
    console.log("MEDIA.md slot table regenerated.");
    return;
  }

  const key = loadKey();
  if (FORCE) file.slots = {};
  const cache = FORCE ? {} : readJson<SearchCache>(CACHE, {});

  // Drop records for slots that no longer exist.
  for (const id of Object.keys(file.slots)) {
    if (!IMAGE_SLOTS.some((s) => s.id === id)) delete file.slots[id];
  }

  // A slot needs (re)filling when it was never tracked, when its query
  // changed, or when a hand-picked id differs from what is stored.
  const stale = (s: ImageSlot) => {
    const r = file.slots[s.id];
    if (!r?.downloadTracked) return true;
    if (s.pick) return r.id !== s.pick;
    return r.query !== s.query;
  };
  const todo: ImageSlot[] = IMAGE_SLOTS.filter(stale);
  const used = new Set(
    Object.values(file.slots)
      .filter((r) => !todo.some((s) => s.id === r.slot))
      .map((r) => r.id),
  );
  const queries = [...new Set(todo.map((s) => s.query))].filter((q) => !cache[q]);
  console.log(
    `${IMAGE_SLOTS.length} slots · ${todo.length} to fill · ${queries.length} searches + ${todo.length} download pings needed`,
  );

  let filled = 0;
  try {
    for (const slot of todo) {
      if (!cache[slot.query]) {
        const params = new URLSearchParams({
          query: slot.query,
          per_page: "30",
          content_filter: "high",
        });
        const data = await api<{ results: UnsplashPhoto[] }>(key, `/search/photos?${params}`);
        cache[slot.query] = data.results;
        writeJson(CACHE, cache);
        console.log(`  search  "${slot.query}" → ${data.results.length} results (quota left ${remaining})`);
      }

      const existing = file.slots[slot.id];
      let photo: UnsplashPhoto | undefined;
      if (slot.pick) {
        photo = Object.values(cache).flat().find((p) => p.id === slot.pick);
        if (!photo && !DRY_RUN) photo = await api<UnsplashPhoto>(key, `/photos/${slot.pick}`);
      } else if (existing && !existing.downloadTracked && existing.query === slot.query) {
        photo = cache[slot.query].find((p) => p.id === existing.id);
      } else {
        photo = pick(cache[slot.query], slot, used);
      }

      if (!photo) {
        console.warn(`  skip    ${slot.id}: no usable ${slot.orientation} result for "${slot.query}"`);
        continue;
      }
      used.add(photo.id);
      if (DRY_RUN) {
        console.log(`  would   ${slot.id.padEnd(12)} ${photo.id}  ${photo.width}×${photo.height}  by ${photo.user.name}`);
        continue;
      }
      file.slots[slot.id] = toRecord(photo, slot, false);
      writeJson(OUT, file);

      // Required download tracking — once per selected photo.
      await api(key, photo.links.download_location);
      file.slots[slot.id].downloadTracked = true;
      file.generatedAt = new Date().toISOString();
      writeJson(OUT, file);
      filled++;
      console.log(`  ✓ ${slot.id.padEnd(12)} ${photo.id}  ${photo.width}×${photo.height}  by ${photo.user.name}`);
    }
  } catch (err) {
    if (err instanceof QuotaError) {
      console.warn(`\n  Hourly quota reached after ${filled} photos. Progress saved — run again in an hour to finish.`);
    } else {
      throw err;
    }
  } finally {
    if (!DRY_RUN) writeMediaDoc(file);
  }

  const missing = IMAGE_SLOTS.filter((s) => !file.slots[s.id]?.downloadTracked).map((s) => s.id);
  console.log(
    `\nDone: ${IMAGE_SLOTS.length - missing.length}/${IMAGE_SLOTS.length} slots filled.` +
      (missing.length ? ` Still missing: ${missing.join(", ")}` : ""),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
