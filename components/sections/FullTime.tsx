"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { useInView, useNearViewport } from "@/lib/hooks";
import { close, site } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";
import LiveTime from "@/components/ui/LiveTime";

const FormationScene = dynamic(() => import("@/components/three/FormationScene"), { ssr: false });

/** Section 08 — full time. Same black register as the open. An invitation, not a form. */
export default function FullTime() {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const near = useNearViewport(stageRef);
  const inView = useInView(stageRef);
  const [copied, setCopied] = useState(false);
  const [cycle, setCycle] = useState(0);

  const cycleLines = [...close.cycle, `${site.city} · `];

  useEffect(() => {
    const id = setInterval(() => setCycle((c) => (c + 1) % cycleLines.length), 3000);
    return () => clearInterval(id);
  }, [cycleLines.length]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.to(progress, {
          current: 1,
          ease: "none",
          scrollTrigger: { trigger: stageRef.current, start: "top 75%", end: "bottom bottom", scrub: 0.5 },
        });
        gsap.from(".ft-next > p", {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".ft-next", start: "top 80%", once: true },
        });
        gsap.from(".ft-hi > span > span", {
          yPercent: 105,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: ".ft-hi", start: "top 85%", once: true },
        });
      });
      mm.add(MQ.reduced, () => {
        progress.current = 1;
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section ref={ref} id="contact" aria-label="Contact" className="on-black relative overflow-hidden">
      <div className="px-[var(--gutter)] pt-28">
        <SectionLabel label="next" />
        <div className="ft-next mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <p className="text-[clamp(22px,2.1vw,32px)] leading-[1.3] lg:col-span-6" style={{ fontWeight: 500 }}>
            {close.next[0]}
          </p>
          <p className="body-copy self-end text-[var(--paper)]/70 lg:col-span-4 lg:col-start-9">{close.next[1]}</p>
        </div>
      </div>

      <div ref={stageRef} className="relative mt-24 flex min-h-[115svh] flex-col justify-end px-[var(--gutter)] pb-10">
        {/* the bookend: formation becomes a network */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[78%] opacity-80">
          {near && <FormationScene active={inView} progress={progress} />}
        </div>

        <div className="relative">
          <h2 className="ft-hi display text-[clamp(96px,24vw,440px)] leading-[0.8]" style={{ fontStretch: "105%" }}>
            <span className="mask-line">
              <span>{close.headline}</span>
            </span>
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <button
                onClick={copy}
                className="group max-w-full break-all text-left text-[clamp(22px,3.4vw,52px)] leading-none md:break-normal"
                style={{ fontWeight: 500 }}
                aria-label={`Copy email address ${site.email}`}
              >
                <span className="border-b border-[var(--paper)]/30 transition-colors group-hover:border-[var(--paper)]">
                  {site.email}
                </span>
                <span className="mono mt-3 block whitespace-nowrap text-[var(--mute)] md:ml-4 md:mt-0 md:inline md:align-middle">{copied ? "[ copied ]" : "[ copy ]"}</span>
              </button>
              <div className="mono mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <a href={site.links.linkedin} target="_blank" rel="noreferrer" className="hover:opacity-60">
                  [ linkedin ]
                </a>
                <a href={site.links.github} target="_blank" rel="noreferrer" className="hover:opacity-60">
                  [ github ]
                </a>
                <a href={site.links.resume} target="_blank" rel="noreferrer" className="hover:opacity-60">
                  [ resume → ]
                </a>
              </div>
            </div>
            <p className="body-copy self-end text-[var(--paper)]/70 lg:col-span-4 lg:col-start-9">{close.body}</p>
          </div>
        </div>
      </div>

      <footer className="mono relative flex flex-col gap-3 border-t border-[var(--line-dark)] px-[var(--gutter)] py-6 text-[var(--mute)] md:flex-row md:items-center md:justify-between">
        <span>
          {site.name} © {new Date().getFullYear()} · {site.classOf}
        </span>
        <span className="relative h-[1.5em] overflow-hidden text-[var(--paper)]" aria-live="off">
          <span key={cycle} className="ft-cycle block">
            [ {cycle === cycleLines.length - 1 ? <>{cycleLines[cycle]}<LiveTime /></> : cycleLines[cycle]} ]
          </span>
        </span>
        <span>Designed and built by me · 90+2&apos;</span>
      </footer>
    </section>
  );
}
