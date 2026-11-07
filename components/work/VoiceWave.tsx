"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";

/** Evoke: no diagram. One thin voice line that breathes, slowly. */
export default function VoiceWave() {
  const wrap = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const inView = useInView(wrap);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const W = 400;
    const N = 160;
    const draw = (t: number) => {
      const time = reduced ? 0 : t / 1000;
      let d = "";
      for (let i = 0; i <= N; i++) {
        const x = (i / N) * W;
        const u = i / N;
        const env = Math.pow(Math.sin(Math.PI * u), 2) * (0.55 + 0.45 * Math.sin(time * 0.6 + u * 3));
        const y =
          50 +
          env *
            (14 * Math.sin(u * 38 + time * 2.1) + 7 * Math.sin(u * 91 - time * 3.3) + 4 * Math.sin(u * 170 + time * 1.3));
        d += `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(2)}`;
      }
      path.current?.setAttribute("d", d);
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  return (
    <div ref={wrap} className="absolute inset-0 flex flex-col justify-center px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_50%,rgba(240,226,200,0.08),transparent)]" />
      <svg viewBox="0 0 400 100" className="relative w-full" aria-hidden="true">
        <path ref={path} fill="none" stroke="#f0ede8" strokeWidth="0.9" strokeLinecap="round" />
      </svg>
    </div>
  );
}
