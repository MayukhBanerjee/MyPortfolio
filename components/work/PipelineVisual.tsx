"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView, useNearViewport } from "@/lib/hooks";
import { LABELS, WORLD_W } from "@/components/three/pipeline-layout";

const PipelineScene = dynamic(() => import("@/components/three/PipelineScene"), { ssr: false });

/** Lazy wrapper: the WebGL canvas only exists near the viewport and only renders while visible. */
export default function PipelineVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(ref);
  const inView = useInView(ref);

  return (
    <div ref={ref} className="absolute inset-0" style={{ containerType: "inline-size" }}>
      {near && <PipelineScene active={inView} counterRef={counterRef} />}
      {/* labels as plain DOM (1 world unit = 10cqw), positioned to match the orthographic camera */}
      {LABELS.map((l) => (
        <span
          key={l.text}
          className="mono pointer-events-none absolute whitespace-nowrap text-[9px] text-[var(--mute)]"
          style={{
            left: `${((l.x + WORLD_W / 2) / WORLD_W) * 100}%`,
            top: `calc(50% - ${l.y} * ${100 / WORLD_W}cqw)`,
          }}
        >
          {l.text}
        </span>
      ))}
      <div className="mono pointer-events-none absolute bottom-4 left-5 right-5 flex flex-wrap justify-between gap-x-4 text-[9px] text-[var(--mute)]">
        <span>
          sent <span ref={counterRef} className="text-[var(--paper)]">0</span> / 1,00,000
        </span>
        <span className="hidden sm:inline">[ simulated campaign ]</span>
      </div>
    </div>
  );
}
