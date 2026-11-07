"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useImageAvailable, useIsoLayoutEffect } from "@/lib/hooks";
import { useSite } from "@/components/Providers";
import { hero, images, site, type HeroCard } from "@/data/portfolio";
import LiveTime from "@/components/ui/LiveTime";

const SEGMENTS = 14;
const INTRO_KEY = "mb-intro-seen";
const CYCLE_MS = 4800;
const LG = "(min-width: 1024px)";
const FINE = "(hover: hover) and (pointer: fine)";

/** MAYUKH is never taller than this share of the screen (cap height). */
const NAME_CAP = 0.2;
/** Desktop: the stage is pinned for this many screens of scrolling. */
const PIN_SCREENS = 1.7;
/** Scrub timeline length, and the moment the hero is fully on screen (the snap point). */
const TL_TOTAL = 1.35;
const TL_READY = 1.15;
/** Hand-kerning: inline-block letters lose the font's own pairs. */
const KERN: Record<string, number> = { AY: -0.055 };
const RING_R = 44;
/**
 * How far the detail card may hang past the photo: 24% of the photo, but never past the screen.
 * Room on the right = half the spare space in the photo column + the page gutter, minus a safety margin.
 */
const CARD_OVERHANG =
  "max(-24%, calc(-1 * (((100vw - 2 * var(--gutter)) * 5 / 12 - min((100vw - 2 * var(--gutter)) * 5 / 12, 76svh * 0.72)) / 2 + var(--gutter) - 22px)))";

/**
 * Section 00 + 01 — the loader, the intro screen, and the hero, on one stage.
 *
 * Screen 1: "Hi, I'm MAYUKH BANERJEE" and the suit portrait. Nothing else.
 * Scroll: a vertical strip of two photos is pulled DOWN through the arch. The smiling colour
 * photo drops in from the top while the suit portrait leaves through the bottom, the name
 * lifts away, and the introduction builds in on the left.
 *
 * Desktop: pinned and scrubbed, with a soft snap so one flick lands on the hero.
 * Mobile: two normal screens; the smiling photo is lowered into its arch when it scrolls in.
 */
export default function Hero() {
  const { phase, setPhase, lenis } = useSite();
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const segRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const nameColRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLSpanElement>(null);
  const lastRef = useRef<HTMLSpanElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const ran = useRef(false);

  const hasHello = useImageAvailable(images.hello);
  const smile = hasHello ? images.hello : images.hero;
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hovering, setHovering] = useState(false);

  /* ---------- initial states, before first paint ---------- */
  useIsoLayoutEffect(() => {
    const lg = window.matchMedia(LG).matches;
    if (window.matchMedia(MQ.reduced).matches) {
      // static: desktop shows the hero only; phones show both screens as they are
      if (lg) gsap.set(".layer-a, .hi-cue", { display: "none" });
      return;
    }
    gsap.set(".a-letter", { yPercent: 118 });
    gsap.set(".a-last", { clipPath: "inset(0 100% 0 0)" });
    gsap.set(".a-hello, .hi-cue", { autoAlpha: 0 });
    gsap.set(".frame, .m-photo-a", { clipPath: "inset(100% 0 0 0)" });
    gsap.set(".outline-arch", { autoAlpha: 0, x: 16, y: 12 });
    gsap.set(".m-outline", { autoAlpha: 0 });
    gsap.set(".strip", { yPercent: -50 });
    gsap.set(".b-line > span", { yPercent: 108 });
    gsap.set(".b-in, .b-pop", { autoAlpha: 0 });
    gsap.set(".m-photo-b", { clipPath: "inset(0 0 100% 0)" });
  }, []);

  /* ---------- the name fills its column: MAYUKH sets the width, BANERJEE matches it ---------- */
  useIsoLayoutEffect(() => {
    const col = nameColRef.current;
    const first = firstRef.current;
    const last = lastRef.current;
    if (!col || !first || !last) return;
    let raf = 0;
    const fit = () => {
      first.style.fontSize = last.style.fontSize = "100px";
      const w1 = first.getBoundingClientRect().width || 1;
      const w2 = last.getBoundingClientRect().width || 1;
      const cs = getComputedStyle(col);
      const avail = col.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const fs1 = Math.min((avail / w1) * 100, (window.innerHeight * NAME_CAP) / 0.72);
      const target = (w1 * fs1) / 100;
      first.style.fontSize = `${fs1}px`;
      last.style.fontSize = `${(target / w2) * 100}px`;
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(fit);
    };
    fit();
    document.fonts?.ready.then(schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(col);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", schedule);
    };
  }, []);

  /* ---------- the entrance: screen 1 only. Everything else waits for the scroll ---------- */
  const enter = useCallback((delay: number, onReady: () => void) => {
    if (window.matchMedia(MQ.reduced).matches) {
      gsap.set(".b-in, .b-pop", { autoAlpha: 1 });
      onReady();
      return;
    }
    const lg = window.matchMedia(LG).matches;
    const tl = gsap.timeline({ delay, defaults: { ease: "power3.out" } });
    tl.fromTo(
      lg ? ".frame" : ".m-photo-a",
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut" },
      0
    )
      .fromTo(
        lg ? ".strip-suit img" : ".m-photo-a img",
        { scale: 1.2 },
        { scale: 1, duration: 2, ease: "expo.out" },
        0.1
      )
      .to(".outline-arch, .m-outline", { autoAlpha: 1, duration: 1, ease: "power2.out" }, 0.7)
      .to(".a-letter", { yPercent: 0, duration: 1.1, stagger: 0.07, ease: "expo.out" }, 0.55)
      .to(".a-last", { clipPath: "inset(0 0% 0 0)", duration: 1.3, ease: "expo.inOut" }, 0.9)
      .fromTo(".a-hello", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 1.15)
      .fromTo(".hi-cue", { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "back.out(1.8)" }, 1.55)
      .add(onReady, 1.9);
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
      enter(0.05, done);
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
      const tl = gsap.timeline();
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
      enter(0.55, done);
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

    const load = (src: string) =>
      new Promise<void>((r) => {
        const img = new Image();
        img.onload = () => r();
        img.onerror = () => r();
        img.src = src;
      });
    const minTime = new Promise((r) => setTimeout(r, 650));
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const photo = load(images.hero);
    const pageLoad = new Promise<void>((r) =>
      document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })
    );
    void load(images.hello); // warm the cache for the photo that comes down on scroll
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
      if (finished) return;
      finished = true;
      gsap.to(overlay, { autoAlpha: 0, duration: 0.25 });
      enter(0.1, done);
    };
    skipBtn?.addEventListener("click", skip);
    return () => {
      clearTimeout(cap);
      skipBtn?.removeEventListener("click", skip);
    };
  }, [enter, setPhase]);

  /* ---------- scroll: the strip comes down, the name goes up, the hero builds in ---------- */
  useGSAP(
    () => {
      // built only once the entrance is over, so the two never fight over the same letters
      if (phase !== "done") return;
      const section = sectionRef.current!;
      const mm = gsap.matchMedia();
      // the menu and the match clock stay hidden while screen 1 is up
      const flag = (on: boolean) => (document.documentElement.dataset.intro = on ? "1" : "0");

      mm.add(`${LG} and ${MQ.motion}`, () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${PIN_SCREENS * 100}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            refreshPriority: 3,
            onUpdate: (self) => flag(self.progress < 0.04),
          },
        });
        const out = { immediateRender: false } as const;

        // screen 1 leaves upward
        tl.fromTo(".a-letter", { yPercent: 0 }, { yPercent: -122, stagger: 0.05, duration: 0.4, ease: "power3.in", ...out }, 0)
          .fromTo(".a-last", { clipPath: "inset(0 0% 0 0%)" }, { clipPath: "inset(0 0% 0 100%)", duration: 0.5, ease: "power3.in", ...out }, 0)
          .fromTo(".a-hello", { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2, ...out }, 0)
          .fromTo(".hi-cue", { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.6, duration: 0.25, ...out }, 0)
          // the photo strip is pulled DOWN: the smile drops in from the top, the suit exits at the bottom
          .fromTo(".strip", { yPercent: -50 }, { yPercent: 0, duration: 0.95, ease: "power2.inOut" }, 0.1)
          // the hero builds in on the left
          .fromTo(".b-line > span", { yPercent: 108 }, { yPercent: 0, stagger: 0.06, duration: 0.4, ease: "power3.out" }, 0.55)
          .fromTo(".b-in", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.35, ease: "power3.out" }, 0.68)
          .fromTo(
            ".b-pop",
            { autoAlpha: 0, scale: 0.92, y: 14 },
            { autoAlpha: 1, scale: 1, y: 0, stagger: 0.1, duration: 0.3, ease: "power3.out" },
            0.9
          )
          .to({}, { duration: TL_TOTAL - 1.2 });
        stRef.current = tl.scrollTrigger ?? null;
        flag(true);
        return () => {
          stRef.current = null;
          flag(false);
        };
      });

      mm.add(`(max-width: 1023px) and ${MQ.motion}`, () => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * 0.55}`,
          onToggle: (self) => flag(self.isActive),
        });
        flag(true);
        // screen 2: the smiling photo is lowered into its arch, then the words arrive
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: { trigger: ".layer-b", start: "top 72%", once: true },
        });
        tl.fromTo(".b-line > span", { yPercent: 108 }, { yPercent: 0, stagger: 0.08, duration: 0.7 })
          .to(".b-in", { autoAlpha: 1, y: 0, stagger: 0.05, duration: 0.5 }, 0.2)
          .to(".m-photo-b", { clipPath: "inset(0 0 0% 0)", duration: 1.5, ease: "expo.inOut" }, 0.35)
          .fromTo(".m-photo-b img", { yPercent: -12 }, { yPercent: 0, duration: 1.8, ease: "expo.out" }, 0.35)
          .to(".m-outline", { autoAlpha: 1, duration: 0.8 }, 0.9)
          .to(".b-pop", { autoAlpha: 1, scale: 1, y: 0, stagger: 0.1, duration: 0.5 }, 1.2);
        return () => flag(false);
      });

      mm.add(MQ.reduced, () => flag(false));
      return () => mm.revert();
    },
    { scope: sectionRef, dependencies: [phase] }
  );

  /* ---------- soft snap: one flick lands on the hero; stopping half way settles back ---------- */
  useEffect(() => {
    if (!lenis || phase !== "done") return;
    if (!window.matchMedia(`${LG} and ${FINE} and ${MQ.motion}`).matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const st = stRef.current;
        if (!st || lenis.isStopped) return;
        const ready = st.start + (st.end - st.start) * (TL_READY / TL_TOTAL);
        const y = lenis.scroll;
        if (y < st.start + 4 || y > ready - 4) return;
        const span = ready - st.start;
        const target =
          lenis.direction >= 0
            ? y > st.start + span * 0.05
              ? ready
              : st.start
            : y < st.start + span * 0.95
              ? st.start
              : ready;
        lenis.scrollTo(target, { duration: 1.2, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
      }, 140);
    };
    lenis.on("scroll", onScroll);
    return () => {
      clearTimeout(timer);
      lenis.off("scroll", onScroll);
    };
  }, [lenis, phase]);

  /* ---------- the scanner: a thin band that inverts whatever it crosses, over the name ---------- */
  useEffect(() => {
    if (phase !== "done" || !window.matchMedia(MQ.motion).matches) return;
    const section = sectionRef.current;
    const band = section?.querySelector<HTMLElement>(".hi-scan");
    const box = band?.parentElement;
    if (!section || !band || !box) return;
    gsap.set(band, { skewX: -14, x: -120 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 6.5, delay: 1.4, paused: true });
    tl.fromTo(band, { x: -120 }, { x: () => box.offsetWidth + 120, duration: 1.7, ease: "power2.inOut" });
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=8%",
      onToggle: (self) => {
        if (self.isActive) {
          gsap.set(band, { autoAlpha: 1 });
          tl.play();
        } else {
          tl.pause(0);
          gsap.set(band, { autoAlpha: 0, x: -120 });
        }
      },
    });
    return () => {
      st.kill();
      tl.kill();
    };
  }, [phase]);

  /* ---------- the cursor: depth on the photo, a light on it, and the name's letters lift ---------- */
  useEffect(() => {
    if (phase !== "done") return;
    const section = sectionRef.current;
    if (!section || !window.matchMedia(`${LG} and ${FINE} and ${MQ.motion}`).matches) return;
    const wrap = section.querySelector<HTMLElement>(".photo-wrap");
    const outline = section.querySelector<HTMLElement>(".outline-arch");
    const nameWrap = section.querySelector<HTMLElement>(".namewrap");
    const spot = section.querySelector<HTMLElement>(".spot");
    const letters = Array.from(section.querySelectorAll<HTMLElement>(".mask-letter"));
    if (!wrap || !outline || !nameWrap || !spot) return;

    const q = (el: HTMLElement, prop: "x" | "y", d = 0.9) => gsap.quickTo(el, prop, { duration: d, ease: "power3.out" });
    const wx = q(wrap, "x"), wy = q(wrap, "y");
    const ox = q(outline, "x"), oy = q(outline, "y");
    const nx = q(nameWrap, "x"), ny = q(nameWrap, "y");
    const ly = letters.map((l) => q(l, "y", 0.55));

    let raf = 0;
    let ev: PointerEvent | null = null;
    const frame = () => {
      raf = 0;
      if (!ev) return;
      const r = section.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      wx(px * -14); wy(py * -10);
      ox(16 + px * 20); oy(12 + py * 14);
      nx(px * 8); ny(py * 5);
      const nr = nameWrap.getBoundingClientRect();
      const inName = ev.clientY > nr.top - 90 && ev.clientY < nr.bottom + 90;
      letters.forEach((l, i) => {
        const lr = l.getBoundingClientRect();
        const d = Math.abs(ev!.clientX - (lr.left + lr.width / 2));
        const w = inName ? Math.exp(-Math.pow(d / 150, 2)) : 0;
        ly[i](-w * nr.height * 0.07);
      });
      const fr = wrap.getBoundingClientRect();
      spot.style.setProperty("--mx", `${((ev.clientX - fr.left) / fr.width) * 100}%`);
      spot.style.setProperty("--my", `${((ev.clientY - fr.top) / fr.height) * 100}%`);
    };
    const onMove = (e: PointerEvent) => {
      ev = e;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => {
      ev = null;
      wx(0); wy(0); ox(16); oy(12); nx(0); ny(0);
      ly.forEach((f) => f(0));
    };
    section.addEventListener("pointermove", onMove);
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [phase]);

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

  const goTo = (target: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo(target, { duration: 1.5 });
  };

  /** Scroll cue: lands exactly on the hero. */
  const next = () => {
    const st = stRef.current;
    if (st) lenis?.scrollTo(st.start + (st.end - st.start) * (TL_READY / TL_TOTAL), { duration: 1.6 });
    else lenis?.scrollTo(".layer-b", { duration: 1.3 });
  };

  const card = hero.cards[active];

  return (
    <section
      ref={sectionRef}
      id="top"
      aria-label="Introduction"
      className="on-paper relative overflow-hidden lg:h-[100svh] lg:min-h-[660px]"
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

      <h1 className="sr-only">
        {site.name}, {site.role}, {site.city}
      </h1>

      {/* ============ desktop photo column: one frame, a strip of two photos inside ============ */}
      <div className="photocol pointer-events-none absolute inset-0 z-[1] hidden grid-cols-12 items-center px-[var(--gutter)] lg:grid">
        <div className="col-span-5 col-start-8 flex justify-center">
          <div className="photo-wrap relative aspect-[0.72] w-full max-w-[min(100%,calc(76svh*0.72))]">
            <div aria-hidden="true" className="outline-arch absolute inset-0 rounded-t-[999px] border border-[var(--black)]/30" />

            <div className="frame absolute inset-0 overflow-hidden rounded-t-[999px] bg-[#e3dfd8]">
              <div className="strip absolute inset-x-0 top-0 h-[200%]">
                {/* top: the smile (colour). It is lowered into view on scroll */}
                <div className="strip-smile relative h-1/2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={smile}
                    alt={`${site.name}, smiling`}
                    className="absolute inset-0 h-full w-full object-cover object-[50%_28%]"
                    draggable={false}
                  />
                </div>
                {/* bottom: the suit (black and white). It leaves through the bottom */}
                <div className="strip-suit relative h-1/2 bg-[#111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={images.hero}
                    alt={`Portrait of ${site.name} in a suit`}
                    className="absolute inset-0 h-full w-full object-cover object-[50%_18%]"
                    fetchPriority="high"
                    draggable={false}
                  />
                </div>
              </div>
              <div
                aria-hidden="true"
                className="spot pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(260px circle at var(--mx, 50%) var(--my, 35%), rgba(255,255,255,0.28), rgba(255,255,255,0) 62%)",
                  mixBlendMode: "soft-light",
                }}
              />
            </div>

            {/* scroll cue: sits on the corner of the photo, clicking it goes to the hero */}
            <Cue
              id="cue-d"
              onClick={next}
              className="pointer-events-auto absolute -bottom-[5%] -left-[15%] h-[clamp(5.2rem,9.5svh,6.8rem)] w-[clamp(5.2rem,9.5svh,6.8rem)]"
            />

            {/* hero extras, shown once the photo has come down */}
            <div className="b-pop pointer-events-auto absolute -left-[22%] bottom-[9%] max-[1279px]:-left-[14%] flex items-center gap-3 rounded-full bg-[var(--black)] px-4 py-3 text-[var(--paper)]">
              <OpenDot />
              <span className="mono text-[10px]">{hero.available}</span>
            </div>
            <DetailCard
              card={card}
              index={active}
              className="absolute top-[40%] w-[min(17rem,calc((100vw-var(--gutter))*0.2))] min-w-[13.5rem] max-[1279px]:top-[46%]"
              style={{ right: CARD_OVERHANG }}
            />
          </div>
        </div>
      </div>

      {/* ============ screen 1: Hi, I'm MAYUKH BANERJEE ============ */}
      <div className="layer-a relative flex min-h-[100svh] flex-col justify-center gap-9 px-[var(--gutter)] pb-32 pt-16 lg:pointer-events-none lg:absolute lg:inset-0 lg:z-[2] lg:grid lg:min-h-0 lg:grid-cols-12 lg:items-center lg:gap-6 lg:pb-0 lg:pt-0">
        <div ref={nameColRef} className="name-col relative lg:col-span-7 lg:pr-[4vw]">
          <p className="a-hello voice text-[clamp(26px,2.8vw,50px)] leading-none">{hero.introHello}</p>
          <h2 aria-label={site.name} className="namewrap relative mt-[0.5em] w-max max-w-full uppercase">
            <span
              ref={firstRef}
              aria-hidden="true"
              className="a-first display block w-max whitespace-nowrap leading-[0.8]"
              style={{ fontWeight: 900, fontStretch: "100%", letterSpacing: "-0.035em", marginLeft: "-0.04em" }}
            >
              {[...site.first].map((ch, i) => (
                <span
                  key={i}
                  className="mask-letter inline-block overflow-hidden align-bottom"
                  style={{
                    padding: "0.12em 0",
                    margin: `-0.12em 0 -0.12em ${i ? (KERN[site.first[i - 1] + ch] ?? 0) : 0}em`,
                  }}
                >
                  <span className="a-letter inline-block">{ch}</span>
                </span>
              ))}
            </span>
            <span
              ref={lastRef}
              aria-hidden="true"
              className="a-last display mt-[0.08em] block w-max whitespace-nowrap leading-[0.8]"
              style={{ fontWeight: 200, fontStretch: "100%", letterSpacing: "-0.01em", marginLeft: "-0.05em" }}
            >
              {site.last}
            </span>
            {/* the scanner: inverts what it passes over */}
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
              <span
                className="hi-scan absolute inset-y-[-10%] left-0 block w-14 opacity-0"
                style={{ background: "var(--paper)", mixBlendMode: "difference" }}
              />
            </span>
          </h2>
        </div>

        {/* phones: the suit photo sits under the name */}
        <div className="relative mx-auto aspect-[0.72] h-[46svh] max-w-full lg:hidden">
          <div aria-hidden="true" className="m-outline absolute inset-0 translate-x-[5%] translate-y-[3%] rounded-t-[999px] border border-[var(--black)]/30" />
          <div className="m-photo-a absolute inset-0 overflow-hidden rounded-t-[999px] bg-[#111]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images.hero} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-[50%_18%]" />
          </div>
        </div>

        {/* phones: scroll cue */}
        <div className="absolute inset-x-0 bottom-7 flex justify-center lg:hidden">
          <Cue id="cue-m" onClick={next} className="h-[6.2rem] w-[6.2rem]" />
        </div>
      </div>

      {/* ============ screen 2: the introduction ============ */}
      <div className="layer-b relative px-[var(--gutter)] pb-20 pt-14 lg:pointer-events-none lg:absolute lg:inset-0 lg:z-[3] lg:grid lg:grid-cols-12 lg:items-center lg:gap-6 lg:pb-0 lg:pt-0">
        <div className="b-col flex flex-col justify-center lg:pointer-events-auto lg:col-span-6 lg:pt-6">
          <p className="b-in mono text-[var(--mute-dark)]">{hero.kicker}</p>
          <p
            className="display mt-5 text-[clamp(36px,min(4.7vw,7.4svh),86px)] leading-[0.94]"
            style={{ fontWeight: 800, fontStretch: "100%" }}
          >
            {hero.lines.map((l, i) => (
              <span key={i} className="b-line mask-line">
                <span>{l}</span>
              </span>
            ))}
          </p>
          <p className="b-in body-copy mt-6 max-w-[30em] text-[var(--black)]/75">{hero.descriptor}</p>

          <div className="b-in mt-8 flex flex-wrap items-center gap-6">
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

          <div
            className="b-in mt-10 lg:mt-[clamp(20px,4.5svh,56px)]"
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

        {/* phones: the smiling photo, lowered into its arch when it scrolls in */}
        <div className="mt-12 lg:hidden">
          <div className="relative mx-auto aspect-[0.72] w-[min(86%,calc(58svh*0.72))]">
            <div aria-hidden="true" className="m-outline absolute inset-0 translate-x-[5%] translate-y-[3%] rounded-t-[999px] border border-[var(--black)]/30" />
            <div className="m-photo-b absolute inset-0 overflow-hidden rounded-t-[999px] bg-[#e3dfd8]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={smile} alt="" loading="lazy" className="absolute inset-0 h-[112%] w-full object-cover object-[50%_28%]" />
            </div>
            <div className="b-pop absolute -bottom-3 left-0 flex items-center gap-3 rounded-full bg-[var(--black)] px-4 py-3 text-[var(--paper)]">
              <OpenDot />
              <span className="mono text-[10px]">{hero.available}</span>
            </div>
          </div>
          <DetailCard card={card} index={active} className="relative mt-10 w-full" />
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- */

function OpenDot() {
  // teal use #1: the live "open to roles" dot
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--teal)] opacity-60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--teal)]" />
    </span>
  );
}

/** The scroll cue: a turning ring of text around a bobbing arrow. */
function Cue({ id, onClick, className }: { id: string; onClick: () => void; className: string }) {
  const r = RING_R;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={hero.cueLabel}
      className={`hi-cue group grid place-items-center rounded-full bg-[var(--black)] text-[var(--paper)] transition-transform duration-300 hover:scale-105 ${className}`}
    >
      <svg viewBox="0 0 120 120" aria-hidden="true" className="cue-spin absolute inset-0 h-full w-full">
        <defs>
          <path id={id} d={`M60,60 m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`} />
        </defs>
        <text fill="currentColor" style={{ fontSize: 8.2, fontFamily: "var(--font-jetbrains)", textTransform: "uppercase" }}>
          <textPath href={`#${id}`} textLength={2 * Math.PI * r - 3} lengthAdjust="spacing">
            {hero.cueRing}
          </textPath>
        </text>
      </svg>
      <span className="cue-bob relative text-[22px] leading-none">↓</span>
    </button>
  );
}

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
      className={`group relative flex min-h-[clamp(88px,12svh,112px)] w-[44vw] shrink-0 snap-start flex-col justify-between overflow-hidden border p-3 text-left transition-[background-color,color,transform,border-color] duration-300 sm:w-auto ${
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

function DetailCard({
  card,
  index,
  className,
  style,
}: {
  card: HeroCard;
  index: number;
  className: string;
  style?: React.CSSProperties;
}) {
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
      style={style}
      className={`b-pop on-black p-5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)] ${className}`}
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
