"use client";

import { useRef, type CSSProperties, type ElementType } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

/** Lines that arrive from below their own mask. Never fades, never per-letter. */
export default function MaskLines({
  lines,
  as: Tag = "h2",
  className = "",
  style,
  start = "top 82%",
  stagger = 0.08,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  start?: string;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(ref.current!.querySelectorAll(".mask-line > span"), {
          yPercent: 108,
          duration: 0.55,
          ease: "power3.out",
          stagger,
          scrollTrigger: { trigger: ref.current, start, once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className} style={style}>
      {lines.map((l, i) => (
        <span key={i} className="mask-line">
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}
