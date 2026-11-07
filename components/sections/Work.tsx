"use client";

import { useCallback, useRef, useState } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { projects, type Project } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";
import PipelineVisual from "@/components/work/PipelineVisual";
import SalonStory from "@/components/work/SalonStory";
import BuildingSim from "@/components/work/BuildingSim";
import VoiceWave from "@/components/work/VoiceWave";
import ProjectOverlay from "@/components/work/ProjectOverlay";

const VISUALS: Record<Project["visual"], () => React.ReactElement> = {
  pipeline: () => <PipelineVisual />,
  salon: () => <SalonStory />,
  building: () => <BuildingSim />,
  voice: () => <VoiceWave />,
};

/**
 * Section 05 — editorial, left-heavy. One project per viewport.
 * The name runs off the left edge. No mockups in browser frames, no "View Project" buttons.
 */
export default function Work() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Project | null>(null);
  const close = useCallback(() => setOpen(null), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.utils.toArray<HTMLElement>(".wk-panel").forEach((panel) => {
          gsap.fromTo(
            panel.querySelector(".wk-name"),
            { xPercent: 6 },
            {
              xPercent: -4,
              ease: "none",
              scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true },
            }
          );
          gsap.from(panel.querySelector(".wk-rule"), {
            scaleX: 0,
            transformOrigin: "0% 50%",
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: panel, start: "top 70%", once: true },
          });
          gsap.from(panel.querySelectorAll(".wk-in"), {
            y: 28,
            opacity: 0,
            duration: 0.5,
            ease: "power3.out",
            stagger: 0.07,
            scrollTrigger: { trigger: panel, start: "top 62%", once: true },
          });
          gsap.from(panel.querySelector(".wk-visual"), {
            clipPath: "inset(0 100% 0 0)",
            duration: 0.9,
            ease: "expo.out",
            scrollTrigger: { trigger: panel, start: "top 62%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="work" aria-label="Work" className="on-paper relative overflow-hidden pt-28">
      <div className="px-[var(--gutter)]">
        <SectionLabel label="work" />
      </div>

      {projects.map((p, i) => (
        <article
          key={p.slug}
          className="wk-panel relative flex min-h-[100svh] flex-col justify-center border-b border-[var(--line-light)] py-20"
        >
          {/* the name, bleeding off the left edge */}
          <div className="relative overflow-hidden">
            <h3
              className="wk-name display -ml-[0.06em] whitespace-nowrap leading-[0.8]"
              style={{
                fontSize: `min(${Math.min(17, 138 / p.name.length).toFixed(2)}vw, 330px)`,
                fontStretch: p.name.length > 8 ? "82%" : "100%",
              }}
            >
              {p.name}
            </h3>
          </div>
          <span className="wk-rule mx-[var(--gutter)] mt-4 block h-px bg-[var(--black)]" />

          <div className="mt-10 grid grid-cols-1 gap-10 px-[var(--gutter)] lg:grid-cols-12">
            <div className="wk-visual on-black relative aspect-[4/3] overflow-hidden lg:col-span-6">
              {VISUALS[p.visual]()}
            </div>

            <div className="flex flex-col lg:col-span-5 lg:col-start-8">
              <p className="wk-in mono flex justify-between gap-6 text-[var(--mute-dark)]">
                <span className="whitespace-nowrap">
                  [ {String(i + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")} ]
                </span>
                <span className="text-right">{p.meta}</span>
              </p>
              <p className="wk-in mt-8 text-[clamp(24px,2.4vw,38px)] leading-[1.08]" style={{ fontWeight: 600 }}>
                {p.problem}
              </p>
              {p.body.map((b, k) => (
                <p key={k} className="wk-in body-copy mt-5 text-[var(--black)]/80">
                  {b}
                </p>
              ))}

              <div className="wk-in mt-8 flex items-end justify-between gap-6 border-t border-[var(--line-light)] pt-5">
                <div>
                  <div className="display text-[clamp(34px,3.2vw,54px)]" style={{ fontWeight: 800, fontStretch: "90%" }}>
                    {p.receipt.value}
                  </div>
                  <div className="mono mt-1 text-[var(--mute-dark)]">{p.receipt.label}</div>
                </div>
                <button
                  onClick={() => setOpen(p)}
                  aria-label={`Open the full story of ${p.name}`}
                  className="group flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--black)] text-[22px] transition-colors hover:bg-[var(--black)] hover:text-[var(--paper)]"
                >
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
              </div>
              <p className="wk-in mono mt-5 normal-case tracking-normal text-[var(--mute-dark)]">{p.stack}</p>
            </div>
          </div>
        </article>
      ))}

      {open && <ProjectOverlay project={open} onClose={close} />}
    </section>
  );
}
