"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import type { Project } from "@/data/portfolio";
import { useSite } from "@/components/Providers";

/** Full-screen black detail view. The whole project story, told by the person who built it. */
export default function ProjectOverlay({ project, onClose }: { project: Project; onClose: () => void }) {
  const { lenis } = useSite();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    lenis?.stop();
    closeRef.current?.focus();
    const el = ref.current;
    if (el && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.fromTo(el, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 0.55, ease: "expo.out" });
      gsap.from(el.querySelectorAll(".po-in"), { y: 30, opacity: 0, duration: 0.5, ease: "power3.out", stagger: 0.06, delay: 0.15 });
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [lenis, onClose]);

  const isMox = project.slug === "moxsend";

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={project.name}
      data-lenis-prevent
      className="on-black fixed inset-0 z-[97] overflow-y-auto px-[var(--gutter)] pb-24 pt-4"
    >
      <div className="mono flex h-8 items-center justify-between">
        <span className="text-[var(--mute)]">[ {project.meta} ]</span>
        <button ref={closeRef} onClick={onClose} className="hover:opacity-60">
          [ close ]
        </button>
      </div>

      <h2
        className="po-in display mt-[8vh] whitespace-nowrap text-[clamp(56px,13vw,240px)]"
        style={{ fontStretch: "110%" }}
      >
        {project.name}
      </h2>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <p className="po-in text-[clamp(22px,2.2vw,34px)] leading-[1.15]" style={{ fontWeight: 600 }}>
            {project.problem}
          </p>
          <div className="po-in mt-10">
            {/* teal use #4 — Moxsend's 90%. Other receipts stay paper-white. */}
            <div
              className={`display text-[clamp(56px,7vw,120px)] ${isMox ? "teal" : ""}`}
              style={{ fontStretch: "90%", fontWeight: 800 }}
            >
              {project.receipt.value}
            </div>
            <div className="mono mt-2 text-[var(--mute)]">{project.receipt.label}</div>
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          {[...project.body, ...project.long].map((p, i) => (
            <p key={i} className="po-in body-copy mb-6 text-[var(--paper)]/85">
              {p}
            </p>
          ))}
          <p className="po-in mono mt-10 normal-case tracking-normal text-[var(--mute)]">{project.stack}</p>
          {project.links.length > 0 && (
            <div className="po-in mono mt-6 flex gap-6">
              {project.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="hover:opacity-60">
                  [ {l.label} → ]
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
