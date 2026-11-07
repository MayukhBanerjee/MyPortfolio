"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useSite } from "@/components/Providers";

/**
 * The page is a match. Scroll position maps to 00'–90', half-time shows HT.
 * Ticks with scroll, never with time.
 */
export default function MatchClock() {
  const { phase } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const valRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const p = self.progress;
        const m = Math.round(p * 90);
        if (valRef.current) valRef.current.textContent = m >= 44 && m <= 46 ? "HT" : `${String(m).padStart(2, "0")}'`;
        if (ref.current) ref.current.style.opacity = p > 0.025 && p < 0.985 && phase === "done" ? "1" : "0";
      },
    });
    return () => st.kill();
  }, [phase]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="site-chrome mono pointer-events-none fixed left-1/2 top-[17px] z-[86] -translate-x-1/2 md:bottom-6 md:left-[var(--gutter)] md:top-auto md:translate-x-0 text-[var(--paper)] opacity-0 mix-blend-difference transition-opacity duration-500"
    >
      <span ref={valRef}>00&apos;</span>
    </div>
  );
}
