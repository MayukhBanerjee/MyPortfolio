"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { toolkit } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";

/** Section 06 — an op-ed, not a logo wall. Honest labels: shipped, built by hand, used. No 3D here on purpose. */
export default function Toolkit() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ".tk-list", start: "top 78%", once: true } });
        tl.from(".tk-name", { y: 16, opacity: 0, duration: 0.35, ease: "power3.out", stagger: 0.05 }, 0)
          .from(".tk-dots", { scaleX: 0, transformOrigin: "0% 50%", duration: 0.5, ease: "power2.out", stagger: 0.05 }, 0.1)
          .from(".tk-status", { opacity: 0, duration: 0.25, stagger: 0.05 }, 0.45);
        gsap.from(".tk-right > *", {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".tk-right", start: "top 78%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="toolkit" aria-label="Skills" className="on-black relative px-[var(--gutter)] py-28 md:py-36">
      <SectionLabel label="toolkit" />

      <div className="mt-16 grid grid-cols-1 gap-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="mono text-[var(--mute)]">[ {toolkit.left.label} ]</p>
          <ul className="tk-list mt-8">
            {toolkit.left.items.map(([name, status]) => (
              <li key={name} className="flex items-baseline gap-3 py-[0.55em] text-[clamp(18px,1.5vw,22px)]">
                <span className="tk-name shrink-0">{name}</span>
                <span className="tk-dots relative top-[-0.25em] block h-0 flex-1 border-b border-dotted border-[var(--paper)]/35" />
                <span
                  className={`tk-status mono shrink-0 ${status === "used" ? "text-[var(--mute)]" : "text-[var(--paper)]"}`}
                >
                  {status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="tk-right lg:col-span-5 lg:col-start-8">
          <p className="mono text-[var(--mute)]">[ {toolkit.right.strongLabel} ]</p>
          <p className="mt-6 text-[clamp(24px,2.3vw,36px)] leading-[1.3]" style={{ fontWeight: 500 }}>
            {toolkit.right.strong}
          </p>
          <p className="mono mt-14 text-[var(--mute)]">[ {toolkit.right.learnLabel} ]</p>
          <p className="body-copy mt-6 text-[var(--paper)]/75">{toolkit.right.learn}</p>
        </div>
      </div>
    </section>
  );
}
