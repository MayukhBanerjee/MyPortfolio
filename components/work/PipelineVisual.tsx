"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { useInView, useNearViewport } from "@/lib/hooks";

const PipelineScene = dynamic(() => import("@/components/three/PipelineScene"), { ssr: false });

/** Lazy wrapper: the WebGL canvas only exists near the viewport and only renders while visible. */
export default function PipelineVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(ref);
  const inView = useInView(ref);

  return (
    <div ref={ref} className="absolute inset-0">
      {near && <PipelineScene active={inView} counterRef={counterRef} />}
      <div className="mono pointer-events-none absolute bottom-4 left-5 right-5 flex flex-wrap justify-between gap-x-4 text-[9px] text-[var(--mute)]">
        <span>
          sent <span ref={counterRef} className="text-[var(--paper)]">0</span> / 1,00,000
        </span>
        <span className="hidden sm:inline">[ simulated campaign ]</span>
      </div>
    </div>
  );
}
