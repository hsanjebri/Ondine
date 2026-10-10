"use client";

import { useEffect } from "react";
import { describe, getDesign, label, pieceName } from "@/lib/composer-options";
import { decodeConfig, encodeConfig } from "@/lib/composer-url";
import { useComposer } from "@/store/composer";
import { CornerFrame } from "@/components/media/CornerFrame";
import { Stage, type PhotoCredit } from "./Stage";
import { Panel } from "./Panel";

/**
 * The composer: a photo stage (real pieces, backgrounds removed) beside the
 * configuration panel. On small screens the stage stays pinned to the top
 * half, so every choice made in the panel below is seen as it happens.
 */
export function Composer({ credits }: { credits: Partial<Record<string, PhotoCredit>> }) {
  const config = useComposer((s) => s.config);

  // Restore the last piece (localStorage), then let a shared link override it.
  useEffect(() => {
    void Promise.resolve(useComposer.persist.rehydrate()).then(() => {
      const fromUrl = decodeConfig(window.location.search, useComposer.getState().config);
      if (fromUrl) useComposer.getState().replace(fromUrl);
    });
  }, []);

  // Keep the address bar in sync: the URL is always a link to this exact piece.
  useEffect(() => {
    let timer = 0;
    const unsub = useComposer.subscribe((s, prev) => {
      if (s.config === prev.config) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        window.history.replaceState(window.history.state, "", `${window.location.pathname}?${encodeConfig(s.config)}`);
      }, 150);
    });
    return () => {
      unsub();
      window.clearTimeout(timer);
    };
  }, []);

  const design = getDesign(config.design);

  return (
    <div className="grid grid-cols-1 lg:min-h-svh lg:grid-cols-[minmax(0,1.55fr)_minmax(24rem,1fr)]">
      {/* Stage */}
      <div
        className="theme-ink sticky top-0 z-[3] h-[52svh] overflow-hidden bg-black lg:z-[1] lg:h-svh"
        data-cursor="view"
        role="img"
        aria-label={`Your piece: ${describe(config)}`}
      >
        <Stage config={config} credits={credits} />
        <CornerFrame
          belowHeader
          tl="the composer"
          tr={`${label.piece(config.piece).toLowerCase()} — ${design.label.toLowerCase()}`}
          bl=""
          br=""
          className="text-ivory/60"
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-11 z-[6] px-gutter text-center lg:bottom-14">
          <span className="font-serif text-[clamp(1.4rem,2.4vw,2.2rem)] font-light text-ivory">{pieceName(config)}</span>
          <span className="mono mt-1 block text-ivory/55">{label.metal(config.metal).toLowerCase()}</span>
        </p>
      </div>

      {/* Panel (a bottom sheet on small screens) */}
      <div className="relative z-[2] min-w-0 overflow-clip rounded-t-[1.25rem] lg:rounded-none">
        <span aria-hidden className="absolute top-2.5 left-1/2 z-[1] h-1 w-10 -translate-x-1/2 rounded-full bg-ink/20 lg:hidden" />
        <Panel />
      </div>
    </div>
  );
}
