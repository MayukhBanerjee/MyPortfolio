"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";
import { experience, type Role } from "@/data/portfolio";
import { useSite } from "@/components/Providers";
import SectionLabel from "@/components/ui/SectionLabel";

/**
 * The record, right after the hero: role, dates, place, education.
 * It answers "student or experienced, and when can he join?" in one glance.
 */
export default function Experience() {
  const ref = useRef<HTMLElement>(null);
  const { lenis } = useSite();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(".ex-row", {
          y: 26,
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
        gsap.from(".ex-rule", {
          scaleX: 0,
          transformOrigin: "0% 50%",
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    lenis?.scrollTo(href, { duration: 1.4 });
  };

  return (
    <section ref={ref} id="experience" aria-label="Experience" className="on-black relative px-[var(--gutter)] py-24 md:py-28">
      <SectionLabel label={experience.label} />
      <ol className="mt-10">
        {experience.roles.map((r) => (
          <Row key={r.title} role={r} onGo={go} />
        ))}
      </ol>

      <p className="mono mt-14 text-[var(--mute)]">[ {experience.educationLabel} ]</p>
      <ol className="mt-4">
        <Row role={experience.education} onGo={go} />
      </ol>
    </section>
  );
}

function Row({ role: r, onGo }: { role: Role; onGo: (href: string) => (e: React.MouseEvent) => void }) {
  return (
    <li className="relative">
      <span className="ex-rule absolute left-0 right-0 top-0 block h-px bg-[var(--line-dark)]" />
      <div className="ex-row grid grid-cols-1 gap-3 py-7 md:grid-cols-12 md:gap-6">
        <p className="mono pt-1 text-[var(--mute)] md:col-span-2">{r.when}</p>
        <div className="md:col-span-4">
          <p className="text-[clamp(21px,1.9vw,28px)] leading-[1.15]" style={{ fontWeight: 600 }}>
            {r.title}
          </p>
          <p className="mono mt-2 text-[var(--mute)]">
            {r.org} · {r.place}
          </p>
        </div>
        <div className="md:col-span-6">
          <p className="body-copy text-[var(--paper)]/75">{r.line}</p>
          {r.href && (
            <a href={r.href} onClick={onGo(r.href)} className="mono mt-3 inline-block text-[var(--paper)] hover:opacity-60">
              [ see the work ↓ ]
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
