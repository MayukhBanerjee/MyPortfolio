"use client";

import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";

/**
 * EcoLoop: a floor plan from above. People move between zones,
 * and each zone's climate follows the people instead of a fixed schedule.
 * Illustrative simulation (labelled as such on screen).
 */

const ZONES = [
  { name: "Floor A", x: 10, y: 10, w: 185, h: 120 },
  { name: "Floor B", x: 205, y: 10, w: 185, h: 120 },
  { name: "Meeting", x: 10, y: 140, w: 120, h: 110 },
  { name: "Lab", x: 140, y: 140, w: 250, h: 110 },
];
const PEOPLE = 14;

type Person = { zone: number; x: number; y: number; tx: number; ty: number };
type Climate = { temp: number; co2: number };

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
function spot(z: number) {
  const Z = ZONES[z];
  return { x: rnd(Z.x + 14, Z.x + Z.w - 14), y: rnd(Z.y + 34, Z.y + Z.h - 12) };
}

export default function BuildingSim() {
  const wrap = useRef<HTMLDivElement>(null);
  const dots = useRef<(SVGCircleElement | null)[]>([]);
  const readouts = useRef<(SVGTextElement | null)[]>([]);
  const fills = useRef<(SVGRectElement | null)[]>([]);
  const inView = useInView(wrap);
  const reduced = useReducedMotion();
  const state = useRef<{ people: Person[]; climate: Climate[] } | null>(null);

  if (!state.current) {
    const people: Person[] = Array.from({ length: PEOPLE }, (_, i) => {
      const zone = i % 3 === 0 ? 0 : i % 3 === 1 ? 1 : 3;
      const p = spot(zone);
      return { zone, x: p.x, y: p.y, tx: p.x, ty: p.y };
    });
    state.current = { people, climate: ZONES.map(() => ({ temp: 26.5, co2: 430 })) };
  }

  useEffect(() => {
    if (!inView) return;
    const s = state.current!;
    let raf = 0;
    let last = performance.now();
    let moveTimer = 0;
    let textTimer = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      moveTimer += dt;
      textTimer += dt;

      if (moveTimer > (reduced ? 999 : 1.4)) {
        moveTimer = 0;
        const n = 1 + Math.floor(Math.random() * 3);
        for (let k = 0; k < n; k++) {
          const p = s.people[Math.floor(Math.random() * PEOPLE)];
          // people drift toward meetings in bursts, which empties floors
          p.zone = Math.random() < 0.35 ? 2 : Math.floor(Math.random() * ZONES.length);
          const t = spot(p.zone);
          p.tx = t.x;
          p.ty = t.y;
        }
      }

      const occ = ZONES.map(() => 0);
      s.people.forEach((p, i) => {
        p.x += (p.tx - p.x) * Math.min(1, dt * 1.6);
        p.y += (p.ty - p.y) * Math.min(1, dt * 1.6);
        occ[p.zone]++;
        const d = dots.current[i];
        if (d) {
          d.setAttribute("cx", p.x.toFixed(1));
          d.setAttribute("cy", p.y.toFixed(1));
        }
      });

      s.climate.forEach((c, z) => {
        const n = occ[z];
        const targetT = n > 0 ? 23.5 : 27; // comfort when occupied, setback when empty
        const targetC = 420 + n * 55;
        c.temp += (targetT - c.temp) * dt * 0.35;
        c.co2 += (targetC - c.co2) * dt * 0.5;
        const f = fills.current[z];
        if (f) f.setAttribute("opacity", n > 0 ? "0.09" : "0");
      });

      if (textTimer > 0.25) {
        textTimer = 0;
        s.climate.forEach((c, z) => {
          const r = readouts.current[z];
          if (r) r.textContent = `${occ[z]} in · ${c.temp.toFixed(1)}° · ${Math.round(c.co2)} ppm · ${occ[z] > 0 ? "ac on" : "idle"}`;
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced]);

  return (
    <div ref={wrap} className="absolute inset-0 flex flex-col p-5">
      <svg viewBox="0 0 400 260" className="w-full flex-1" aria-hidden="true">
        {ZONES.map((z, i) => (
          <g key={z.name}>
            <rect ref={(el) => void (fills.current[i] = el)} x={z.x} y={z.y} width={z.w} height={z.h} fill="#f0ede8" opacity="0" />
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="none" stroke="#f0ede8" strokeOpacity="0.45" />
            <text x={z.x + 8} y={z.y + 14} fill="#f0ede8" fontSize="8" fontFamily="var(--font-jetbrains)" letterSpacing="0.5">
              {z.name.toUpperCase()}
            </text>
            <text
              ref={(el) => void (readouts.current[i] = el)}
              x={z.x + 8}
              y={z.y + 25}
              fill="#8a8782"
              fontSize="7"
              fontFamily="var(--font-jetbrains)"
            >
              ·
            </text>
          </g>
        ))}
        {state.current.people.map((p, i) => (
          <circle key={i} ref={(el) => void (dots.current[i] = el)} cx={p.x} cy={p.y} r="3.2" fill="#f0ede8" />
        ))}
      </svg>
      <p className="mono mt-2 text-[9px] text-[var(--mute)]">[ illustrative simulation · comfort when occupied, setback when empty ]</p>
    </div>
  );
}
