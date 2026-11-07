"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/data/portfolio";
import { useSite } from "@/components/Providers";

export default function Nav() {
  const { phase, lenis, setHighlightsOpen } = useSite();
  const [dim, setDim] = useState(false);
  const [open, setOpen] = useState(false);
  const last = useRef(0);

  useEffect(() => {
    if (!lenis) return;
    const onScroll = ({ scroll }: { scroll: number }) => {
      setDim(scroll > 80 && scroll > last.current);
      last.current = scroll;
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    lenis?.start();
    lenis?.scrollTo(href, { duration: 1.4 });
  };

  const visible = phase === "done";

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-[85] flex h-12 items-center justify-between px-[var(--gutter)] text-[var(--paper)] mix-blend-difference transition-opacity duration-500 hover:!opacity-100 ${
          visible ? (dim ? "opacity-60" : "opacity-100") : "pointer-events-none opacity-0"
        }`}
      >
        <a
          href="#top"
          onClick={go("#top")}
          className="display text-[20px] tracking-tight"
          aria-label={`${site.name}, back to top`}
        >
          {site.monogram}
        </a>
        <nav className="mono hidden items-center gap-6 md:flex" aria-label="Sections">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={go(n.href)} className="transition-opacity hover:opacity-60">
              [ {n.label} ]
            </a>
          ))}
          <button onClick={() => setHighlightsOpen(true)} className="mono transition-opacity hover:opacity-60">
            [ 30 sec ]
          </button>
        </nav>
        <div className="mono flex items-center gap-5 md:hidden">
          <button onClick={() => setHighlightsOpen(true)}>[ 30 sec ]</button>
          <button onClick={() => setOpen(true)} aria-expanded={open}>
            Menu
          </button>
        </div>
      </header>

      {open && (
        <div
          className="on-black fixed inset-0 z-[95] flex flex-col px-[var(--gutter)] pt-4 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <div className="mono flex h-8 items-center justify-between">
            <span>{site.monogram}</span>
            <button onClick={() => setOpen(false)} autoFocus>
              [ close ]
            </button>
          </div>
          <nav className="mt-14 flex flex-col">
            {nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={go(n.href)}
                className="display border-b border-[var(--line-dark)] py-5 text-[13vw]"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
