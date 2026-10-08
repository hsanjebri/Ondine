"use client";

import * as THREE from "three";
import { createContext, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshRefractionMaterial } from "@react-three/drei";
import {
  METALS,
  type ColourGrade,
  type RingConfig,
  type SettingId,
  type ShapeId,
} from "@/lib/composer-options";
import { bandGeometry, bandTop, BAND_PROFILES, innerRadius } from "./geometry/band";
import {
  crownHeight,
  gemGeometry,
  OUTLINES,
  pavilionDepth,
  prongAngles,
  stoneDiameter,
} from "./geometry/gem";
import { fadeOf, useCrossfade, type Fades } from "./useCrossfade";
import { MODEL_OVERRIDES } from "./models";
import { GlbPart } from "./GlbPart";
import { Glints } from "./Glints";

/*
 * The ring, built procedurally (units: mm, ring axis = Z, head on +Y).
 *   Band layer  — crossfades when the setting changes (profile, pavé stones)
 *   Head anchor — eased height + scale following the stone (carat, size)
 *     Head layer   — crossfades on setting or shape (claws, gallery, halo, side stones)
 *     Centre stone — dissolves on shape change, scales live with the carat
 * Any part can be replaced by a .glb through ./models.ts.
 */

interface MetalState {
  color: THREE.Color;
  roughness: number;
}

const MetalContext = createContext<MetalState | null>(null);
const useMetal = () => useContext(MetalContext)!;

/** Faint warmth for lower colour grades. */
const TINT: Record<ColourGrade, string> = {
  D: "#ffffff",
  E: "#fefefc",
  F: "#fffcf5",
  G: "#fff8eb",
  H: "#fff1d9",
};

const damp = (dt: number, lambda: number) => 1 - Math.exp(-lambda * dt);

function createMetalState(color: string, roughness: number): MetalState {
  return { color: new THREE.Color(color), roughness };
}

/** Ease the shared metal toward the selected one (~600 ms). */
function stepMetal(metal: MetalState, color: THREE.Color, roughness: number, dt: number) {
  const k = damp(dt, 5.5);
  metal.color.lerp(color, k);
  metal.roughness += (roughness - metal.roughness) * k;
}

function syncLayerMetal(material: THREE.MeshPhysicalMaterial, metal: MetalState, opacity: number) {
  material.color.copy(metal.color);
  material.roughness = metal.roughness;
  material.opacity = opacity;
}

/** A metal material that follows the animated metal colour and fades by alpha hash (a dithered dissolve). */
function useLayerMetal(fades: Fades, id: number) {
  const metal = useMetal();
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        metalness: 1,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 1.25,
        alphaHash: true,
      }),
    [],
  );
  useFrame(() => syncLayerMetal(material, metal, fadeOf(fades, id)));
  useLayoutEffect(() => () => material.dispose(), [material]);
  return material;
}

/* ───────────────────────── helpers ───────────────────────── */

const UP = new THREE.Vector3(0, 1, 0);

function Capsule({
  from,
  to,
  radius,
  material,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  radius: number;
  material: THREE.Material;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    return {
      position: new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()),
      length: len,
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion} material={material}>
      <capsuleGeometry args={[radius, Math.max(0.001, length), 4, 10]} />
    </mesh>
  );
}

function outlinePath(shape: ShapeId, scale: number, y: number, samples = 96) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < samples; i++) {
    const [x, z] = OUTLINES[shape]((i / samples) * Math.PI * 2);
    pts.push(new THREE.Vector3(x * scale, y, z * scale));
  }
  return new THREE.CatmullRomCurve3(pts, true, "centripetal");
}

function OutlineTube({
  shape,
  scale,
  y,
  radius,
  material,
}: {
  shape: ShapeId;
  scale: number;
  y: number;
  radius: number;
  material: THREE.Material;
}) {
  const geometry = useMemo(
    () => new THREE.TubeGeometry(outlinePath(shape, scale, y), 128, radius, 8, true),
    [shape, scale, y, radius],
  );
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);
  return <mesh geometry={geometry} material={material} />;
}

/** Claws around a stone (unit space: girdle radius 1, girdle at y = 0). */
function Claws({
  shape,
  baseY,
  radius,
  material,
}: {
  shape: ShapeId;
  baseY: number;
  radius: number;
  material: THREE.Material;
}) {
  const claws = useMemo(
    () =>
      prongAngles(shape).map((a) => {
        const [x, z] = OUTLINES[shape](a);
        return {
          base: new THREE.Vector3(x * 0.42, baseY, z * 0.42),
          shoulder: new THREE.Vector3(x * 1.05, -0.06, z * 1.05),
          tip: new THREE.Vector3(x * 0.93, crownHeight(shape) * 0.55, z * 0.93),
        };
      }),
    [shape, baseY],
  );
  return (
    <group>
      {claws.map((c, i) => (
        <group key={i}>
          <Capsule from={c.base} to={c.shoulder} radius={radius} material={material} />
          <Capsule from={c.shoulder} to={c.tip} radius={radius * 0.92} material={material} />
        </group>
      ))}
    </group>
  );
}

/* ───────────────────────── stones ───────────────────────── */

function StoneMesh({
  shape,
  envMap,
  colour,
  fades,
  id,
  bounces = 3,
}: {
  shape: ShapeId;
  envMap: THREE.Texture;
  colour: ColourGrade;
  fades: Fades;
  id: number;
  bounces?: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = gemGeometry(shape);
  useFrame(() => {
    const m = mesh.current;
    if (!m) return;
    const f = fadeOf(fades, id);
    (m.material as THREE.ShaderMaterial & { opacity: number }).opacity = f;
    m.scale.setScalar(0.55 + 0.45 * f);
  });
  return (
    <mesh ref={mesh} geometry={geometry} renderOrder={2}>
      {/* keyed by shape: the material builds its BVH from this geometry once */}
      <MeshRefractionMaterial
        key={shape}
        envMap={envMap}
        bounces={bounces}
        ior={2.4}
        fresnel={0.9}
        aberrationStrength={0.012}
        fastChroma
        color={TINT[colour]}
        transparent
        toneMapped={false}
      />
    </mesh>
  );
}

/** Small accent diamonds, instanced (halo, pavé). */
function AccentStones({
  matrices,
  envMap,
  colour,
  fades,
  id,
}: {
  matrices: THREE.Matrix4[];
  envMap: THREE.Texture;
  colour: ColourGrade;
  fades: Fades;
  id: number;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = gemGeometry("round");
  useLayoutEffect(() => {
    const m = mesh.current;
    if (!m) return;
    matrices.forEach((mat, i) => m.setMatrixAt(i, mat));
    m.instanceMatrix.needsUpdate = true;
    m.computeBoundingSphere();
  }, [matrices]);
  useFrame(() => {
    const m = mesh.current;
    if (m) (m.material as THREE.ShaderMaterial & { opacity: number }).opacity = fadeOf(fades, id);
  });
  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, matrices.length]} key={matrices.length} renderOrder={2}>
      <MeshRefractionMaterial
        envMap={envMap}
        bounces={2}
        ior={2.4}
        fresnel={1}
        aberrationStrength={0.01}
        fastChroma
        color={TINT[colour]}
        transparent
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/* ───────────────────────── band ───────────────────────── */

function BandLayer({
  setting,
  radius,
  config,
  envMap,
  fades,
  id,
}: {
  setting: SettingId;
  radius: number;
  config: RingConfig;
  envMap: THREE.Texture;
  fades: Fades;
  id: number;
}) {
  const material = useLayerMetal(fades, id);
  const profile = BAND_PROFILES[setting];
  const geometry = useMemo(() => bandGeometry(radius, profile), [radius, profile]);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  // Pavé: a row of small diamonds over the upper band, leaving room for the head.
  const pave = useMemo(() => {
    if (setting !== "pave") return [];
    const out = radius + profile.thickness * (1 + profile.thicknessTaper * 0.6);
    const r = 0.62;
    const step = (2 * r + 0.14) / out;
    const headClear = Math.asin(Math.min(0.95, (stoneDiameter(config.carat) * 0.45 + 0.9) / out));
    const list: THREE.Matrix4[] = [];
    for (let a = headClear + step * 0.5; a < (72 * Math.PI) / 180; a += step) {
      for (const side of [-1, 1]) {
        const phi = side * a;
        const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -phi);
        const p = new THREE.Vector3(Math.sin(phi) * (out - 0.12), Math.cos(phi) * (out - 0.12), 0);
        list.push(new THREE.Matrix4().compose(p, q, new THREE.Vector3(r, r, r)));
      }
    }
    return list;
  }, [setting, radius, profile, config.carat]);

  const override = MODEL_OVERRIDES.band;
  return (
    <group>
      {override ? (
        <GlbPart url={override} material={material} />
      ) : (
        <mesh geometry={geometry} material={material} castShadow />
      )}
      {pave.length ? (
        <AccentStones matrices={pave} envMap={envMap} colour={config.colour} fades={fades} id={id} />
      ) : null}
    </group>
  );
}

/* ───────────────────────── head ───────────────────────── */

function HeadLayer({
  setting,
  shape,
  config,
  envMap,
  fades,
  id,
  bandTopLocal,
}: {
  setting: SettingId;
  shape: ShapeId;
  config: RingConfig;
  envMap: THREE.Texture;
  fades: Fades;
  id: number;
  /** Top of the band, in stone units (negative) */
  bandTopLocal: number;
}) {
  const material = useLayerMetal(fades, id);
  const claw = 0.095;
  const pav = pavilionDepth(shape);

  // Halo: accent stones following the centre stone's outline.
  const halo = useMemo(() => {
    if (setting !== "halo") return null;
    const hr = 0.19;
    const path = outlinePath(shape, 1.08 + hr, 0.03, 160);
    const count = Math.max(10, Math.round(path.getLength() / (2 * hr + 0.045)));
    const points = path.getSpacedPoints(count).slice(0, count);
    const matrices = points.map((p) =>
      new THREE.Matrix4().compose(p, new THREE.Quaternion(), new THREE.Vector3(hr, hr, hr)),
    );
    return { matrices, scale: 1.08 + hr };
  }, [setting, shape]);

  // Trilogy: two side stones following the curve of the band.
  const sides = useMemo(() => {
    if (setting !== "trilogy") return null;
    const sideShape: ShapeId = shape === "pear" ? "round" : shape;
    const s2 = Math.cbrt(0.25);
    const extent = (sh: ShapeId) => {
      let m = 0;
      for (let i = 0; i < 64; i++) m = Math.max(m, Math.abs(OUTLINES[sh]((i / 64) * Math.PI * 2)[1]));
      return m;
    };
    const offset = extent(shape) + s2 * extent(sideShape) + 0.12;
    // Distance from the ring centre to the girdle, in stone units
    const rh = pav - bandTopLocal + 6;
    const tilt = Math.asin(Math.min(0.9, offset / rh));
    return { sideShape, s2, list: [-1, 1].map((sgn) => ({ sgn, z: sgn * offset, y: -(rh - Math.cos(tilt) * rh) - 0.12, tilt })) };
  }, [setting, shape, pav, bandTopLocal]);

  const override = MODEL_OVERRIDES[`setting-${setting}`];
  if (override) return <GlbPart url={override} material={material} />;

  return (
    <group>
      <Claws shape={shape} baseY={bandTopLocal - 0.1} radius={claw} material={material} />
      <OutlineTube shape={shape} scale={0.62} y={-pav * 0.45} radius={0.06} material={material} />

      {halo ? (
        <group>
          <OutlineTube shape={shape} scale={halo.scale} y={-0.1} radius={0.17} material={material} />
          {[0.25, 0.75, 1.25, 1.75].map((k) => {
            const [x, z] = OUTLINES[shape](k * Math.PI);
            return (
              <Capsule
                key={k}
                from={new THREE.Vector3(x * halo.scale * 0.9, -0.15, z * halo.scale * 0.9)}
                to={new THREE.Vector3(x * 0.5, bandTopLocal, z * 0.5)}
                radius={0.07}
                material={material}
              />
            );
          })}
          <AccentStones matrices={halo.matrices} envMap={envMap} colour={config.colour} fades={fades} id={id} />
        </group>
      ) : null}

      {sides
        ? sides.list.map((s) => (
            <group key={s.sgn} position={[0, s.y, s.z]} rotation={[s.sgn * s.tilt, 0, 0]}>
              <group scale={sides.s2}>
                <StoneMesh
                  shape={sides.sideShape}
                  envMap={envMap}
                  colour={config.colour}
                  fades={fades}
                  id={id}
                  bounces={2}
                />
                <Claws
                  shape={sides.sideShape === "round" ? "princess" : sides.sideShape}
                  baseY={-pavilionDepth(sides.sideShape) - 0.5}
                  radius={claw / sides.s2}
                  material={material}
                />
              </group>
            </group>
          ))
        : null}
    </group>
  );
}

/* ───────────────────────── ring ───────────────────────── */

export function RingModel({ config, envMap }: { config: RingConfig; envMap: THREE.Texture }) {
  const target = METALS.find((m) => m.id === config.metal)!;
  const [metal] = useState(() => createMetalState(target.color, target.roughness));
  const targetColor = useMemo(() => new THREE.Color(target.color), [target.color]);

  const radius = innerRadius(config.size ?? 52);
  const stoneRadius = stoneDiameter(config.carat) / 2;
  const top = bandTop(radius, BAND_PROFILES[config.setting]);
  const headY = top + 0.3 + pavilionDepth(config.shape) * stoneRadius;

  const anchor = useRef<THREE.Group>(null);
  const band = useCrossfade(config.setting, 0.55, 0.4);
  const head = useCrossfade(`${config.setting}|${config.shape}`, 0.5, 0.3);
  const stone = useCrossfade(config.shape, 0.42, 0.22);

  useFrame((_, dt) => {
    stepMetal(metal, targetColor, target.roughness, dt);
    // Head: follows carat and size.
    const a = anchor.current;
    if (a) {
      const s = damp(dt, 9);
      a.position.y += (headY - a.position.y) * s;
      a.scale.setScalar(a.scale.x + (stoneRadius - a.scale.x) * s);
    }
  });

  return (
    <MetalContext.Provider value={metal}>
      {band.layers.map((l) => (
        <BandLayer
          key={l.id}
          id={l.id}
          fades={band.fades}
          setting={l.value}
          radius={radius}
          config={config}
          envMap={envMap}
        />
      ))}

      <group ref={anchor} position={[0, headY, 0]} scale={stoneRadius}>
        {/* Long axis of the stone along the finger (Z) */}
        <group rotation={[0, Math.PI / 2, 0]}>
          {head.layers.map((l) => {
            const [setting, shape] = l.value.split("|") as [SettingId, ShapeId];
            return (
              <HeadLayer
                key={l.id}
                id={l.id}
                fades={head.fades}
                setting={setting}
                shape={shape}
                config={config}
                envMap={envMap}
                bandTopLocal={-(pavilionDepth(shape) + 0.3 / stoneRadius)}
              />
            );
          })}
          {stone.layers.map((l) =>
            MODEL_OVERRIDES[`stone-${l.value}`] ? (
              <GlbPart key={l.id} url={MODEL_OVERRIDES[`stone-${l.value}`]!} />
            ) : (
              <StoneMesh key={l.id} id={l.id} fades={stone.fades} shape={l.value} envMap={envMap} colour={config.colour} />
            ),
          )}
          <Glints shape={config.shape} />
        </group>
      </group>
    </MetalContext.Provider>
  );
}
