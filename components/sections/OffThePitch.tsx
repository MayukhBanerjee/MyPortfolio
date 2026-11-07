"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { useImageAvailable } from "@/lib/hooks";
import { images, pitch } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * Section 07 — football, the diary, and one quiet line.
 * The reader makes the connection between sport and work themselves.
 */
export default function OffThePitch() {
  const ref = useRef<HTMLElement>(null);
  const hasFootball = useImageAvailable(images.football);
  const hasDiary = useImageAvailable(images.diary);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        // Under-17. / All India. / Gold.  — "Gold." lands one beat late
        const lines = gsap.utils.toArray<HTMLElement>(".pt-stack > span");
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".pt-stack", start: "top 75%", once: true } });
        lines.forEach((l, i) =>
          tl.fromTo(
            l.firstElementChild,
            { yPercent: 105 },
            { yPercent: 0, duration: 0.45, ease: "power3.out" },
            i === lines.length - 1 ? "+=0.55" : i * 0.14
          )
        );
        gsap.from(".pt-body > *", {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ".pt-body", start: "top 80%", once: true },
        });

        // the diary: entries get struck through as you scroll
        gsap.to(".dy-strike", {
          scaleX: 1,
          ease: "none",
          stagger: 0.5,
          scrollTrigger: { trigger: ".dy-card", start: "top 70%", end: "bottom 45%", scrub: true },
        });

        // the quiet line holds for a full scroll length
        gsap.fromTo(
          ".pt-proud",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1,
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
    <section ref={ref} id="pitch" aria-label="Off the pitch" className="on-paper relative pt-28">
      <div className="px-[var(--gutter)]">
        <SectionLabel label="before code" />
      </div>

      {/* part 1: the photo and the stack */}
      <div className="mt-12 grid grid-cols-1 items-end gap-12 lg:grid-cols-12">
        <figure className="relative aspect-[4/5] w-full overflow-hidden lg:col-span-7 lg:aspect-[5/6]">
          {hasFootball ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images.football} alt="Mayukh playing football" className="h-full w-full object-cover grayscale" />
          ) : (
            <div className="photo-fallback flex h-full w-full items-end p-5">
              <span className="mono text-[var(--mute)]">[ photo · football.jpg ]</span>
            </div>
          )}
        </figure>

        <div className="px-[var(--gutter)] lg:col-span-5 lg:pl-0">
          <h2 className="pt-stack display text-[clamp(56px,7.6vw,140px)] leading-[0.88]" style={{ fontStretch: "95%" }}>
            {pitch.stack.map((s) => (
              <span key={s} className="mask-line">
                <span>{s}</span>
              </span>
            ))}
          </h2>
          <div className="pt-body mt-10">
            {pitch.body.map((b, i) => (
              <p key={i} className="body-copy mt-5 text-[var(--black)]/80">
                {b}
              </p>
            ))}
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--line-light)] pt-6 sm:grid-cols-3">
              {pitch.stats.map(([v, l]) => (
                <div key={l}>
                  <dt className="display text-[clamp(26px,2.4vw,38px)]" style={{ fontWeight: 800, fontStretch: "90%" }}>
                    {v}
                  </dt>
                  <dd className="mono mt-1 text-[var(--mute-dark)]">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* part 2: the diary */}
      <div className="mt-36 grid grid-cols-1 items-center gap-14 px-[var(--gutter)] lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="voice text-[clamp(24px,2.3vw,38px)] leading-[1.2]">{pitch.diaryIntro}</p>
        </div>
        <div className="dy-card relative lg:col-span-5 lg:col-start-8">
          {hasDiary ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images.diary} alt="A page from my diary" className="w-full rotate-[-1.5deg] object-cover shadow-none" />
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

      {/* part 3: the quiet line */}
      <div className="pt-quiet flex min-h-[110svh] items-center justify-center px-[var(--gutter)]">
        <p className="pt-proud voice max-w-[22em] text-center text-[clamp(20px,1.8vw,28px)] leading-[1.35]">{pitch.proud}</p>
      </div>
    </section>
  );
}
