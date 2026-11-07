"use client";

import { useRef, useState } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useImageAvailable } from "@/lib/hooks";
import { images, origin, type StoryChapter } from "@/data/portfolio";
import { useSite } from "@/components/Providers";
import SectionLabel from "@/components/ui/SectionLabel";
import Calculator from "@/components/story/Calculator";

/**
 * Section 03 — my story. Four chapters, in order.
 * Desktop: a sticky index on the left tracks where you are; chapters scroll on the right,
 * each with the story, a line in my own voice, and one thing to look at or play with.
 */
export default function Origin() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { lenis } = useSite();

  useGSAP(
    () => {
      const chapters = gsap.utils.toArray<HTMLElement>(".st-chapter");
      chapters.forEach((ch, i) => {
        ScrollTrigger.create({
          trigger: ch,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });

      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(".st-head > *", {
          y: 30,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".st-head", start: "top 80%", once: true },
        });
        chapters.forEach((ch) => {
          gsap.from(ch.querySelectorAll(".st-title .mask-line > span"), {
            yPercent: 108,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.06,
            scrollTrigger: { trigger: ch, start: "top 75%", once: true },
          });
          gsap.from(ch.querySelectorAll(".st-in"), {
            y: 26,
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: { trigger: ch, start: "top 68%", once: true },
          });
        });

        // scoreboard rows land one by one
        gsap.from(".sb-row", {
          x: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".sb-table", start: "top 80%", once: true },
        });

        // the event log plays out, then the live counter climbs
        const log = gsap.timeline({ scrollTrigger: { trigger: ".lg-table", start: "top 75%", once: true } });
        log.from(".lg-row", { opacity: 0, y: 10, duration: 0.35, stagger: 0.35, ease: "power2.out" });
        const counter = { v: 0 };
        log.fromTo(
          ".lg-bar",
          { scaleX: 0 },
          { scaleX: 1, duration: 1.4, ease: "power2.out", transformOrigin: "0% 50%" },
          "+=0.1"
        );
        log.to(
          counter,
          {
            v: origin.logLive,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => {
              const el = document.querySelector(".lg-count");
              if (el) el.textContent = String(Math.round(counter.v));
            },
          },
          "<"
        );

        // day one → now
        gsap.from(".d1-before li", {
          opacity: 0,
          y: 10,
          duration: 0.35,
          stagger: 0.1,
          scrollTrigger: { trigger: ".d1-grid", start: "top 78%", once: true },
        });
        gsap.from(".d1-now li", {
          opacity: 0,
          x: 20,
          duration: 0.4,
          stagger: 0.12,
          delay: 0.5,
          scrollTrigger: { trigger: ".d1-grid", start: "top 78%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  const go = (i: number) => {
    lenis?.scrollTo(`#story-${origin.chapters[i].id}`, { offset: -90, duration: 1.3 });
  };

  return (
    <section ref={ref} id="origin" aria-label="My story" className="on-black relative px-[var(--gutter)] pb-24 pt-28">
      <div className="st-head grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SectionLabel label={origin.label} className="lg:col-span-12" />
        <h2
          className="display mt-6 text-[clamp(52px,8vw,150px)] leading-[0.86] lg:col-span-8"
          style={{ fontWeight: 800, fontStretch: "92%" }}
        >
          {origin.title}
        </h2>
        <p className="mono self-end text-[var(--mute)] lg:col-span-4 lg:pb-3 lg:text-right">{origin.intro}</p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:mt-24 lg:grid-cols-12">
        {/* sticky index */}
        <nav aria-label="Chapters" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-28">
            {origin.chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => go(i)}
                  className={`grid w-full grid-cols-[2.2rem_1fr] items-baseline border-t py-4 text-left transition-colors duration-300 ${
                    i === active
                      ? "border-[var(--paper)] text-[var(--paper)]"
                      : "border-[var(--line-dark)] text-[var(--mute)] hover:text-[var(--paper)]/80"
                  }`}
                >
                  <span className="mono">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-[19px] leading-tight" style={{ fontWeight: 600 }}>
                      {c.title}
                    </span>
                    <span className="mono mt-1 block text-[10px] opacity-70">{c.when}</span>
                  </span>
                </button>
              </li>
            ))}
            <li className="mono mt-6 text-[10px] text-[var(--mute)]">
              {String(active + 1).padStart(2, "0")} / {String(origin.chapters.length).padStart(2, "0")}
            </li>
          </ol>
        </nav>

        {/* chapters */}
        <div className="lg:col-span-9">
          {origin.chapters.map((c, i) => (
            <Chapter key={c.id} chapter={c} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Chapter({ chapter: c, index }: { chapter: StoryChapter; index: number }) {
  return (
    <article
      id={`story-${c.id}`}
      className="st-chapter grid grid-cols-1 gap-10 border-t border-[var(--line-dark)] py-16 lg:min-h-[80vh] lg:grid-cols-9 lg:gap-8 lg:py-24 lg:last:min-h-0"
    >
      <div className="lg:col-span-5">
        <p className="st-in mono text-[var(--mute)]">
          {String(index + 1).padStart(2, "0")} · {c.when}
        </p>
        <h3
          className="st-title display mt-5 text-[clamp(44px,5.6vw,104px)] leading-[0.9]"
          style={{ fontWeight: 800, fontStretch: "95%" }}
        >
          <span className="mask-line">
            <span>{c.title}</span>
          </span>
        </h3>
        <p className="st-in voice mt-8 max-w-[22em] text-[clamp(22px,2vw,32px)] leading-[1.2] text-[var(--paper)]">
          {c.quote}
        </p>
        {c.body.map((b, k) => (
          <p key={k} className="st-in body-copy mt-6 text-[var(--paper)]/70">
            {b}
          </p>
        ))}
      </div>

      <div className="st-in flex items-start lg:col-span-4 lg:items-center lg:justify-end">
        <Module kind={c.module} />
      </div>
    </article>
  );
}

function Module({ kind }: { kind: StoryChapter["module"] }) {
  if (kind === "scoreboard") return <Scoreboard />;
  if (kind === "calculator") return <Calculator caption={origin.calculatorCaption} />;
  if (kind === "log") return <EventLog />;
  return <DayOne />;
}

/* ---------- 01: the scoreboard (+ the football photo, once it exists) ---------- */
function Scoreboard() {
  const hasPhoto = useImageAvailable(images.football);
  return (
    <div className="w-full max-w-[26rem]">
      {hasPhoto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images.football}
          alt="Mayukh playing football"
          className="mb-6 aspect-[4/3] w-full object-cover grayscale"
        />
      )}
      <table className="sb-table w-full border-collapse">
        <caption className="mono mb-3 text-left text-[10px] text-[var(--mute)]">[ the record ]</caption>
        <tbody>
          {origin.scoreboard.map((r) => (
            <tr key={r.what} className="sb-row border-t border-[var(--line-dark)]">
              <th scope="row" className="py-4 pr-4 text-left align-top text-[15px] font-normal text-[var(--paper)]/80">
                {r.what}
                <span className="mono mt-1 block text-[10px] text-[var(--mute)]">{r.note}</span>
              </th>
              {/* teal use #2: the U-17 win */}
              <td
                className={`display py-4 text-right align-top text-[clamp(30px,2.6vw,44px)] leading-none ${r.accent ? "teal" : ""}`}
                style={{ fontWeight: 800, fontStretch: "90%" }}
              >
                {r.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 03: the day of the event, as a log ---------- */
function EventLog() {
  return (
    <div className="lg-table w-full max-w-[26rem] border border-[var(--line-dark)] p-5">
      <p className="mono mb-4 text-[10px] text-[var(--mute)]">[ e-cell · event day ]</p>
      <ol>
        {origin.log.map(([k, v], i) => (
          <li key={k} className="lg-row grid grid-cols-[5.5rem_1fr] gap-3 border-t border-[var(--line-dark)] py-3">
            <span className="mono text-[10px] text-[var(--mute)]">
              {String(i + 1).padStart(2, "0")} {k}
            </span>
            <span className="text-[15px] leading-snug text-[var(--paper)]/85">{v}</span>
          </li>
        ))}
        <li className="lg-row grid grid-cols-[5.5rem_1fr] items-center gap-3 border-t border-[var(--line-dark)] pt-4">
          <span className="mono text-[10px] text-[var(--mute)]">05 Live</span>
          <span className="flex items-center gap-4">
            <span className="relative h-[6px] flex-1 bg-[var(--line-dark)]">
              <span className="lg-bar absolute inset-0 block origin-left bg-[var(--paper)]" />
            </span>
            {/* teal use #3 */}
            <span className="display teal text-[40px] leading-none" style={{ fontWeight: 800 }}>
              <span className="lg-count">{origin.logLive}</span>
            </span>
          </span>
        </li>
      </ol>
      <p className="mono mt-3 text-right text-[10px] text-[var(--mute)]">people used it live</p>
    </div>
  );
}

/* ---------- 04: day one vs now ---------- */
function DayOne() {
  return (
    <div className="d1-grid grid w-full max-w-[28rem] grid-cols-2 border border-[var(--line-dark)]">
      <div className="d1-before border-r border-[var(--line-dark)] p-5">
        <p className="mono mb-4 text-[10px] text-[var(--mute)]">Day one</p>
        <ul className="space-y-3">
          {origin.dayOne.before.map((t) => (
            <li key={t} className="text-[15px] leading-snug text-[var(--paper)]/55">
              {t}
            </li>
          ))}
        </ul>
      </div>
      <div className="d1-now bg-[var(--paper)] p-5 text-[var(--black)]">
        <p className="mono mb-4 text-[10px] opacity-60">Now</p>
        <ul className="space-y-3">
          {origin.dayOne.now.map((t) => (
            <li key={t} className="text-[15px] leading-snug" style={{ fontWeight: 500 }}>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
