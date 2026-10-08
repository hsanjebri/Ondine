"use client";

import * as THREE from "three";
import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";

/**
 * A modelled part loaded from /public/models. Metal parts receive the
 * composer's animated metal material; stones keep their own materials.
 */
export function GlbPart({ url, material }: { url: string; material?: THREE.Material }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => {
    const c = scene.clone(true);
    if (material) {
      c.traverse((o) => {
        if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = material;
      });
    }
    return c;
  }, [scene, material]);
  return <primitive object={clone} />;
}
