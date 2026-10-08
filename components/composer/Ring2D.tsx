"use client";

import { useEffect, useMemo, useRef } from "react";
import { METALS, type RingConfig, type ShapeId } from "@/lib/composer-options";
import { useComposer } from "@/store/composer";
import { BAND_PROFILES, innerRadius } from "./three/geometry/band";
import { crownHeight, OUTLINES, pavilionDepth, stoneDiameter } from "./three/geometry/gem";

const PX = 8.5; // px per mm
const CX = 200;
const CY = 250;

const TINT: Record<RingConfig["colour"], string> = {
  D: "#ffffff",
  E: "#fdfdfb",
  F: "#fcf9f1",
  G: "#faf3e2",
  H: "#f6ebd0",
};

/** Half-width of a stone seen from the front (across the finger), in stone units. */
function sideExtent(shape: ShapeId) {
  let m = 0;
  for (let i = 0; i < 64; i++) m = Math.max(m, Math.abs(OUTLINES[shape]((i / 64) * Math.PI * 2)[1]));
  return m;
}

function outlinePath(shape: ShapeId, scale: number, cx: number, cy: number) {
  const pts = Array.from({ length: 72 }, (_, i) => {
    const [x, z] = OUTLINES[shape]((i / 72) * Math.PI * 2);
    return `${(cx + z * scale).toFixed(2)},${(cy - x * scale).toFixed(2)}`;
  });
  return `M${pts.join("L")}Z`;
}

/**
 * 2D fallback: the same ring drawn as layered SVG (band, claws, stone,
 * accents), from the same parameters as the 3D model. Used when WebGL is
 * missing or the device is too slow; same panel, same price.
 */
export function Ring2D({ config }: { config: RingConfig }) {
  const svg = useRef<SVGSVGElement>(null);
  const setSnapshot = useComposer((s) => s.setSnapshot);
  const metal = METALS.find((m) => m.id === config.metal)!;
  const profile = BAND_PROFILES[config.setting];

  const g = useMemo(() => {
    const R = innerRadius(config.size ?? 52) * PX;
    const t = profile.thickness * PX;
    const rs = (stoneDiameter(config.carat) / 2) * PX;
    const w = sideExtent(config.shape) * rs;
    const headY = R + t + 0.3 * PX + pavilionDepth(config.shape) * rs;
    const girdleY = CY - headY;
    const crown = crownHeight(config.shape) * rs;
    const pav = pavilionDepth(config.shape) * rs;
    return { R, t, rs, w, girdleY, crown, pav };
  }, [config.size, config.carat, config.shape, profile.thickness]);

  // Snapshot for the summary card: rasterise the SVG.
  useEffect(() => {
    setSnapshot(() => {
      const el = svg.current;
      if (!el) return null;
      const data = new XMLSerializer().serializeToString(el);
      const bytes = new TextEncoder().encode(data);
      let bin = "";
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return `data:image/svg+xml;base64,${btoa(bin)}`;
    });
    return () => setSnapshot(null);
  }, [setSnapshot]);

  const stone = (cx: number, gy: number, w: number, crown: number, pav: number, key: string) => (
    <g key={key}>
      <path
        d={`M${cx - w * 0.56},${gy - crown} L${cx + w * 0.56},${gy - crown} L${cx + w},${gy} L${cx},${gy + pav} L${cx - w},${gy} Z`}
        fill="url(#stone)"
        stroke="#c9d3db"
        strokeWidth={0.6}
      />
      <path
        d={`M${cx - w},${gy} L${cx + w},${gy} M${cx - w * 0.56},${gy - crown} L${cx - w * 0.2},${gy} L${cx},${gy - crown} L${cx + w * 0.2},${gy} L${cx + w * 0.56},${gy - crown} M${cx - w * 0.6},${gy} L${cx},${gy + pav} L${cx + w * 0.6},${gy}`}
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.55}
        strokeWidth={0.5}
      />
    </g>
  );

  const claws = (cx: number, gy: number, w: number, crown: number, baseY: number, key: string) => (
    <g key={key} stroke="url(#metal)" strokeWidth={Math.max(1.6, w * 0.08)} strokeLinecap="round" fill="none">
      <path d={`M${cx - w * 0.35},${baseY} L${cx - w * 1.03},${gy} L${cx - w * 0.9},${gy - crown * 0.6}`} />
      <path d={`M${cx + w * 0.35},${baseY} L${cx + w * 1.03},${gy} L${cx + w * 0.9},${gy - crown * 0.6}`} />
    </g>
  );

  const { R, t, w, girdleY, crown, pav, rs } = g;
  const bandTop = CY - R - t;
  const side = config.setting === "trilogy" ? Math.cbrt(0.25) : 0;
  const sideShape: ShapeId = config.shape === "pear" ? "round" : config.shape;

  return (
    <svg ref={svg} viewBox="0 0 400 400" role="img" aria-label="Your ring, 2D view" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={metal.color} stopOpacity={0.55} />
          <stop offset="0.45" stopColor={metal.color} />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity={0.85} />
          <stop offset="1" stopColor={metal.color} stopOpacity={0.7} />
        </linearGradient>
        <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor={TINT[config.colour]} />
          <stop offset="1" stopColor="#b9c6d1" />
        </linearGradient>
        <radialGradient id="velvet" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#1b1714" />
          <stop offset="1" stopColor="#0b0a09" />
        </radialGradient>
      </defs>
      <rect width="400" height="400" fill="url(#velvet)" />

      {/* Band */}
      <g style={{ transition: "opacity 0.6s cubic-bezier(0.22,1,0.36,1)" }}>
        <circle cx={CX} cy={CY} r={R + t / 2} fill="none" stroke="url(#metal)" strokeWidth={t} />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={1} />
        {config.setting === "pave"
          ? Array.from({ length: 14 }, (_, i) => {
              const a = ((i < 7 ? -1 : 1) * (18 + (i % 7) * 7.5) * Math.PI) / 180;
              return (
                <circle
                  key={i}
                  cx={CX + Math.sin(a) * (R + t)}
                  cy={CY - Math.cos(a) * (R + t)}
                  r={0.62 * PX * 0.75}
                  fill="url(#stone)"
                  stroke="#fff"
                  strokeOpacity={0.6}
                  strokeWidth={0.4}
                />
              );
            })
          : null}
      </g>

      {/* Head */}
      {config.setting === "halo" ? (
        <g>
          <rect x={CX - w - 0.5 * PX * 1.6} y={girdleY - 2} width={(w + 0.5 * PX * 1.6) * 2} height={4} rx={2} fill="url(#metal)" />
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} cx={CX - w - 6 + i * ((2 * w + 12) / 8)} cy={girdleY - 3} r={2.6} fill="url(#stone)" stroke="#fff" strokeOpacity={0.6} strokeWidth={0.4} />
          ))}
        </g>
      ) : null}

      {side
        ? [-1, 1].map((sgn) => {
            const ws = sideExtent(sideShape) * rs * side;
            const cx = CX + sgn * (w + ws + 0.35 * PX);
            const tilt = sgn * 12;
            const gy = girdleY + 0.25 * rs;
            return (
              <g key={sgn} transform={`rotate(${tilt} ${cx} ${gy})`}>
                {claws(cx, gy, ws, crownHeight(sideShape) * rs * side, bandTop + 3, `c${sgn}`)}
                {stone(cx, gy, ws, crownHeight(sideShape) * rs * side, pavilionDepth(sideShape) * rs * side, `s${sgn}`)}
              </g>
            );
          })
        : null}

      {claws(CX, girdleY, w, crown, bandTop + 3, "claws")}
      {stone(CX, girdleY, w, crown, pav, "stone")}

      {/* Table view of the shape */}
      <g transform="translate(330 64)">
        <circle r={40} fill="#14110f" stroke="#b89b6a" strokeOpacity={0.35} />
        <path d={outlinePath(config.shape, 26, 0, 0)} fill="url(#stone)" stroke="#fff" strokeOpacity={0.7} strokeWidth={0.6} />
        <text y={58} textAnchor="middle" fontFamily="var(--font-mono), monospace" fontSize="9" fill="#9a938a">
          table view
        </text>
      </g>
    </svg>
  );
}
