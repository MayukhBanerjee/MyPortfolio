"use client";

import { useEffect, useRef } from "react";
import { highlights, site } from "@/data/portfolio";
import { useSite } from "@/components/Providers";

/** The recruiter fast path. Opens from [ 30 sec ] or the H key. */
export default function HighlightsSheet() {
  const { highlightsOpen: open, setHighlightsOpen: setOpen, phase } = useSite();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") setOpen(false);
      if ((e.key === "h" || e.key === "H") && !e.metaKey && !e.ctrlKey && !e.altKey && phase === "done") setOpen(!open);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen, phase]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={highlights.title}
      data-lenis-prevent
      className="on-black fixed inset-0 z-[96] overflow-y-auto px-[var(--gutter)] pb-16 pt-4"
    >
      <div className="mono flex h-8 items-center justify-between">
        <span className="text-[var(--mute)]">[ {highlights.title} ]</span>
        <button ref={closeRef} onClick={() => setOpen(false)} className="hover:opacity-60">
          [ close ]
        </button>
      </div>

      <div className="mx-auto mt-[9vh] max-w-5xl">
        <h2 className="display text-[clamp(44px,8vw,120px)]" style={{ fontStretch: "112%" }}>
          {site.name}
        </h2>
        <p className="mono mt-5 text-[var(--mute)]">
          {site.role} · {site.city} · {site.classOf}
        </p>

        <ul className="mt-14 border-t border-[var(--line-dark)]">
          {highlights.lines.map(([k, v]) => (
            <li
              key={k}
              className="grid grid-cols-1 gap-2 border-b border-[var(--line-dark)] py-6 md:grid-cols-[14rem_1fr]"
            >
              <span className="mono text-[var(--mute)]">{k}</span>
              <span className="text-[clamp(18px,1.6vw,24px)] leading-snug">{v}</span>
            </li>
          ))}
        </ul>

        <div className="mono mt-12 flex flex-wrap gap-x-8 gap-y-4">
          <a href={site.links.resume} target="_blank" rel="noreferrer" className="hover:opacity-60">
            [ resume → ]
          </a>
          <a href={`mailto:${site.email}`} className="hover:opacity-60">
            [ email ]
          </a>
          <a href={site.links.linkedin} target="_blank" rel="noreferrer" className="hover:opacity-60">
            [ linkedin ]
          </a>
          <a href={site.links.github} target="_blank" rel="noreferrer" className="hover:opacity-60">
            [ github ]
          </a>
          <button onClick={() => setOpen(false)} className="text-[var(--mute)] hover:text-[var(--paper)]">
            [ watch the full match ↓ ]
          </button>
        </div>
      </div>
    </div>
  );
}
