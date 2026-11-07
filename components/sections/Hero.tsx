"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { useIsoLayoutEffect } from "@/lib/hooks";
import { useSite } from "@/components/Providers";
import { hero, images, site, type HeroCard } from "@/data/portfolio";
import LiveTime from "@/components/ui/LiveTime";

const SEGMENTS = 14;
const INTRO_KEY = "mb-intro-seen";
const CYCLE_MS = 4800;

/**
 * Section 00 + 01 — loader, then the hero.
 * Left: who I am, in plain words. Right: the portrait on a soft arch.
 * The proof cards are pickable: choose one and the dark card beside the portrait shows its detail.
 * Until someone picks, they cycle on their own (with a progress line on the active card).
 */
export default function Hero() {
  const { phase, setPhase, lenis } = useSite();
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ran = useRef(false);

  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hovering, setHovering] = useState(false);

  /* ---------- hide everything before first paint so the entrance can play ---------- */
  useIsoLayoutEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return;
    gsap.set(".h-in, .h-line > span, .h-frame, .h-arch, .h-pop", { autoAlpha: 0 });
  }, []);

  /* ---------- the entrance (after the loader, or straight away on a return visit) ---------- */
  const enter = useCallback((delay = 0) => {
    if (window.matchMedia(MQ.reduced).matches) {
      gsap.set(".h-in, .h-line > span, .h-frame, .h-arch, .h-pop", { autoAlpha: 1 });
      return;
    }
    const tl = gsap.timeline({ delay, defaults: { ease: "power3.out" } });
    tl.fromTo(
      ".h-frame",
      { autoAlpha: 1, clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "expo.inOut" },
      0
    )
      .fromTo(".h-portrait", { scale: 1.18 }, { scale: 1, duration: 1.6, ease: "expo.out" }, 0.1)
      .fromTo(".h-arch", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, 0.5)
      .fromTo(".h-line > span", { autoAlpha: 1, yPercent: 108 }, { yPercent: 0, duration: 0.6, stagger: 0.08 }, 0.2)
      .fromTo(".h-in", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.05 }, 0.45)
      .fromTo(
        ".h-pop",
        { autoAlpha: 0, scale: 0.92, y: 12 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "back.out(1.6)" },
        0.75
      );
  }, []);

  /* ---------- Section 00: loader, driven by real loading. First visit per session only ---------- */
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const overlay = overlayRef.current;
    const reduced = window.matchMedia(MQ.reduced).matches;
    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_KEY) === "1";
    } catch {}

    const done = () => {
      try {
        sessionStorage.setItem(INTRO_KEY, "1");
      } catch {}
      setPhase("done");
    };

    if (seen || reduced) {
      gsap.set(overlay, { autoAlpha: 0 });
      enter(0.05);
      done();
      return;
    }

    const counter = { v: 0 };
    let target = 0;
    let finished = false;
    const render = () => {
      if (counterRef.current) counterRef.current.textContent = String(Math.round(counter.v)).padStart(2, "0");
    };
    const finish = () => {
      if (finished) return;
      finished = true;
      const tl = gsap.timeline({ onComplete: done });
      tl.set(".loader-line", { opacity: 0 }).set(segRefs.current, { opacity: 1 });
      segRefs.current.forEach((s) => {
        if (!s) return;
        tl.to(
          s,
          {
            x: gsap.utils.random(-140, 140),
            y: gsap.utils.random(-200, 200),
            rotation: gsap.utils.random(-70, 70),
            opacity: 0,
            duration: gsap.utils.random(0.35, 0.6),
            ease: "power4.out",
          },
          0
        );
      });
      tl.to(".loader-count", { opacity: 0, duration: 0.15 }, 0)
        .to(overlay, { clipPath: "inset(0 0 100% 0)", duration: 0.8, ease: "expo.inOut" }, 0.25)
        .set(overlay, { autoAlpha: 0 });
      enter(0.55);
    };
    const bump = (n: number) => {
      target = Math.min(100, target + n);
      gsap.to(counter, {
        v: target,
        duration: 0.45,
        ease: "power1.out",
        onUpdate: render,
        onComplete: () => {
          if (counter.v >= 100) finish();
        },
      });
    };

    gsap.fromTo(".loader-line", { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "expo.inOut", transformOrigin: "0% 50%" });

    const minTime = new Promise((r) => setTimeout(r, 650));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const photo = new Promise<void>((r) => {
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

    const skipBtn = document.getElementById("intro-skip");
    const skip = (e: Event) => {
      e.preventDefault();
      gsap.killTweensOf(counter);
      finished = true;
      gsap.to(overlay, { autoAlpha: 0, duration: 0.25 });
      enter(0.1);
      done();
    };
    skipBtn?.addEventListener("click", skip);
    return () => {
      clearTimeout(cap);
      skipBtn?.removeEventListener("click", skip);
    };
  }, [enter, setPhase]);

  /* ---------- the cards cycle by themselves until someone picks one ---------- */
  useEffect(() => {
    if (!auto || hovering || phase !== "done") return;
    const id = setTimeout(() => setActive((a) => (a + 1) % hero.cards.length), CYCLE_MS);
    return () => clearTimeout(id);
  }, [auto, hovering, active, phase]);

  const pick = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  /* ---------- scroll: a little depth as the hero leaves ---------- */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.desktop, () => {
        const st = { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true };
        gsap.fromTo(".h-portrait", { yPercent: -6 }, { yPercent: 2, ease: "none", scrollTrigger: st });
        gsap.to(".h-arch", { y: -40, ease: "none", scrollTrigger: st });
        gsap.to(".h-left", { yPercent: -10, opacity: 0.2, ease: "none", scrollTrigger: st });
      });
      return () => mm.revert();
    },
    { scope: sectionRef }
  );

  const goTo = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo(target, { duration: 1.5 });
  };

  const card = hero.cards[active];

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      className="on-paper relative min-h-[100svh] overflow-hidden px-[var(--gutter)] pt-20 lg:h-[100svh] lg:min-h-[720px] lg:pt-0"
    >
      {/* ---------- Section 00: loader overlay ---------- */}
      <div ref={overlayRef} className="on-black fixed inset-0 z-[100]" style={{ clipPath: "inset(0 0 0% 0)" }}>
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
          <div className="loader-count mono absolute left-0 top-4">
            <span ref={counterRef}>00</span> / 100
          </div>
          <div className="loader-count mono absolute right-0 top-4 text-[var(--mute)]">{site.name}</div>
        </div>
        <button
          id="intro-skip"
          className="mono absolute right-[var(--gutter)] top-5 text-[var(--mute)] transition-colors hover:text-[var(--paper)]"
        >
          [ skip ]
        </button>
      </div>

      <div className="relative grid h-full grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        {/* ---------- left: words + the pickable cards ---------- */}
        <div className="h-left relative z-10 flex flex-col justify-center lg:col-span-6 lg:pb-10 lg:pt-24">
          <p className="h-in mono text-[var(--mute-dark)]">{hero.hello}</p>
          <h1
            className="display mt-6 text-[clamp(40px,4.7vw,86px)] leading-[0.94]"
            style={{ fontWeight: 800, fontStretch: "100%" }}
          >
            <span className="sr-only">{site.name}. </span>
            {hero.lines.map((l, i) => (
              <span key={i} className="h-line mask-line">
                <span>{l}</span>
              </span>
            ))}
          </h1>
          <p className="h-in body-copy mt-7 max-w-[30em] text-[var(--black)]/75">{hero.descriptor}</p>

          <div className="h-in mt-9 flex flex-wrap items-center gap-6">
            <a
              href="#work"
              onClick={goTo("#work")}
              className="mono inline-flex h-12 items-center bg-[var(--black)] px-6 text-[var(--paper)] transition-transform hover:-translate-y-0.5"
              style={{ clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)" }}
            >
              {hero.ctaWork}
            </a>
            <a href="#origin" onClick={goTo("#origin")} className="mono group inline-flex items-center gap-2 hover:opacity-70">
              {hero.ctaAbout}
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>

          {/* the deck */}
          <div
            className="h-in mt-12 lg:mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <p className="mono mb-3 flex justify-between text-[var(--mute-dark)]">
              <span>[ {hero.pickHint} ]</span>
              <span className="hidden sm:inline">
                {site.city} · <LiveTime />
              </span>
            </p>
            <div
              role="tablist"
              aria-label="Highlights"
              className="-mx-[var(--gutter)] flex snap-x gap-2 overflow-x-auto px-[var(--gutter)] pb-3 pt-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0"
            >
              {hero.cards.map((c, i) => (
                <DeckCard
                  key={c.title}
                  card={c}
                  index={i}
                  picked={i === active}
                  running={auto && !hovering && i === active && phase === "done"}
                  onPick={() => pick(i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---------- right: the portrait on an arch ---------- */}
        <div className="relative pb-8 lg:col-span-6 lg:h-full lg:pb-0">
          <div className="relative h-[66svh] min-h-[460px] lg:absolute lg:inset-0 lg:h-auto lg:min-h-0">
          {/* thin outline arch, offset behind the photo */}
          <div
            aria-hidden="true"
            className="h-arch absolute bottom-[4%] left-1/2 top-[9%] aspect-[0.72] max-w-[86%] -translate-x-[46%] rounded-t-[999px] border border-[var(--black)]/25 lg:top-[11%]"
          />

          {/* the photo, framed in an arch */}
          <div className="h-frame absolute bottom-[6%] left-1/2 top-[7%] aspect-[0.72] max-w-[86%] -translate-x-1/2 overflow-hidden rounded-t-[999px] bg-[#111] lg:top-[9%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.hero}
              alt={`Portrait of ${site.name}`}
              className="h-portrait absolute inset-0 h-[112%] w-full object-cover object-[50%_18%]"
              fetchPriority="high"
              draggable={false}
            />
            <div className="pointer-events-none absolute inset-0 shadow-[inset_0_-120px_120px_-60px_rgba(0,0,0,0.55)]" />
          </div>

          {/* available badge (teal use #1) */}
          <div className="h-pop absolute bottom-[10%] left-0 flex items-center gap-3 rounded-full bg-[var(--black)] px-4 py-3 text-[var(--paper)] lg:bottom-[9%] lg:left-[4%]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--teal)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--teal)]" />
            </span>
            <span className="mono text-[10px]">{hero.available}</span>
          </div>
          </div>

          {/* the detail of the picked card */}
          <DetailCard card={card} index={active} />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function DeckCard({
  card,
  index,
  picked,
  running,
  onPick,
}: {
  card: HeroCard;
  index: number;
  picked: boolean;
  running: boolean;
  onPick: () => void;
}) {
  return (
    <button
      role="tab"
      aria-selected={picked}
      onClick={onPick}
      className={`group relative flex min-h-[112px] w-[44vw] shrink-0 snap-start flex-col justify-between overflow-hidden border p-3 text-left transition-[background-color,color,transform,border-color] duration-300 sm:w-auto ${
        picked
          ? "-translate-y-1.5 border-[var(--black)] bg-[var(--black)] text-[var(--paper)]"
          : "border-[var(--line-light)] bg-[#f7f5f1] text-[var(--black)] hover:-translate-y-1 hover:border-[var(--black)]/40"
      }`}
    >
      <span className="mono flex justify-between text-[10px] opacity-60">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </span>
      <span>
        <span className="mono block text-[10px] opacity-60">{card.kicker}</span>
        <span className="mt-1 block text-[15px] leading-tight" style={{ fontWeight: 600 }}>
          {card.title}
        </span>
      </span>
      {/* progress line while the deck is cycling by itself */}
      {running && (
        <span
          className="absolute bottom-0 left-0 h-[2px] w-full origin-left bg-current opacity-60"
          style={{ animation: `deck-progress ${CYCLE_MS}ms linear forwards` }}
        />
      )}
      <style>{`@keyframes deck-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }`}</style>
    </button>
  );
}

function DetailCard({ card, index }: { card: HeroCard; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || window.matchMedia(MQ.reduced).matches) return;
    gsap.fromTo(
      ref.current.querySelectorAll(".dc-in"),
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power3.out" }
    );
    gsap.fromTo(
      ref.current.querySelector(".dc-spark"),
      { strokeDashoffset: 1 },
      { strokeDashoffset: 0, duration: 0.9, ease: "power2.out" }
    );
  }, [index]);

  const W = 220;
  const H = 54;
  const pts = card.spark.map((v, i) => [(i / (card.spark.length - 1)) * W, H - 4 - v * (H - 10)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];

  return (
    <div
      ref={ref}
      aria-live="polite"
      className="h-pop on-black relative mt-4 w-full p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] lg:absolute lg:bottom-[30%] lg:right-[-1%] lg:mt-0 lg:w-[17rem]"
    >
      <p className="dc-in mono flex justify-between text-[10px] text-[var(--mute)]">
        <span>{card.kicker}</span>
        <span>
          {String(index + 1).padStart(2, "0")} / {String(hero.cards.length).padStart(2, "0")}
        </span>
      </p>
      <p className="dc-in mt-4 text-[13px] text-[var(--paper)]/70">{card.title}</p>
      <p
        className="dc-in display mt-1 text-[clamp(38px,3.4vw,52px)] leading-none"
        style={{ fontWeight: 800, fontStretch: "90%" }}
      >
        {card.metric}
      </p>
      <p className="dc-in mono mt-2 text-[10px] text-[var(--mute)]">{card.metricLabel}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="dc-in mt-4 w-full overflow-visible" aria-hidden="true">
        <path
          d={d}
          className="dc-spark"
          fill="none"
          stroke="var(--paper)"
          strokeWidth="1.2"
          pathLength={1}
          strokeDasharray="1"
        />
        <circle cx={last[0]} cy={last[1]} r="2.6" fill="var(--paper)" />
      </svg>
      <p className="dc-in mt-4 text-[13px] leading-snug text-[var(--paper)]/80">{card.line}</p>
    </div>
  );
}
