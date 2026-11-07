"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useImageAvailable, useIsoLayoutEffect } from "@/lib/hooks";
import { useSite } from "@/components/Providers";
import { hero, images, site } from "@/data/portfolio";
import LiveTime from "@/components/ui/LiveTime";

type Line = { text: string; fs: number; y: number; xs: number[] };
type Rect = { x: number; y: number; w: number; h: number };
type Layout = { w: number; h: number; wdth: number; lines: [Line, Line]; focal: { x: number; y: number }; img: Rect };

const fontStyle = (wdth: number) =>
  ({
    fontFamily: "var(--font-archivo), sans-serif",
    fontWeight: 900,
    fontStretch: `${wdth}%`,
    fontVariationSettings: `'wdth' ${wdth}`,
    letterSpacing: "-0.01em",
  }) as const;
const wdthFor = (w: number) => (w < 520 ? 68 : w < 900 ? 95 : 125);

const CAP = 0.7; // Archivo cap-height / em
const SEGMENTS = 14;
const INTRO_KEY = "mb-intro-seen";

/**
 * Section 01 — Hero, with Section 00 (the loader) built in.
 * The name is the mask: the portrait shows only through MAYUKH / BANERJEE.
 * The photo is placed so the face sits behind the name, centred on the Y.
 * On scroll the camera falls through the stem of the Y, into the face, until the photo fills the frame.
 */
export default function Hero() {
  const { phase, setPhase } = useSite();
  const hasPhoto = useImageAvailable(images.hero);

  const sectionRef = useRef<HTMLElement>(null);
  const measureRefs = useRef<(SVGTextElement | null)[]>([]);
  const zoomRef = useRef<SVGGElement>(null);
  const imageRef = useRef<SVGGElement>(null);
  const fullRef = useRef<SVGGElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const introRan = useRef(false);

  const [layout, setLayout] = useState<Layout | null>(null);

  /* ---------- measure + fit the name to the viewport ---------- */
  useIsoLayoutEffect(() => {
    let raf = 0;
    const compute = () => {
      const sec = sectionRef.current;
      const m1 = measureRefs.current[0];
      const m2 = measureRefs.current[1];
      if (!sec || !m1 || !m2) return;
      const w = sec.clientWidth;
      const h = sec.clientHeight;
      const wdth = wdthFor(w);
      const st = fontStyle(wdth);
      for (const el of [m1, m2]) {
        el.style.fontStretch = st.fontStretch;
        el.style.fontVariationSettings = st.fontVariationSettings;
      }
      const g = Math.max(16, Math.min(48, w * 0.032));
      const avail = w - g * 2;

      const fit = (el: SVGTextElement) => {
        el.setAttribute("font-size", "100");
        const len = el.getComputedTextLength() || 1;
        const fs = (avail / len) * 100;
        el.setAttribute("font-size", String(fs));
        const xs: number[] = [];
        const n = el.getNumberOfChars();
        for (let i = 0; i < n; i++) xs.push(el.getStartPositionOfChar(i).x);
        return { fs, xs };
      };
      const a = fit(m1);
      const b = fit(m2);

      const gap = Math.max(10, a.fs * 0.1);
      const block = a.fs * CAP + gap + b.fs * CAP;
      const top = Math.max(h * 0.12, (h - block) / 2 - h * 0.02);
      const y1 = top + a.fs * CAP;
      const y2 = y1 + gap + b.fs * CAP;

      // focal point: the stem of the Y in MAYUKH (index 2). Solid ink, and it sits over the face.
      const ext = m1.getExtentOfChar(2);
      const focal = { x: g + ext.x + ext.width / 2, y: y1 - a.fs * CAP * 0.22 };

      // place the photo: cover the viewport, then slide it so the face lands behind the Y
      const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
      const dispW = Math.max(w, h / images.heroAspect) * images.heroZoom;
      const dispH = dispW * images.heroAspect;
      const img = {
        w: dispW,
        h: dispH,
        x: clamp(focal.x - images.heroFocus.x * dispW, w - dispW, 0),
        y: clamp(top + block / 2 - images.heroFocus.y * dispH, h - dispH, 0),
      };

      setLayout({
        w,
        h,
        wdth,
        lines: [
          { text: site.first, fs: a.fs, y: y1, xs: a.xs.map((x) => x + g) },
          { text: site.last, fs: b.fs, y: y2, xs: b.xs.map((x) => x + g) },
        ],
        focal,
        img,
      });
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };
    compute();
    document.fonts?.ready.then(schedule);
    const ro = new ResizeObserver(schedule);
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  /* ---------- hide letters before first paint if the intro will play ---------- */
  useIsoLayoutEffect(() => {
    if (!layout || introRan.current) return;
    if (phase === "loading") {
      gsap.set(".hero-letter", { opacity: 0 });
      gsap.set(uiRef.current, { opacity: 0 });
    }
  }, [layout, phase]);

  /* ---------- Section 00: loader driven by real loading ---------- */
  useEffect(() => {
    if (!layout || introRan.current || hasPhoto === null) return;
    introRan.current = true;

    const reduced = window.matchMedia(MQ.reduced).matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}

    const finish = () => {
      gsap.set(".hero-letter", { opacity: 1, y: 0, scaleY: 1 });
      gsap.to(uiRef.current, { opacity: 1, duration: 0.6, ease: "power2.out" });
      gsap.to(loaderRef.current, { autoAlpha: 0, duration: 0.3 });
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      setPhase("done");
    };

    if (seen || reduced) {
      gsap.set(loaderRef.current, { autoAlpha: 0 });
      finish();
      return;
    }

    const counter = { v: 0 };
    let target = 0;
    let revealed = false;
    const render = () => {
      if (counterRef.current) counterRef.current.textContent = String(Math.round(counter.v)).padStart(2, "0");
    };
    const bump = (n: number) => {
      target = Math.min(100, target + n);
      gsap.to(counter, {
        v: target,
        duration: 0.45,
        ease: "power1.out",
        onUpdate: render,
        onComplete: () => counter.v >= 100 && reveal(),
      });
    };

    const lineTl = gsap.fromTo(
      ".loader-line",
      { scaleX: 0 },
      { scaleX: 1, duration: 0.7, ease: "expo.inOut", transformOrigin: "0% 50%" }
    );

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      const tl = gsap.timeline({ onComplete: finish });
      // the line shatters
      tl.set(".loader-line", { opacity: 0 });
      tl.set(segRefs.current, { opacity: 1 });
      segRefs.current.forEach((s) => {
        if (!s) return;
        tl.to(
          s,
          {
            x: gsap.utils.random(-140, 140),
            y: gsap.utils.random(-220, 220),
            rotation: gsap.utils.random(-70, 70),
            opacity: 0,
            duration: gsap.utils.random(0.35, 0.6),
            ease: "power4.out",
          },
          0
        );
      });
      tl.to(".loader-count", { opacity: 0, duration: 0.15 }, 0);
      // the letters slam in: one frame each, no easing
      document.querySelectorAll<SVGTextElement>(".hero-letter").forEach((el, i) => {
        tl.set(el, { opacity: 1 }, 0.04 + i * 0.045);
      });
      tl.fromTo(zoomRef.current, { x: 0 }, { x: 3, duration: 0.05, repeat: 3, yoyo: true, ease: "none" }, ">-0.02");
      tl.set(zoomRef.current, { x: 0 });
    };

    // real signals
    const minTime = new Promise((r) => setTimeout(r, 650));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const photo = new Promise<void>((r) => {
      if (!hasPhoto) return r();
      const img = new Image();
      img.onload = () => r();
      img.onerror = () => r();
      img.src = images.hero;
    });
    const pageLoad = new Promise<void>((r) =>
      document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })
    );
    bump(8);
    fonts.then(() => bump(30));
    photo.then(() => bump(30));
    pageLoad.then(() => bump(17));
    Promise.all([minTime, fonts, photo, pageLoad]).then(() => bump(100));
    const cap = setTimeout(() => bump(100), 4000);

    const skip = (e: Event) => {
      e.preventDefault();
      gsap.killTweensOf(counter);
      lineTl.kill();
      revealed = true;
      finish();
    };
    const skipBtn = document.getElementById("intro-skip");
    skipBtn?.addEventListener("click", skip);

    return () => {
      clearTimeout(cap);
      skipBtn?.removeEventListener("click", skip);
    };
  }, [layout, hasPhoto, setPhase]);

  /* ---------- scroll: fall through the letters ---------- */
  useGSAP(
    () => {
      if (!layout) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const { focal } = layout;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=140%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            refreshPriority: 3,
          },
        });
        tl.to(uiRef.current, { opacity: 0, y: -24, duration: 0.18, ease: "none" }, 0)
          .to(
            zoomRef.current,
            { scale: 70, svgOrigin: `${focal.x} ${focal.y}`, duration: 1, ease: "power3.in" },
            0.05
          )
          .fromTo(
            imageRef.current,
            { scale: 1.12, svgOrigin: `${focal.x} ${focal.y}` },
            { scale: 1, duration: 1, ease: "none" },
            0.05
          )
          .fromTo(fullRef.current, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: "none" }, 0.9)
          .to(".hero-bottom-rule", { scaleX: 0, transformOrigin: "100% 50%", duration: 0.2, ease: "none" }, 0);
      });
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
      return () => mm.revert();
    },
    { dependencies: [layout], scope: sectionRef, revertOnUpdate: true }
  );

  const w = layout?.w ?? 1440;
  const h = layout?.h ?? 900;

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      className="on-black relative h-[100svh] min-h-[560px] w-full overflow-hidden"
    >
      <h1 className="sr-only">
        {site.name}, {site.role}, {site.city}
      </h1>

      <svg
        className="absolute inset-0 h-full w-full"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        aria-hidden="true"
      >
        <defs>
          <filter id="hero-bw" colorInterpolationFilters="sRGB">
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncR type="linear" slope="1.28" intercept="-0.12" />
              <feFuncG type="linear" slope="1.28" intercept="-0.12" />
              <feFuncB type="linear" slope="1.28" intercept="-0.12" />
            </feComponentTransfer>
          </filter>
          <radialGradient id="hero-fallback" cx="0.42" cy="0.36" r="0.85">
            <stop offset="0" stopColor="#f0ede8" />
            <stop offset="0.45" stopColor="#9d9993" />
            <stop offset="1" stopColor="#2a2927" />
          </radialGradient>
          <filter id="hero-noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
          </filter>
          <mask id="hero-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={w} height={h}>
            <rect width={w} height={h} fill="black" />
            <g ref={zoomRef}>
              {layout?.lines.map((line, li) =>
                line.text.split("").map((ch, i) => (
                  <text
                    key={`${li}-${i}`}
                    className="hero-letter"
                    x={line.xs[i]}
                    y={line.y}
                    fontSize={line.fs}
                    fill="white"
                    style={fontStyle(layout.wdth)}
                  >
                    {ch}
                  </text>
                ))
              )}
            </g>
          </mask>
        </defs>

        {/* measuring copies, never visible */}
        <g opacity="0" aria-hidden="true">
          <text ref={(el) => void (measureRefs.current[0] = el)} x="0" y="-1000" style={fontStyle(125)}>
            {site.first}
          </text>
          <text ref={(el) => void (measureRefs.current[1] = el)} x="0" y="-1000" style={fontStyle(125)}>
            {site.last}
          </text>
        </g>

        <g mask="url(#hero-mask)">
          <g ref={imageRef}>
            <HeroImage hasPhoto={hasPhoto} src={images.hero} rect={layout?.img} w={w} h={h} />
          </g>
        </g>
        {/* unmasked copy that takes over at the end of the fall-through, so the frame always ends full */}
        <g ref={fullRef} opacity="0">
          <HeroImage hasPhoto={hasPhoto} src={images.heroFull} rect={layout?.img} w={w} h={h} />
        </g>
      </svg>

      {/* Section 00 — loader (lives inside the hero so its letters become the mask) */}
      <div ref={loaderRef} className="pointer-events-none absolute inset-0 z-20">
        <div className="absolute left-[var(--gutter)] right-[var(--gutter)] top-1/2">
          <span className="loader-line absolute left-0 right-0 top-0 block h-px origin-left bg-[var(--paper)]" />
          <div className="absolute left-0 right-0 top-0 flex h-px">
            {Array.from({ length: SEGMENTS }).map((_, i) => (
              <span
                key={i}
                ref={(el) => void (segRefs.current[i] = el)}
                className="block h-px flex-1 bg-[var(--paper)] opacity-0"
              />
            ))}
          </div>
          <div className="loader-count mono absolute left-0 top-4 text-[var(--paper)]">
            <span ref={counterRef}>00</span> / 100
          </div>
        </div>
        <button
          id="intro-skip"
          className="mono pointer-events-auto absolute right-[var(--gutter)] top-5 text-[var(--mute)] transition-colors hover:text-[var(--paper)]"
        >
          [ skip ]
        </button>
      </div>

      {/* foreground UI */}
      <div ref={uiRef} className="pointer-events-none absolute inset-0 z-10">
        <p className="body-copy absolute right-[var(--gutter)] top-[84px] hidden max-w-[19rem] text-[15px] leading-snug text-[var(--paper)]/80 md:block">
          {hero.descriptor}
        </p>
        <div className="mono absolute bottom-7 left-[var(--gutter)] text-[var(--paper)]">
          <div className="mb-3 md:hidden">[ {site.current} ]</div>
          <div>{site.role}</div>
          <div className="text-[var(--mute)]">
            {site.city} · <LiveTime />
          </div>
        </div>
        <div className="mono absolute bottom-7 right-[var(--gutter)] hidden text-right text-[var(--paper)] md:block">
          [ {site.current} ]
        </div>
      </div>

      {/* teal use #1 — the live "now" line */}
      <span className="hero-bottom-rule absolute bottom-0 left-0 right-0 z-10 block h-px bg-[var(--teal)]" />
    </section>
  );
}

function HeroImage({
  hasPhoto,
  src,
  rect,
  w,
  h,
}: {
  hasPhoto: boolean | null;
  src: string;
  rect?: Rect;
  w: number;
  h: number;
}) {
  return hasPhoto && rect ? (
    <image href={src} x={rect.x} y={rect.y} width={rect.w} height={rect.h} preserveAspectRatio="none" />
  ) : (
    <>
      <rect width={w} height={h} fill="url(#hero-fallback)" />
      <rect width={w} height={h} filter="url(#hero-noise)" />
    </>
  );
}
