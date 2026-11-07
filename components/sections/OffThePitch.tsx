"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { useImageAvailable } from "@/lib/hooks";
import { images, pitch } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * Section 07 — outside work. How I keep it all together, then one quiet line.
 * The diary appears only when there is a real photo of it. Nothing is made up.
 */
export default function OffThePitch() {
  const ref = useRef<HTMLElement>(null);
  const hasDiary = useImageAvailable(images.diary);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(".dy-intro, .dy-card", {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: ".dy-intro", start: "top 80%", once: true },
        });
        gsap.fromTo(
          ".pt-proud",
          { opacity: 0 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: ".pt-quiet", start: "top 60%", end: "top 20%", scrub: true },
          }
        );
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [hasDiary], revertOnUpdate: true }
  );

  return (
    <section ref={ref} id="pitch" aria-label="Outside work" className="on-paper relative pt-28">
      <div className="px-[var(--gutter)]">
        <SectionLabel label={pitch.label} />
      </div>

      <div
        className={`mt-16 grid grid-cols-1 items-center gap-14 px-[var(--gutter)] lg:grid-cols-12 ${
          hasDiary ? "" : "lg:min-h-[40vh]"
        }`}
      >
        <div className={hasDiary ? "lg:col-span-5" : "lg:col-span-8 lg:col-start-3"}>
          <p className="dy-intro voice text-[clamp(26px,2.6vw,44px)] leading-[1.2]">{pitch.diaryIntro}</p>
        </div>
        {hasDiary && (
          <div className="dy-card relative lg:col-span-5 lg:col-start-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images.diary} alt="A page from my diary" className="w-full rotate-[-1.5deg] object-cover" />
          </div>
        )}
      </div>

      <div className="pt-quiet flex min-h-[100svh] items-center justify-center px-[var(--gutter)]">
        <p className="pt-proud voice max-w-[22em] text-center text-[clamp(20px,1.8vw,28px)] leading-[1.35]">{pitch.proud}</p>
      </div>
    </section>
  );
}
