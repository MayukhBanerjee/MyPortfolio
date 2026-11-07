"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { useImageAvailable } from "@/lib/hooks";
import { images, pitch } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * Section 07 — outside work. The diary, then one quiet line.
 * (Football lives in the story chapters now, so it isn't told twice.)
 */
export default function OffThePitch() {
  const ref = useRef<HTMLElement>(null);
  const hasDiary = useImageAvailable(images.diary);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(".dy-intro", {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: ".dy-intro", start: "top 80%", once: true },
        });
        // the diary: entries get struck through as you scroll
        gsap.to(".dy-strike", {
          scaleX: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: { trigger: ".dy-card", start: "top 70%", end: "bottom 45%", scrub: true },
        });
        // the quiet line
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
      mm.add(MQ.reduced, () => gsap.set(".dy-strike", { scaleX: 1 }));
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="pitch" aria-label="Outside work" className="on-paper relative pt-28">
      <div className="px-[var(--gutter)]">
        <SectionLabel label={pitch.label} />
      </div>

      <div className="mt-16 grid grid-cols-1 items-center gap-14 px-[var(--gutter)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="dy-intro voice text-[clamp(24px,2.3vw,38px)] leading-[1.2]">{pitch.diaryIntro}</p>
        </div>
        <div className="dy-card relative lg:col-span-5 lg:col-start-8">
          {hasDiary ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images.diary} alt="A page from my diary" className="w-full rotate-[-1.5deg] object-cover" />
          ) : (
            <div className="relative rotate-[-1.2deg] border border-[var(--black)]/20 bg-[#f7f5f1] px-8 pb-10 pt-8">
              <p className="mono mb-6 text-[var(--mute-dark)]">to do</p>
              <ul className="bg-[repeating-linear-gradient(transparent,transparent_43px,rgba(0,0,0,0.09)_43px,rgba(0,0,0,0.09)_44px)]">
                {pitch.diary.map((d) => (
                  <li key={d} className="relative flex h-11 items-end justify-between pb-2 text-[17px]">
                    <span className="voice text-[21px]">{d}</span>
                    <span className="mono text-[10px] text-[var(--mute-dark)]">due</span>
                    <span className="dy-strike absolute left-0 right-8 top-[58%] block h-[1.5px] origin-left scale-x-0 bg-[var(--black)]" />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="pt-quiet flex min-h-[100svh] items-center justify-center px-[var(--gutter)]">
        <p className="pt-proud voice max-w-[22em] text-center text-[clamp(20px,1.8vw,28px)] leading-[1.35]">{pitch.proud}</p>
      </div>
    </section>
  );
}
