"use client";

import Lenis from "lenis";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export type Phase = "loading" | "done";

type Ctx = {
  phase: Phase;
  setPhase: (p: Phase) => void;
  lenis: Lenis | null;
};

const SiteCtx = createContext<Ctx | null>(null);

export function useSite(): Ctx {
  const c = useContext(SiteCtx);
  if (!c) throw new Error("useSite outside Providers");
  return c;
}

export function Providers({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const l = new Lenis({ lerp: 0.1, smoothWheel: !reduced, wheelMultiplier: 1 });
    l.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => l.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(l);
    document.fonts?.ready.then(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => {
      gsap.ticker.remove(tick);
      l.destroy();
    };
  }, []);

  // Lock scroll during the intro.
  useEffect(() => {
    if (!lenis) return;
    if (phase !== "done") lenis.stop();
    else lenis.start();
  }, [phase, lenis]);

  useEffect(() => {
    document.documentElement.dataset.phase = phase;
    if (phase === "done")
      requestAnimationFrame(() => {
        ScrollTrigger.sort();
        ScrollTrigger.refresh();
      });
  }, [phase]);

  return (
    <SiteCtx.Provider value={{ phase, setPhase, lenis }}>
      {children}
    </SiteCtx.Provider>
  );
}
