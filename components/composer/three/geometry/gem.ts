import * as THREE from "three";
import type { ShapeId } from "@/lib/composer-options";

/*
 * Procedural faceted gems.
 *
 * A gem is a stack of rings of vertices (table → crown → girdle → pavilion →
 * culet) swept around a per-shape girdle outline. Rings offset by half a
 * step produce the kite/star facets of a brilliant; aligned rings produce
 * the steps of an emerald cut. Every face is flat-shaded, which is what
 * makes the refraction material sparkle.
 *
 * Unit space: the girdle spans roughly −1…1 (area ≈ a unit circle), table
 * facing +Y, girdle on y = 0, long axis along X.
 */

type Outline = (theta: number) => [number, number];

const sgnPow = (v: number, p: number) => Math.sign(v) * Math.pow(Math.abs(v), p);

/** Ray-cast the outline of a convex polygon (used by the emerald cut). */
function polygonOutline(points: Array<[number, number]>): Outline {
  return (theta) => {
    const dx = Math.cos(theta);
    const dz = Math.sin(theta);
    let best = Infinity;
    for (let i = 0; i < points.length; i++) {
      const [x1, z1] = points[i];
      const [x2, z2] = points[(i + 1) % points.length];
      const ex = x2 - x1;
      const ez = z2 - z1;
      const den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = (x1 * ez - z1 * ex) / den;
      const u = (x1 * dz - z1 * dx) / den;
      if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.min(best, t);
    }
    return [dx * best, dz * best];
  };
}

const EMERALD_POLY = emeraldPolygonPoints(1.08, 0.78, 0.24);

function emeraldPolygonPoints(a: number, b: number, c: number): Array<[number, number]> {
  return [
    [a, b - c],
    [a - c, b],
    [-a + c, b],
    [-a, b - c],
    [-a, -b + c],
    [-a + c, -b],
    [a - c, -b],
    [a, -b + c],
  ];
}

export const OUTLINES: Record<ShapeId, Outline> = {
  round: (t) => [Math.cos(t), Math.sin(t)],
  oval: (t) => [1.18 * Math.cos(t), 0.84 * Math.sin(t)],
  cushion: (t) => [0.93 * sgnPow(Math.cos(t), 0.5), 0.93 * sgnPow(Math.sin(t), 0.5)],
  princess: (t) => [0.89 * sgnPow(Math.cos(t), 0.16), 0.89 * sgnPow(Math.sin(t), 0.16)],
  emerald: polygonOutline(EMERALD_POLY),
  // Rounded end at −X, point at +X (the point faces the fingertip).
  pear: (t) => [1.2 * Math.cos(t), 0.98 * Math.sin(t) * Math.sqrt((1 - Math.cos(t)) / 2)],
};

/** [radius scale, height, angular offset in steps] — or a single apex point when radius is 0. */
type Ring = [number, number, number];

interface Cut {
  segments: number;
  rings: Ring[];
  /** Exact angles for each segment (overrides uniform steps; offsets ignored). */
  angles?: number[];
}

const BRILLIANT: Cut = {
  segments: 16,
  rings: [
    [0, 0.3, 0], // table centre
    [0.56, 0.3, 0], // table edge
    [0.8, 0.185, 0.5], // star / kite
    [1, 0.025, 0], // girdle
    [1, -0.025, 0],
    [0.52, -0.44, 0.5], // lower girdle
    [0, -0.86, 0], // culet
  ],
};

const PRINCESS: Cut = {
  segments: 16,
  rings: [
    [0, 0.21, 0],
    [0.7, 0.21, 0],
    [0.87, 0.12, 0.5],
    [1, 0.02, 0],
    [1, -0.02, 0],
    [0.66, -0.32, 0.5],
    [0.32, -0.6, 0],
    [0, -0.76, 0],
  ],
};

const STEP: Cut = {
  segments: 8,
  // The eight corners of the octagon: every step is eight flat trapezoids.
  angles: EMERALD_POLY.map(([x, z]) => Math.atan2(z, x)),
  rings: [
    [0, 0.24, 0],
    [0.64, 0.24, 0],
    [0.8, 0.18, 0],
    [0.93, 0.095, 0],
    [1, 0.02, 0],
    [1, -0.02, 0],
    [0.74, -0.23, 0],
    [0.5, -0.45, 0],
    [0.26, -0.63, 0],
    [0, -0.74, 0],
  ],
};

const CUTS: Record<ShapeId, Cut> = {
  round: BRILLIANT,
  oval: BRILLIANT,
  cushion: { ...BRILLIANT, segments: 16 },
  pear: { ...BRILLIANT, segments: 20 },
  princess: PRINCESS,
  emerald: STEP,
};

/** Depth of the pavilion below the girdle, in unit space (for seating the stone). */
export function pavilionDepth(shape: ShapeId) {
  const rings = CUTS[shape].rings;
  return -rings[rings.length - 1][1];
}

export function crownHeight(shape: ShapeId) {
  return CUTS[shape].rings[0][1];
}

const cache = new Map<ShapeId, THREE.BufferGeometry>();

export function gemGeometry(shape: ShapeId): THREE.BufferGeometry {
  const hit = cache.get(shape);
  if (hit) return hit;

  const { segments: n, rings, angles } = CUTS[shape];
  const outline = OUTLINES[shape];
  const step = (Math.PI * 2) / n;
  const pos: number[] = [];

  const vertex = (ring: Ring, j: number): THREE.Vector3 => {
    const [r, y, off] = ring;
    const jj = ((j % n) + n) % n;
    const [x, z] = outline(angles ? angles[jj] : (jj + off) * step);
    return new THREE.Vector3(x * r, y, z * r);
  };
  const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  };

  for (let i = 0; i < rings.length - 1; i++) {
    const up = rings[i];
    const lo = rings[i + 1];
    for (let j = 0; j < n; j++) {
      if (up[0] === 0) {
        // Fan from the table centre (normal +Y)
        tri(new THREE.Vector3(0, up[1], 0), vertex(lo, j + 1), vertex(lo, j));
      } else if (lo[0] === 0) {
        // Fan down to the culet
        tri(vertex(up, j), vertex(up, j + 1), new THREE.Vector3(0, lo[1], 0));
      } else if ((up[2] - lo[2]) % 1 === 0) {
        // Aligned rings: step facets
        const a = vertex(up, j);
        const b = vertex(up, j + 1);
        const c = vertex(lo, j);
        const d = vertex(lo, j + 1);
        tri(a, b, c);
        tri(b, d, c);
      } else {
        // Offset rings: zigzag kite facets
        const k = j + (up[2] > lo[2] ? 1 : 0);
        tri(vertex(up, j), vertex(up, j + 1), vertex(lo, k));
        tri(vertex(up, j + 1), vertex(lo, k + 1), vertex(lo, k));
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals(); // non-indexed → one normal per face: flat facets
  geo.computeBoundingSphere();
  cache.set(shape, geo);
  return geo;
}

/** Girdle diameter of a round brilliant of this weight, in mm (≈ 6.5 mm at 1 ct). */
export function stoneDiameter(carat: number) {
  return 6.5 * Math.cbrt(carat);
}

/** Points on the girdle outline, in unit space, at the given angles. */
export function outlinePoint(shape: ShapeId, theta: number, scale = 1): THREE.Vector2 {
  const [x, z] = OUTLINES[shape](theta);
  return new THREE.Vector2(x * scale, z * scale);
}

/** Where the claws go, by shape (angles around the girdle). */
export function prongAngles(shape: ShapeId): number[] {
  switch (shape) {
    case "princess":
    case "cushion":
      return [1, 3, 5, 7].map((k) => (k * Math.PI) / 4);
    case "emerald": {
      // At the cut corners of the octagon
      const c = Math.atan2(0.78 - 0.12, 1.08 - 0.12);
      return [c, Math.PI - c, Math.PI + c, -c];
    }
    case "pear":
      return [0, Math.PI * 0.62, -Math.PI * 0.62, Math.PI];
    default:
      return [0, 1, 2, 3, 4, 5].map((k) => (k * Math.PI) / 3 + Math.PI / 6);
  }
}
