"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { statement } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * Section 02 — paper, sudden after the black hero.
 * Each word snaps in on its own scroll position: a cut, not a fade.
 */
export default function Statement() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const words = gsap.utils.toArray<HTMLElement>(".st-word");
        gsap.set(words, { opacity: 0.07 });
        gsap.set([".st-aside", ".st-body"], { opacity: 0, y: 18 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: "+=130%",
            pin: true,
            scrub: true,
            refreshPriority: 2,
          },
        });
        words.forEach((w, i) => tl.to(w, { opacity: 1, duration: 0.001, ease: "none" }, i * 0.1));
        tl.to(".st-body", { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }, words.length * 0.1 + 0.1);
        tl.to(".st-aside", { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" }, words.length * 0.1 + 0.35);
        tl.to({}, { duration: 0.4 });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section
      ref={ref}
      id="statement"
      aria-label="How I think about problems"
      className="on-paper relative flex min-h-[100svh] flex-col justify-between px-[var(--gutter)] pb-10 pt-20"
    >
      <SectionLabel label={statement.label} />

      <h2
        className="display my-10 text-[clamp(44px,7.4vw,132px)] leading-[0.92]"
        style={{ fontWeight: 800, fontStretch: "100%" }}
      >
        {statement.lines.map((line, li) => (
          <span key={li} className="block">
            {line.split(" ").map((w, wi) => (
              <span key={wi} className="st-word inline-block pr-[0.22em]">
                {w}
              </span>
            ))}
          </span>
        ))}
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
        <p className="st-body body-copy text-[var(--black)]/80 md:col-span-4 md:col-start-1">{statement.body}</p>
        <p className="st-aside voice text-[clamp(22px,2.1vw,34px)] leading-[1.2] md:col-span-6 md:col-start-7">
          {statement.aside}
        </p>
      </div>
    </section>
  );
}
