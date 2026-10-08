import type { SettingId, ShapeId } from "@/lib/composer-options";

/**
 * Replace any procedural part with a modelled one: drop the file in
 * /public/models and add its path here. Units: millimetres, ring axis Z,
 * head toward +Y (band); stones and settings in "stone units" — girdle
 * radius 1, girdle on y = 0, long axis along X. See MEDIA.md.
 *
 *   band: "/models/band.glb",
 *   "setting-halo": "/models/setting-halo.glb",
 *   "stone-oval": "/models/stone-oval.glb",
 */
export type ModelKey = "band" | `setting-${SettingId}` | `stone-${ShapeId}`;

export const MODEL_OVERRIDES: Partial<Record<ModelKey, string>> = {};
