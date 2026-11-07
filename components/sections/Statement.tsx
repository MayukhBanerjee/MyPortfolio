"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { statement } from "@/data/portfolio";
import { useSite } from "@/components/Providers";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * Section 02 — "said out loud".
 * The claim sits small in the middle. Around it, the real problems behind the work wait as quiet grey notes.
 * On scroll, each one is said out loud (centre stage, big), then settles back in black with what it became.
 * Desktop: pinned and scrubbed. Mobile: a list that darkens as you read.
 */

// where each note sits on desktop (percent of the stage). Deliberately uneven.
const SPOTS = [
  { left: "3%", top: "6%" },
  { left: "71%", top: "4%" },
  { left: "74%", top: "62%" },
  { left: "4%", top: "66%" },
  { left: "30%", top: "82%" },
];

export default function Statement() {
  const ref = useRef<HTMLElement>(null);
  const { lenis } = useSite();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const notes = gsap.utils.toArray<HTMLElement>(".sn-note");
        const stages = gsap.utils.toArray<HTMLElement>(".sn-stage");
        gsap.set(stages, { autoAlpha: 0 });
        gsap.set(".sn-tag", { autoAlpha: 0, x: -8 });
        gsap.set(".sn-aside", { autoAlpha: 0, y: 16 });

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: `+=${notes.length * 55 + 60}%`,
            pin: true,
            scrub: 0.5,
            refreshPriority: 2,
          },
        });

        // the claim and the quiet notes arrive as the section comes in, before the pin starts
        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: "top 65%", once: true } })
          .from(".sn-claim .mask-line > span", { yPercent: 105, stagger: 0.08, duration: 0.55, ease: "power3.out" })
          .from(notes, { autoAlpha: 0, y: 12, stagger: 0.06, duration: 0.4, ease: "power3.out" }, "<0.25");
        tl.to({}, { duration: 0.6 }); // a beat to read the claim before the first problem

        stages.forEach((stage, i) => {
          const at = 1 + i * 1.6;
          const lines = stage.querySelectorAll(".mask-line > span");
          // the claim steps back while a problem is being said out loud
          if (i === 0) tl.to(".sn-claim", { opacity: 0, duration: 0.25 }, at);
          tl.set(stage, { autoAlpha: 1 }, at)
            .fromTo(lines, { yPercent: 105 }, { yPercent: 0, stagger: 0.06, duration: 0.45 }, at)
            // the quiet note becomes a fact
            .to(notes[i], { color: "var(--black)", opacity: 1, duration: 0.3, ease: "none" }, at + 0.35)
            .to(notes[i].querySelector(".sn-tag"), { autoAlpha: 1, x: 0, duration: 0.3 }, at + 0.5)
            .to(lines, { yPercent: -105, stagger: 0.04, duration: 0.4, ease: "power3.in" }, at + 1.15)
            .set(stage, { autoAlpha: 0 }, at + 1.55);
        });

        const end = 1 + stages.length * 1.6;
        tl.to(".sn-claim", { opacity: 1, duration: 0.35 }, end)
          .to(".sn-aside", { autoAlpha: 1, y: 0, duration: 0.4 }, end + 0.15)
          .to({}, { duration: 0.5 });
      });

      mm.add(MQ.mobile, () => {
        gsap.utils.toArray<HTMLElement>(".sn-note").forEach((n) => {
          gsap.fromTo(
            n,
            { opacity: 0.3 },
            {
              opacity: 1,
              color: "var(--black)",
              ease: "none",
              scrollTrigger: { trigger: n, start: "top 80%", end: "top 50%", scrub: true },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo(href, { duration: 1.6 });
  };

  return (
    <section
      ref={ref}
      id="statement"
      aria-label="How I think about problems"
      className="on-paper relative flex min-h-[100svh] flex-col px-[var(--gutter)] pb-10 pt-20"
    >
      <SectionLabel label={statement.label} />

      <div className="sn-board relative mt-10 flex-1 md:mt-6">
        {/* centre: the claim, and the stage where each problem is said out loud */}
        <div className="relative grid min-h-[46vh] place-items-center md:absolute md:inset-x-[16%] md:inset-y-[16%] md:min-h-0">
          <div className="sn-claim col-start-1 row-start-1 text-center">
            <h2
              className="display text-[clamp(34px,4.1vw,72px)] leading-[0.95]"
              style={{ fontWeight: 800, fontStretch: "100%" }}
            >
              {statement.lines.map((l, i) => (
                <span key={i} className="mask-line">
                  <span>{l}</span>
                </span>
              ))}
            </h2>
            <p className="mono mt-6 text-[var(--mute-dark)]">{statement.sub}</p>
          </div>

          {statement.notes.map((n, i) => (
            <p
              key={i}
              aria-hidden="true"
              className="sn-stage display pointer-events-none invisible col-start-1 row-start-1 hidden max-w-[17em] text-center text-[clamp(30px,3.6vw,64px)] leading-[1.02] md:block"
              style={{ fontWeight: 800 }}
            >
              {splitLines(n.text).map((l, k) => (
                <span key={k} className="mask-line">
                  <span>{l}</span>
                </span>
              ))}
            </p>
          ))}
        </div>

        {/* the notes: quiet until they're said out loud */}
        <ol className="mt-12 space-y-8 md:mt-0">
          {statement.notes.map((n, i) => (
            <li
              key={i}
              className="sn-note relative max-w-[21em] text-[var(--mute)] md:absolute md:max-w-[17em] md:opacity-40"
              style={{ ["--l" as string]: SPOTS[i].left, ["--t" as string]: SPOTS[i].top }}
            >
              <span className="mono mb-2 block text-[10px]">{String(i + 1).padStart(2, "0")}</span>
              <span className="voice block text-[clamp(20px,1.55vw,25px)] leading-[1.2]">{n.text}</span>
              <span className="sn-tag mono mt-3 block text-[var(--black)]">
                {n.href ? (
                  <a href={n.href} onClick={go(n.href)} className="border-b border-current pb-px hover:opacity-60">
                    → became {n.became}
                  </a>
                ) : (
                  <>→ became {n.became}</>
                )}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="relative mt-14 grid grid-cols-1 gap-8 md:mt-6 md:grid-cols-12">
        <p className="sn-aside voice text-[clamp(20px,1.7vw,28px)] leading-[1.25] md:col-span-5 md:col-start-8">
          {statement.aside}
        </p>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .sn-note { left: var(--l); top: var(--t); }
        }
      `}</style>
    </section>
  );
}

/** Break a sentence into 2–3 balanced lines for the big stage. */
function splitLines(text: string): string[] {
  const words = text.split(" ");
  const n = text.length > 60 ? 3 : 2;
  const target = text.length / n;
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > target && out.length < n - 1) {
      out.push(cur);
      cur = w;
    } else cur = cur ? cur + " " + w : w;
  }
  out.push(cur);
  return out;
}
