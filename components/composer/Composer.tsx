"use client";

import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { describe } from "@/lib/composer-options";
import { decodeConfig, encodeConfig } from "@/lib/composer-url";
import { cn } from "@/lib/cn";
import { useComposer, type CameraPreset } from "@/store/composer";
import { CornerFrame } from "@/components/media/CornerFrame";
import { Ring2D } from "./Ring2D";
import { Panel } from "./Panel";

// The 3D scene (three + R3F + drei) is only downloaded on this route, in the browser.
const ComposerCanvas = dynamic(() => import("./three/ComposerCanvas"), { ssr: false });

type View = "3d" | "2d";

/* ── Capability check: WebGL present and a device that can carry it ── */
let detected: View | null = null;
function detectView(): View {
  if (detected) return detected;
  const params = new URLSearchParams(window.location.search);
  if (params.get("view") === "2d") return (detected = "2d");
  if (params.get("view") === "3d") return (detected = "3d");
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") ?? c.getContext("webgl");
    if (!gl) return (detected = "2d");
  } catch {
    return (detected = "2d");
  }
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  detected = cores <= 2 || memory <= 1 ? "2d" : "3d";
  return detected;
}
const noop = () => () => {};

class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const PRESETS: Array<{ id: CameraPreset; label: string }> = [
  { id: "front", label: "Front" },
  { id: "top", label: "Top" },
  { id: "hand", label: "On hand" },
];

export function Composer() {
  const config = useComposer((s) => s.config);
  const camera = useComposer((s) => s.camera);
  const setCamera = useComposer((s) => s.setCamera);
  const detectedView = useSyncExternalStore<View | null>(noop, detectView, () => null);
  const [chosen, setChosen] = useState<View | null>(null);
  const [ready, setReady] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);
  const view = chosen ?? detectedView;
  // ?view=3d forces the 3D scene (and skips the FPS probe), e.g. for testing.
  const forced3d = useSyncExternalStore(noop, () => new URLSearchParams(window.location.search).get("view") === "3d", () => false);

  // Restore the last ring (localStorage), then let a shared link override it.
  useEffect(() => {
    void Promise.resolve(useComposer.persist.rehydrate()).then(() => {
      const fromUrl = decodeConfig(window.location.search, useComposer.getState().config);
      if (fromUrl) useComposer.getState().replace(fromUrl);
    });
  }, []);

  // Keep the address bar in sync: the URL is always a link to this exact ring.
  useEffect(() => {
    let timer = 0;
    const unsub = useComposer.subscribe((s, prev) => {
      if (s.config === prev.config) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const keep = new URLSearchParams(window.location.search).get("view");
        const q = encodeConfig(s.config) + (keep ? `&view=${keep}` : "");
        window.history.replaceState(window.history.state, "", `${window.location.pathname}?${q}`);
      }, 150);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  const onReady = useCallback(() => setReady(true), []);
  const onLow = useCallback(() => {
    setChosen("2d");
    setSlowNotice(true);
  }, []);
  const onCanvasError = useCallback(() => setChosen("2d"), []);

  return (
    <div className="grid lg:min-h-svh lg:grid-cols-[minmax(0,1.55fr)_minmax(24rem,1fr)]">
      {/* Viewer */}
      <div
        className="theme-ink sticky top-0 z-[3] h-[50svh] overflow-hidden bg-black lg:z-[1] lg:h-svh"
        data-lenis-prevent
        data-cursor={view === "3d" ? "rotate" : undefined}
      >
        <div
          role="img"
          aria-label={`Your ring: ${describe(config)}`}
          className="absolute inset-0"
        >
          {view === "3d" ? (
            <CanvasBoundary onError={onCanvasError}>
              <ComposerCanvas
                config={config}
                onReady={onReady}
                onLowPerformance={forced3d ? undefined : onLow}
                className="!absolute inset-0"
              />
            </CanvasBoundary>
          ) : null}
          {view === "2d" ? (
            <div className="absolute inset-0 flex items-center justify-center p-6 pt-[calc(var(--header-h)+1rem)]">
              <div className="aspect-square h-full max-h-[34rem] max-w-full">
                <Ring2D config={config} />
              </div>
            </div>
          ) : null}
        </div>

        {/* Loading veil (3D) */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black transition-opacity duration-700 ease-ondine",
            view === "3d" && !ready ? "opacity-100" : "opacity-0",
          )}
        >
          <span className="relative block h-px w-32 overflow-hidden bg-ivory/15">
            <span className="composer-loading absolute inset-0 bg-gold" />
          </span>
          <span className="mono text-ivory/60">setting the stone</span>
        </div>

        <CornerFrame belowHeader tl="the composer" tr="atelier saint-honoré" bl="" br={view === "3d" ? "drag to turn · scroll to zoom" : "2d view"} className="text-ivory/60" />

        {/* Camera presets + view switch */}
        <div className="absolute inset-x-0 bottom-12 flex flex-wrap items-center justify-between gap-4 px-gutter lg:bottom-14">
          {view === "3d" ? (
            <div role="group" aria-label="Camera" className="flex gap-5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={camera === p.id}
                  onClick={() => setCamera(p.id)}
                  className={cn("micro link-line", camera === p.id ? "text-ivory" : "text-ivory/55 hover:text-ivory")}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : (
            <span />
          )}
          {view ? (
            <button
              type="button"
              className="mono link-line text-ivory/60 hover:text-ivory"
              onClick={() => {
                setSlowNotice(false);
                setChosen(view === "3d" ? "2d" : "3d");
              }}
            >
              {view === "3d" ? "view in 2d" : "view in 3d"}
            </button>
          ) : null}
        </div>
        {slowNotice ? (
          <p role="status" className="mono absolute inset-x-0 top-[calc(var(--header-h)+2.5rem)] text-center text-ivory/70">
            showing the 2d view for a smoother experience
          </p>
        ) : null}
      </div>

      {/* Panel (a bottom sheet on small screens) */}
      <div className="relative z-[2] overflow-clip rounded-t-[1.25rem] lg:rounded-none">
        <span aria-hidden className="absolute top-2.5 left-1/2 h-1 w-10 -translate-x-1/2 rounded-full bg-ink/20 lg:hidden" />
        <Panel />
      </div>
    </div>
  );
}
