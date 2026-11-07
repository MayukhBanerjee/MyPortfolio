"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { method } from "@/data/portfolio";
import SectionLabel from "@/components/ui/SectionLabel";
import MaskLines from "@/components/ui/MaskLines";
import TinyLM from "@/components/work/TinyLM";

/** Section 04 — research first, depth proven by a model you can play with. */
export default function HowIWork() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(".ladder-row", {
          x: -24,
          opacity: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ".ladder", start: "top 80%", once: true },
        });
        gsap.from(".ladder-rule", {
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ".ladder", start: "top 80%", once: true },
        });
        gsap.from(".hw-fade", {
          y: 24,
          opacity: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ".hw-fade", start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <section ref={ref} id="how" aria-label="How I work" className="on-paper relative px-[var(--gutter)] pb-28 pt-28">
      <SectionLabel label={method.label} />

      <div className="mt-14 grid grid-cols-1 gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <MaskLines
            lines={method.headline}
            className="display text-[clamp(38px,5.4vw,96px)] leading-[0.92]"
            style={{ fontWeight: 800 }}
          />
          <p className="hw-fade body-copy mt-10 text-[var(--black)]/85">{method.body}</p>
          <p className="hw-fade body-copy mt-6 text-[var(--black)]/85">{method.depth}</p>
          <p className="hw-fade voice mt-10 max-w-[26em] text-[clamp(22px,2vw,32px)] leading-[1.2]">{method.confidence}</p>
        </div>

        <ol className="ladder self-end lg:col-span-4 lg:col-start-9">
          {method.ladder.map((step, i) => (
            <li key={step} className="ladder-row relative py-3">
              <span className="ladder-rule absolute left-0 right-0 top-0 block h-px bg-[var(--black)]/25" />
              <span className="mono mr-4 text-[var(--mute-dark)]">{String(i + 1).padStart(2, "0")}</span>
              <span className="text-[17px]" style={{ fontWeight: i === method.ladder.length - 1 ? 600 : 400 }}>
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-28">
        <TinyLM />
      </div>
    </section>
  );
}
