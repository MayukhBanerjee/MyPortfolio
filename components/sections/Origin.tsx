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
 * Each chapter is the story in plain words, plus one thing to look at or play with.
 * The thing never repeats the words: the record shows the numbers, the calculator is a calculator,
 * the counter is the one number the story leaves out, the list is who I work on.
 * Desktop: a sticky index on the left tracks where you are.
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

        // the record lands row by row
        gsap.from(".sb-row", {
          x: -20,
          opacity: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".sb-table", start: "top 80%", once: true },
        });

        // the counter climbs to its number
        const counter = { v: 0 };
        const ct = gsap.timeline({ scrollTrigger: { trigger: ".ct-box", start: "top 78%", once: true } });
        ct.fromTo(".ct-bar", { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: "power2.out", transformOrigin: "0% 50%" }, 0).to(
          counter,
          {
            v: origin.counter.value,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              const el = document.querySelector(".ct-count");
              if (el) el.textContent = String(Math.round(counter.v));
            },
          },
          0
        );

        gsap.from(".pr-row", {
          opacity: 0,
          y: 14,
          duration: 0.4,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".pr-list", start: "top 80%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  const go = (target: string, offset = 0) => lenis?.scrollTo(target, { offset, duration: 1.4 });

  return (
    <section ref={ref} id="origin" aria-label="My story" className="on-black relative px-[var(--gutter)] pb-24 pt-28">
      <div className="st-head grid grid-cols-1 gap-6 lg:grid-cols-12">
        <SectionLabel label={origin.label} className="lg:col-span-12" />
        <h2
          className="display mt-6 text-[clamp(52px,8vw,150px)] leading-[0.86] lg:col-span-12"
          style={{ fontWeight: 800, fontStretch: "92%" }}
        >
          {origin.title}
        </h2>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-10 lg:mt-24 lg:grid-cols-12">
        {/* sticky index */}
        <nav aria-label="Chapters" className="hidden lg:col-span-3 lg:block">
          <ol className="sticky top-28">
            {origin.chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  onClick={() => go(`#story-${c.id}`, -90)}
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
          </ol>
        </nav>

        {/* chapters */}
        <div className="lg:col-span-9">
          {origin.chapters.map((c, i) => (
            <Chapter key={c.id} chapter={c} index={i} onGo={go} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Chapter({
  chapter: c,
  index,
  onGo,
}: {
  chapter: StoryChapter;
  index: number;
  onGo: (target: string, offset?: number) => void;
}) {
  return (
    <article
      id={`story-${c.id}`}
      className="st-chapter grid grid-cols-1 gap-10 border-t border-[var(--line-dark)] py-16 lg:min-h-[78vh] lg:grid-cols-9 lg:gap-8 lg:py-24 lg:last:min-h-0"
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
        <p className="st-in mt-8 max-w-[26em] text-[clamp(19px,1.7vw,26px)] leading-[1.4] text-[var(--paper)]/90">{c.lead}</p>
        {c.note && (
          <p className="st-in voice mt-7 max-w-[24em] text-[clamp(20px,1.8vw,28px)] leading-[1.25] text-[var(--paper)]/60">
            {c.note}
          </p>
        )}
      </div>

      <div className="st-in flex items-start lg:col-span-4 lg:items-center lg:justify-end">
        <Module kind={c.module} onGo={onGo} />
      </div>
    </article>
  );
}

function Module({ kind, onGo }: { kind: StoryChapter["module"]; onGo: (target: string, offset?: number) => void }) {
  if (kind === "scoreboard") return <Scoreboard />;
  if (kind === "calculator") return <Calculator caption={origin.calculatorCaption} />;
  if (kind === "counter") return <Counter />;
  return <Products onGo={onGo} />;
}

/* ---------- 01: the record (the numbers the story leaves out) ---------- */
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

/* ---------- 03: the one number the story leaves out ---------- */
function Counter() {
  return (
    <div className="ct-box w-full max-w-[26rem] border border-[var(--line-dark)] p-6">
      <p className="mono mb-5 text-[10px] text-[var(--mute)]">[ event day ]</p>
      {/* teal use #3 */}
      <p className="display teal leading-[0.85]" style={{ fontWeight: 800, fontStretch: "90%", fontSize: "clamp(88px,9vw,150px)" }}>
        <span className="ct-count">{origin.counter.value}</span>
      </p>
      <span className="relative mt-6 block h-[6px] bg-[var(--line-dark)]">
        <span className="ct-bar absolute inset-0 block origin-left bg-[var(--paper)]" />
      </span>
      <p className="mono mt-3 text-[10px] text-[var(--mute)]">{origin.counter.label}</p>
    </div>
  );
}

/* ---------- 04: the products (the story says "live products"; this says which) ---------- */
function Products({ onGo }: { onGo: (target: string, offset?: number) => void }) {
  return (
    <div className="w-full max-w-[26rem]">
      <p className="mono mb-3 text-[10px] text-[var(--mute)]">[ {origin.products.label} ]</p>
      <ul className="pr-list">
        {origin.products.items.map(([name, what, href]) => (
          <li key={name} className="pr-row border-t border-[var(--line-dark)] last:border-b">
            {href ? (
              <button
                onClick={() => onGo(href, 0)}
                className="group flex w-full items-baseline justify-between gap-4 py-4 text-left"
              >
                <span className="text-[19px]" style={{ fontWeight: 600 }}>
                  {name}
                </span>
                <span className="mono text-[var(--mute)] transition-colors group-hover:text-[var(--paper)]">
                  {what} →
                </span>
              </button>
            ) : (
              <div className="flex items-baseline justify-between gap-4 py-4">
                <span className="text-[19px]" style={{ fontWeight: 600 }}>
                  {name}
                </span>
                <span className="mono text-[var(--mute)]">{what}</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
