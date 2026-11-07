"use client";

import { useRef } from "react";
import { gsap, MQ, useGSAP } from "@/lib/gsap";

/**
 * Scheduler AI: the booking as it actually flows, between a customer, the assistant and the owner,
 * with the owner's afternoon filling in beside it. The text says what it is; this shows it working.
 */

const CHAT: { who: "you" | "ai" | "owner" | "sys"; text: string }[] = [
  { who: "you", text: "haircut today, somewhere near me?" },
  { who: "ai", text: "Two places have a free slot. The closest has 2:15." },
  { who: "owner", text: "New booking for 2:15. Accept? When will you be free?" },
  { who: "owner", text: "Accepted. Free by 3:15." },
  { who: "sys", text: "3:15 is now free everywhere in the app, with a buffer." },
];

// the owner's afternoon, 2:00 to 4:00, in quarter hours
const HOURS = ["2:00", "2:30", "3:00", "3:30", "4:00"];

export default function SalonStory() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          repeat: -1,
          repeatDelay: 2.4,
          scrollTrigger: { trigger: ref.current, start: "top 75%", toggleActions: "play pause resume pause" },
        });
        tl.set(".ss-msg", { opacity: 0, y: 8 })
          .set(".ss-booked, .ss-buffer", { scaleX: 0 })
          .set(".ss-free", { opacity: 0 })
          .to(".ss-msg-0", { opacity: 1, y: 0, duration: 0.35 }, 0.3)
          .to(".ss-msg-1", { opacity: 1, y: 0, duration: 0.35 }, 1.4)
          .to(".ss-msg-2", { opacity: 1, y: 0, duration: 0.35 }, 2.6)
          .to(".ss-booked", { scaleX: 1, duration: 0.7, ease: "power2.out", transformOrigin: "0% 50%" }, 3.2)
          .to(".ss-msg-3", { opacity: 1, y: 0, duration: 0.35 }, 4.2)
          .to(".ss-buffer", { scaleX: 1, duration: 0.4, ease: "power2.out", transformOrigin: "0% 50%" }, 4.5)
          .to(".ss-free", { opacity: 1, duration: 0.4 }, 4.9)
          .to(".ss-msg-4", { opacity: 1, y: 0, duration: 0.35 }, 5.3);
      });
      mm.add(MQ.reduced, () => {
        gsap.set(".ss-msg, .ss-free", { opacity: 1 });
        gsap.set(".ss-booked, .ss-buffer", { scaleX: 1 });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );

  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-between p-5 text-[var(--paper)]">
      {/* the owner's afternoon */}
      <div>
        <p className="mono mb-3 text-[9px] text-[var(--mute)]">[ owner&apos;s afternoon ]</p>
        <div className="relative h-9 border border-[var(--line-dark)]">
          {/* 2:15 to 3:15 booked; a short buffer after it; free from there on */}
          <span className="ss-booked absolute inset-y-0 left-[12.5%] w-[50%] bg-[var(--paper)]" />
          <span
            className="ss-buffer absolute inset-y-0 left-[62.5%] w-[6%]"
            style={{ background: "repeating-linear-gradient(135deg, var(--mute) 0 2px, transparent 2px 5px)" }}
          />
          <span className="ss-free mono absolute inset-y-0 left-[70%] flex items-center text-[9px] text-[var(--paper)]">
            free →
          </span>
        </div>
        <div className="mono mt-1 flex justify-between text-[9px] text-[var(--mute)]">
          {HOURS.map((h) => (
            <span key={h}>{h}</span>
          ))}
        </div>
      </div>

      <ul className="space-y-2">
        {CHAT.map((m, i) => (
          <li
            key={i}
            className={`ss-msg ss-msg-${i} mono flex text-[10px] normal-case tracking-normal ${m.who === "you" ? "justify-end" : "justify-start"}`}
          >
            <span
              className={`max-w-[82%] px-3 py-2 ${
                m.who === "you"
                  ? "bg-[var(--paper)] text-[var(--black)]"
                  : m.who === "sys"
                    ? "text-[var(--mute)]"
                    : "border border-[var(--line-dark)]"
              }`}
            >
              {m.who === "owner" && <span className="text-[var(--mute)]">owner · </span>}
              {m.who === "ai" && <span className="text-[var(--mute)]">assistant · </span>}
              {m.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
