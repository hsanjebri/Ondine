import * as THREE from "three";

/*
 * The band: a torus-like sweep of a comfort-fit "D" profile around the
 * finger. Ring axis = Z (the finger), the head sits at the top (+Y).
 * Width (along Z) and thickness (radial) can taper toward the head.
 * Units are millimetres.
 */

export interface BandProfile {
  /** Width along the finger, at the bottom of the ring */
  width: number;
  /** Radial thickness, at the bottom of the ring */
  thickness: number;
  /** Extra width toward the head (0.2 = 20 % wider at the top) */
  widthTaper: number;
  /** Extra thickness toward the head */
  thicknessTaper: number;
  /** 0 = flat outer face, 1 = fully domed */
  dome: number;
}

export const BAND_PROFILES = {
  solitaire: { width: 2.0, thickness: 1.6, widthTaper: -0.05, thicknessTaper: 0.15, dome: 0.85 },
  halo: { width: 2.1, thickness: 1.7, widthTaper: 0, thicknessTaper: 0.15, dome: 0.8 },
  trilogy: { width: 2.2, thickness: 1.7, widthTaper: 0.05, thicknessTaper: 0.12, dome: 0.8 },
  pave: { width: 2.5, thickness: 1.85, widthTaper: 0, thicknessTaper: 0.05, dome: 0.45 },
} satisfies Record<string, BandProfile>;

/** EU size = inner circumference in mm. */
export function innerRadius(size: number) {
  return size / (2 * Math.PI);
}

const RADIAL = 160; // around the finger
const PROFILE = 24; // around the cross-section

export function bandGeometry(radius: number, p: BandProfile): THREE.BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];

  // Cross-section in local (u = along Z, v = radial outward from the inner face).
  // Comfort fit: slightly rounded inner face; domed outer face.
  const section: Array<[number, number]> = [];
  for (let k = 0; k <= PROFILE; k++) {
    const t = k / PROFILE; // 0..1 around the closed section
    const a = t * Math.PI * 2;
    // Superellipse cross-section: flatter sides, rounded edges.
    const cu = Math.cos(a);
    const sv = Math.sin(a);
    const u = Math.sign(cu) * Math.pow(Math.abs(cu), 0.35);
    // Outer half (sv > 0) is domed by `dome`, inner half nearly flat (comfort fit).
    const vPow = sv > 0 ? 0.35 + 0.65 * (1 - p.dome) * 0.6 : 0.25;
    const v = Math.sign(sv) * Math.pow(Math.abs(sv), vPow);
    section.push([u * 0.5, (v + 1) * 0.5]); // u ∈ [−.5, .5], v ∈ [0, 1]
  }

  for (let i = 0; i <= RADIAL; i++) {
    const phi = (i / RADIAL) * Math.PI * 2; // 0 at the top
    const toward = Math.max(0, Math.cos(phi)); // 1 at the head, 0 at the sides and bottom
    const w = p.width * (1 + p.widthTaper * toward * toward);
    const th = p.thickness * (1 + p.thicknessTaper * toward * toward);
    const dirX = Math.sin(phi);
    const dirY = Math.cos(phi);
    for (const [u, v] of section) {
      const r = radius + v * th;
      positions.push(dirX * r, dirY * r, u * w);
    }
  }

  const stride = PROFILE + 1;
  for (let i = 0; i < RADIAL; i++) {
    for (let k = 0; k < PROFILE; k++) {
      const a = i * stride + k;
      const b = (i + 1) * stride + k;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Outer radius of the band at the top (where the head is seated). */
export function bandTop(radius: number, p: BandProfile) {
  return radius + p.thickness * (1 + p.thicknessTaper);
}
