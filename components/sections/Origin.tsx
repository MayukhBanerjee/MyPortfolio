"use client";

import { useRef } from "react";
import { gsap, MQ, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { origin } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * Section 03 — four chapters, side by side. The numbers are witnesses, not metrics.
 * Desktop: pinned horizontal scroll. Mobile: vertical stack.
 */
export default function Origin() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MQ.desktop, () => {
        const track = trackRef.current!;
        const distance = () => track.scrollWidth - window.innerWidth;
        const scroller = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            refreshPriority: 1,
          },
        });

        gsap.utils.toArray<HTMLElement>(".or-chapter").forEach((ch) => {
          // numerals drift slower than the panel: depth without 3D
          gsap.fromTo(
            ch.querySelector(".or-num"),
            { xPercent: 12 },
            {
              xPercent: -12,
              ease: "none",
              scrollTrigger: {
                trigger: ch,
                containerAnimation: scroller,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            }
          );
          gsap.from(ch.querySelectorAll(".or-in"), {
            yPercent: 40,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.07,
            scrollTrigger: { trigger: ch, containerAnimation: scroller, start: "left 70%", once: true },
          });
        });

        // 2+2 resolves to 4 as its chapter reaches the middle
        const calc = document.querySelector<HTMLElement>(".or-calc");
        if (calc) {
          ScrollTrigger.create({
            trigger: calc.closest(".or-chapter"),
            containerAnimation: scroller,
            start: "left 45%",
            onEnter: () => (calc.textContent = calc.dataset.resolve ?? calc.textContent),
            onLeaveBack: () => (calc.textContent = calc.dataset.numeral ?? calc.textContent),
          });
        }
      });

      mm.add(MQ.mobile, () => {
        gsap.utils.toArray<HTMLElement>(".or-chapter").forEach((ch) => {
          gsap.from(ch.querySelectorAll(".or-in"), {
            y: 30,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.07,
            scrollTrigger: { trigger: ch, start: "top 75%", once: true },
          });
          const calc = ch.querySelector<HTMLElement>(".or-calc");
          if (calc) {
            ScrollTrigger.create({
              trigger: ch,
              start: "top 40%",
              onEnter: () => (calc.textContent = calc.dataset.resolve ?? ""),
              onLeaveBack: () => (calc.textContent = calc.dataset.numeral ?? ""),
            });
          }
        });
      });

      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="origin" aria-label="How it started" className="on-black relative overflow-hidden">
      <div className="absolute left-[var(--gutter)] top-20 z-20 text-[var(--paper)] mix-blend-difference">
        <SectionLabel label={origin.label} />
      </div>

      <div ref={trackRef} className="flex flex-col md:h-[100svh] md:w-max md:flex-row">
        {origin.chapters.map((c, i) => (
          <article
            key={c.numeral}
            className="or-chapter relative flex w-full flex-col justify-end overflow-hidden border-b border-[var(--line-dark)] px-[var(--gutter)] pb-14 pt-16 first:pt-32 md:h-full md:w-[100vw] md:border-b-0 md:border-r md:pb-[12vh] md:pt-32"
          >
            {/* the numeral, cropped by the top edge */}
            <div className="pointer-events-none relative mb-8 text-[clamp(120px,30vw,520px)] leading-[0.8] md:absolute md:left-[var(--gutter)] md:top-[-0.12em] md:mb-0 md:leading-none">
              <span
                className={`or-num display block whitespace-nowrap text-[var(--paper)] ${c.resolve ? "or-calc" : ""}`}
                data-numeral={c.numeral}
                data-resolve={c.resolve}
                style={{ fontStretch: "88%", fontWeight: 800 }}
              >
                {c.numeral}
              </span>
            </div>

            <div className="relative grid grid-cols-1 gap-6 md:grid-cols-12">
              <p className="or-in mono text-[var(--mute)] md:col-span-3">
                {String(i + 1).padStart(2, "0")} / {String(origin.chapters.length).padStart(2, "0")}
                <br />
                <span className="text-[var(--paper)]">{c.label}</span>
              </p>
              <div className="md:col-span-6 md:col-start-5">
                <p className="or-in text-[clamp(20px,2vw,30px)] leading-[1.3]">
                  {c.parts.map((p, k) =>
                    typeof p === "string" ? (
                      <span key={k}>{p}</span>
                    ) : (
                      <span key={k} className="teal">
                        {p.accent}
                      </span>
                    )
                  )}
                </p>
                {c.numeral === "200" && (
                  <p className="or-in voice mt-6 text-[clamp(18px,1.5vw,24px)] leading-snug text-[var(--paper)]/70">
                    {origin.turn}
                  </p>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
