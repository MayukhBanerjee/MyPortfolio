"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Bracketed mono metadata: [ 31' ]  HOW I WORK
 * The minute comes from where the section really sits in the scroll (00'–90').
 */
export default function SectionLabel({ label, className = "" }: { label: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [minute, setMinute] = useState("··");

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.5;
      const m = Math.max(0, Math.min(90, Math.round((top / Math.max(1, max)) * 90)));
      setMinute(String(m).padStart(2, "0"));
    };
    update();
    ScrollTrigger.addEventListener("refresh", update);
    return () => ScrollTrigger.removeEventListener("refresh", update);
  }, []);

  return (
    <div ref={ref} className={`mono flex items-baseline gap-4 ${className}`}>
      <span>[ {minute}&apos; ]</span>
      <span className="opacity-60">{label}</span>
    </div>
  );
}
