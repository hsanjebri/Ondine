"use client";

import * as THREE from "three";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useEnvironment } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/hooks";
import type { RingConfig } from "@/lib/composer-options";
import { useComposer, type CameraPreset } from "@/store/composer";
import { RingModel } from "./RingModel";
import { BAND_PROFILES, innerRadius } from "./geometry/band";

export const HDRI = "/hdri/studio_small_09_1k.hdr";
const BG = "#0b0a09";

/** Camera presets: position and target, relative to the ring resting on the velvet (y = 0). */
const PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  front: { pos: [24, 26, 100], target: [0, 14, 0] },
  top: { pos: [0.01, 112, 12], target: [0, 13, 0] },
  hand: { pos: [46, 72, 70], target: [0, 12, -8] },
};

export interface ComposerCanvasProps {
  config: RingConfig;
  /** Interactive composer (controls, presets) vs. a decorative turning ring (teaser). */
  interactive?: boolean;
  onReady?: () => void;
  onLowPerformance?: () => void;
  className?: string;
}

export default function ComposerCanvas({
  config,
  interactive = true,
  onReady,
  onLowPerformance,
  className,
}: ComposerCanvasProps) {
  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      camera={{ fov: 24, near: 1, far: 600, position: PRESETS.front.pos }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(BG)}
    >
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 150, 320]} />
      <Suspense fallback={null}>
        <Scene config={config} interactive={interactive} onReady={onReady} />
      </Suspense>
      {onLowPerformance ? <PerfProbe onLow={onLowPerformance} /> : null}
    </Canvas>
  );
}

function Scene({ config, interactive, onReady }: { config: RingConfig; interactive: boolean; onReady?: () => void }) {
  const env = useEnvironment({ files: HDRI });
  const ring = useRef<THREE.Group>(null);
  const radius = innerRadius(config.size ?? 52);
  // The ring rests on its outer bottom edge
  const restY = radius + BAND_PROFILES[config.setting].thickness;

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame((_, dt) => {
    const g = ring.current;
    if (g) g.position.y += (restY - g.position.y) * (1 - Math.exp(-8 * dt));
  });

  return (
    <>
      <Environment map={env} environmentIntensity={1.05} environmentRotation={[0, Math.PI * 0.35, 0]} />
      <group ref={ring} position={[0, restY, 0]}>
        <RingModel config={config} envMap={env} />
        <DisplayFinger radius={radius} />
      </group>
      <Velvet />
      <ContactShadows position={[0, 0.02, 0]} scale={70} blur={2.6} far={26} opacity={0.75} resolution={512} color="#000000" />
      {interactive ? <CameraRig /> : <TurnTable />}
      {interactive ? <Snapshotter /> : null}
    </>
  );
}

/** Radial alpha so the velvet melts into the background instead of ending in a horizon. */
function radialFade() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "#fff");
  grad.addColorStop(0.18, "#e6e6e6");
  grad.addColorStop(0.55, "#5a5a5a");
  grad.addColorStop(1, "#000");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/** A pool of black velvet under the ring, lit at the centre and fading into the dark. */
function Velvet() {
  const alpha = useMemo(() => radialFade(), []);
  useLayoutEffect(() => () => alpha.dispose(), [alpha]);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow renderOrder={-1}>
      <circleGeometry args={[58, 64]} />
      <meshPhysicalMaterial
        color="#1a1512"
        roughness={1}
        metalness={0}
        sheen={0.8}
        sheenColor="#3d332b"
        sheenRoughness={0.7}
        alphaMap={alpha}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

/** A jeweller's ceramic display finger, shown for the "On hand" view. */
function DisplayFinger({ radius }: { radius: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const preset = useComposer((s) => s.camera);
  const geometry = useMemo(() => {
    const r = radius - 0.06;
    const profile = [
      [0, -34],
      [r * 0.55, -33.4],
      [r * 0.86, -31],
      [r * 0.97, -24],
      [r, -8],
      [r, 0],
      [r * 1.04, 12],
      [r * 1.1, 30],
      [r * 1.12, 44],
    ].map(([x, y]) => new THREE.Vector2(x, y));
    const g = new THREE.LatheGeometry(profile, 64);
    g.rotateX(Math.PI / 2); // along Z; fingertip toward −Z
    return g;
  }, [radius]);
  useLayoutEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const target = preset === "hand" ? 1 : 0;
    const mat = m.material as THREE.MeshStandardMaterial;
    const k = 1 - Math.exp(-6 * dt);
    mat.opacity += (target - mat.opacity) * k;
    m.visible = mat.opacity > 0.01;
  });

  return (
    <mesh ref={mesh} geometry={geometry} visible={false}>
      <meshStandardMaterial color="#e6ddd0" roughness={0.6} metalness={0} alphaHash opacity={0} />
    </mesh>
  );
}

/** Orbit controls, idle auto-rotate, and GSAP-animated presets. */
function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null);
  const camera = useThree((s) => s.camera);
  const preset = useComposer((s) => s.camera);
  const reduced = prefersReducedMotion();

  // Presets
  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const p = PRESETS[preset];
    const duration = reduced ? 0 : 1.5;
    c.autoRotate = false;
    const t1 = gsap.to(camera.position, { x: p.pos[0], y: p.pos[1], z: p.pos[2], duration, onUpdate: () => c.update() });
    const t2 = gsap.to(c.target, { x: p.target[0], y: p.target[1], z: p.target[2], duration, onUpdate: () => c.update() });
    return () => {
      t1.kill();
      t2.kill();
    };
  }, [preset, camera, reduced]);

  // Idle auto-rotate: resumes 2.5 s after the last interaction.
  useEffect(() => {
    const c = controls.current;
    if (!c || reduced) return;
    let timer = 0;
    const start = () => {
      window.clearTimeout(timer);
      c.autoRotate = false;
    };
    const end = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (c.autoRotate = true), 2500);
    };
    c.addEventListener("start", start);
    c.addEventListener("end", end);
    timer = window.setTimeout(() => (c.autoRotate = true), 3000);
    return () => {
      window.clearTimeout(timer);
      c.removeEventListener("start", start);
      c.removeEventListener("end", end);
    };
  }, [reduced]);

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={PRESETS.front.target}
      enableDamping
      dampingFactor={0.08}
      enablePan={false}
      minDistance={52}
      maxDistance={170}
      maxPolarAngle={Math.PI * 0.49}
      autoRotateSpeed={0.8}
      rotateSpeed={0.7}
    />
  );
}

/** Teaser mode: the ring turns slowly on its own. */
function TurnTable() {
  const camera = useThree((s) => s.camera);
  useFrame(({ clock }) => {
    if (prefersReducedMotion()) return;
    const t = clock.elapsedTime * 0.25;
    camera.position.set(Math.sin(t) * 100, 28, Math.cos(t) * 100);
    camera.lookAt(0, 14, 0);
  });
  return null;
}

/** Registers a snapshot function for the summary card (no preserveDrawingBuffer needed). */
function Snapshotter() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const setSnapshot = useComposer((s) => s.setSnapshot);
  useEffect(() => {
    setSnapshot((width = 720) => {
      gl.render(scene, camera);
      const src = gl.domElement;
      const out = document.createElement("canvas");
      out.width = width;
      out.height = Math.round((width * src.height) / src.width);
      out.getContext("2d")!.drawImage(src, 0, 0, out.width, out.height);
      return out.toDataURL("image/jpeg", 0.86);
    });
    return () => setSnapshot(null);
  }, [gl, scene, camera, setSnapshot]);
  return null;
}

/** Quick FPS probe: if the first seconds run below ~24 fps, offer the 2D view. */
function PerfProbe({ onLow }: { onLow: () => void }) {
  const stats = useRef({ elapsed: 0, frames: 0, done: false });
  useFrame((_, dt) => {
    const s = stats.current;
    if (s.done) return;
    s.elapsed += dt;
    if (s.elapsed < 1.2) return; // warm-up (shader compilation)
    s.frames += 1;
    if (s.elapsed > 4.2) {
      s.done = true;
      const fps = s.frames / (s.elapsed - 1.2);
      if (fps < 24) onLow();
    }
  });
  return null;
}
