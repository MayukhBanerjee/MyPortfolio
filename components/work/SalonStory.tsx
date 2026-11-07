"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

/** Scheduler AI: the Sunday salon in three line drawings, then the booking as it really flows. */

const CHAT: { who: "you" | "ai" | "owner" | "sys"; text: string }[] = [
  { who: "you", text: "haircut today, somewhere near me?" },
  { who: "ai", text: "Two places have a free slot. The nearest one has 2:15." },
  { who: "owner", text: "New booking, 2:15. Accept? When are you free after?" },
  { who: "owner", text: "Yes. Free by 3:15." },
  { who: "sys", text: "3:15 updated everywhere · buffer added" },
];

const crowd = Array.from({ length: 9 }, (_, i) => ({ x: 22 + (i % 5) * 13, y: 58 + Math.floor(i / 5) * 14 }));

export default function SalonStory() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 2.2,
          scrollTrigger: { trigger: ref.current, start: "top 75%", toggleActions: "play pause resume pause" },
        });
        tl.set(".ss-frame, .ss-msg", { opacity: 0 })
          .set(".ss-leaver", { x: 0 })
          .to(".ss-frame-0", { opacity: 1, duration: 0.01 })
          .from(".ss-crowd", { scale: 0, transformOrigin: "50% 50%", stagger: 0.04, duration: 0.2, ease: "back.out(3)" })
          .to(".ss-frame-1", { opacity: 1, duration: 0.01 }, "+=0.5")
          .to(".ss-leaver", { x: 46, duration: 0.9, ease: "power2.in" })
          .to(".ss-frame-2", { opacity: 1, duration: 0.01 }, "+=0.2")
          .fromTo(".ss-busy", { rotation: -12 }, { rotation: 12, svgOrigin: "60 64", duration: 0.12, repeat: 7, yoyo: true, ease: "none" })
          .to(".ss-msg", { opacity: 1, duration: 0.01, stagger: 0.9 }, "+=0.4");
      });
      mm.add(MQ.reduced, () => gsap.set(".ss-frame, .ss-msg", { opacity: 1 }));
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="absolute inset-0 flex flex-col p-5 text-[var(--paper)]">
      <div className="grid grid-cols-3 gap-3">
        {["packed", "you leave", "he never noticed"].map((cap, i) => (
          <figure key={cap} className={`ss-frame ss-frame-${i} border border-[var(--line-dark)]`}>
            <svg viewBox="0 0 100 100" className="block aspect-square w-full" fill="none" stroke="currentColor" strokeWidth="1.2">
              {/* chair */}
              <path d="M14 40 h22 v-12 M14 40 v14 M36 40 v14" opacity="0.7" />
              {i === 0 && crowd.map((c, k) => <circle key={k} className="ss-crowd" cx={c.x} cy={c.y} r="4.5" />)}
              {i === 1 && (
                <>
                  <rect x="76" y="34" width="16" height="40" opacity="0.7" />
                  <circle className="ss-leaver" cx="40" cy="62" r="5" />
                </>
              )}
              {i === 2 && (
                <>
                  <circle cx="60" cy="52" r="6" />
                  <path d="M60 58 v16 M52 66 h16" />
                  <g className="ss-busy">
                    <path d="M70 60 l10 -8 M70 60 l10 4" />
                  </g>
                  <circle cx="25" cy="30" r="4.5" opacity="0.35" strokeDasharray="2 2" />
                </>
              )}
            </svg>
            <figcaption className="mono border-t border-[var(--line-dark)] px-2 py-1 text-[9px] text-[var(--mute)]">{cap}</figcaption>
          </figure>
        ))}
      </div>

      <ul className="mt-auto space-y-2 pt-4">
        {CHAT.map((m, i) => (
          <li
            key={i}
            className={`ss-msg mono flex text-[10px] normal-case tracking-normal ${m.who === "you" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[80%] px-3 py-2 ${
                m.who === "you"
                  ? "bg-[var(--paper)] text-[var(--black)]"
                  : m.who === "sys"
                    ? "text-[var(--mute)]"
                    : "border border-[var(--line-dark)]"
              }`}
            >
              {m.who === "owner" && <span className="text-[var(--mute)]">owner · </span>}
              {m.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
