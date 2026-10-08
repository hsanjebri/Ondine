"use client";

import * as THREE from "three";
import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ShapeId } from "@/lib/composer-options";
import { gemGeometry } from "./geometry/gem";

/** Key light direction (world): glints flash when a facet reflects it toward the camera. */
const LIGHT = new THREE.Vector3(0.35, 1, 0.5).normalize();
const COUNT = 16;

function starTexture() {
  const size = 64;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = size / 2;
  const glow = g.createRadialGradient(r, r, 0, r, r, r);
  glow.addColorStop(0, "rgba(255,255,255,1)");
  glow.addColorStop(0.12, "rgba(255,250,240,0.85)");
  glow.addColorStop(0.35, "rgba(255,245,230,0.12)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, size, size);
  // Four-point star
  g.globalCompositeOperation = "lighter";
  for (const [w, h] of [
    [size, 1.6],
    [1.6, size],
  ]) {
    const grad = g.createLinearGradient(w > h ? 0 : r, w > h ? r : 0, w > h ? size : r, w > h ? r : size);
    grad.addColorStop(0, "rgba(255,255,255,0)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(r - w / 2, r - h / 2, w, h);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * Sparkles that follow the light: small stars sit on crown facets and
 * flash when that facet's reflection of the key light points at the camera,
 * so they come and go as the ring turns.
 */
export function Glints({ shape, intensity = 1 }: { shape: ShapeId; intensity?: number }) {
  const points = useRef<THREE.Points>(null);
  const texture = useMemo(() => starTexture(), []);
  useLayoutEffect(() => () => texture.dispose(), [texture]);

  const data = useMemo(() => {
    const pos = gemGeometry(shape).getAttribute("position");
    const facets: Array<{ p: THREE.Vector3; n: THREE.Vector3 }> = [];
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    for (let i = 0; i < pos.count; i += 3) {
      a.fromBufferAttribute(pos, i);
      b.fromBufferAttribute(pos, i + 1);
      c.fromBufferAttribute(pos, i + 2);
      const centre = new THREE.Vector3().add(a).add(b).add(c).divideScalar(3);
      if (centre.y < 0.04) continue; // crown only
      const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)).normalize();
      if (n.y < 0.15) continue;
      facets.push({ p: centre.multiplyScalar(1.02), n });
    }
    // Evenly pick COUNT facets
    const picked = Array.from({ length: COUNT }, (_, k) => facets[Math.floor((k / COUNT) * facets.length)]);
    const positions = new Float32Array(picked.flatMap((f) => [f.p.x, f.p.y, f.p.z]));
    const colors = new Float32Array(COUNT * 3);
    return { picked, positions, colors, phase: picked.map((_, k) => k * 1.7) };
  }, [shape]);

  const tmp = useMemo(
    () => ({ p: new THREE.Vector3(), n: new THREE.Vector3(), v: new THREE.Vector3(), h: new THREE.Vector3(), nm: new THREE.Matrix3() }),
    [],
  );

  useFrame(({ camera, clock }) => {
    const obj = points.current;
    if (!obj) return;
    const colors = obj.geometry.getAttribute("color") as THREE.BufferAttribute;
    tmp.nm.getNormalMatrix(obj.matrixWorld);
    const t = clock.elapsedTime;
    for (let i = 0; i < data.picked.length; i++) {
      const f = data.picked[i];
      tmp.p.copy(f.p).applyMatrix4(obj.matrixWorld);
      tmp.n.copy(f.n).applyMatrix3(tmp.nm).normalize();
      tmp.v.subVectors(camera.position, tmp.p).normalize();
      tmp.h.addVectors(tmp.v, LIGHT).normalize();
      const spec = Math.pow(Math.max(0, tmp.n.dot(tmp.h)), 60);
      const twinkle = 0.55 + 0.45 * Math.sin(t * 2.6 + data.phase[i]);
      const s = Math.min(1, spec * twinkle * 2.2 * intensity);
      colors.setXYZ(i, s, s * 0.97, s * 0.92);
    }
    colors.needsUpdate = true;
  });

  return (
    <points ref={points} key={shape} renderOrder={3}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={2.4}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
