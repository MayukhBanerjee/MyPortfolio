"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";

/**
 * The calculator everyone writes in class 10. This one works.
 * Types 2 + 2 = by itself the first time it's seen, then it's yours.
 */

const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "C", "0", "=", "+"];
const OPS = new Set(["+", "−", "×", "÷"]);

function evaluate(expr: string): string {
  // tokens: numbers and operators, × ÷ before + −
  const tokens = expr.match(/\d+(\.\d+)?|[+−×÷]/g);
  if (!tokens || OPS.has(tokens[tokens.length - 1])) return "";
  const pass1: (number | string)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "×" || t === "÷") {
      const a = pass1.pop() as number;
      const b = parseFloat(tokens[++i]);
      if (t === "÷" && b === 0) return "nice try";
      pass1.push(t === "×" ? a * b : a / b);
    } else pass1.push(OPS.has(t) ? t : parseFloat(t));
  }
  let acc = pass1[0] as number;
  for (let i = 1; i < pass1.length; i += 2) {
    const op = pass1[i];
    const n = pass1[i + 1] as number;
    acc = op === "+" ? acc + n : acc - n;
  }
  const r = Math.round(acc * 1e8) / 1e8;
  return Number.isFinite(r) ? String(r) : "error";
}

type State = { expr: string; result: string };

function reducer(st: State, k: string): State {
  if (k === "C") return { expr: "", result: "" };
  if (k === "=") return { ...st, result: evaluate(st.expr) };
  if (st.result) {
    // keep going from the last answer if an operator is pressed, otherwise start fresh
    return { expr: OPS.has(k) && /^\d/.test(st.result) ? st.result + k : k, result: "" };
  }
  if (OPS.has(k) && (st.expr === "" || OPS.has(st.expr[st.expr.length - 1]))) return st;
  return { ...st, expr: (st.expr + k).slice(0, 18) };
}

export default function Calculator({ caption }: { caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, "-20% 0px");
  const reduced = useReducedMotion();
  const [{ expr, result }, dispatch] = useReducer(reducer, { expr: "", result: "" });
  const [pressed, setPressed] = useState<string | null>(null);
  const demoed = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const press = (k: string) => {
    dispatch(k);
    setPressed(k);
    timers.current.push(setTimeout(() => setPressed(null), 140));
  };

  // the first time it's seen, it types 2 + 2 = on its own
  useEffect(() => {
    if (!inView || demoed.current) return;
    demoed.current = true;
    if (reduced) {
      ["2", "+", "2", "="].forEach((k) => dispatch(k));
      return;
    }
    ["2", "+", "2", "="].forEach((k, i) => timers.current.push(setTimeout(() => press(k), 500 + i * 420)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div ref={ref} className="w-full max-w-[22rem]">
      <div className="border border-[var(--line-dark)] bg-[#0d0d0d] p-4">
        <div className="mb-4 flex h-24 flex-col items-end justify-end border border-[var(--line-dark)] px-4 py-3" aria-live="polite">
          <span className="mono min-h-[1.2em] text-[12px] normal-case tracking-normal text-[var(--mute)]">
            {expr || " "}
          </span>
          <span className="display text-[44px] leading-none" style={{ fontWeight: 700, fontStretch: "90%" }}>
            {result || (expr ? expr.split(/[+−×÷]/).pop() || "0" : "0")}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              onClick={() => press(k)}
              aria-label={k === "C" ? "clear" : k}
              className={`mono h-12 border text-[15px] transition-colors ${
                pressed === k
                  ? "border-[var(--paper)] bg-[var(--paper)] text-[var(--black)]"
                  : k === "="
                    ? "border-[var(--paper)] text-[var(--paper)] hover:bg-[var(--paper)] hover:text-[var(--black)]"
                    : "border-[var(--line-dark)] text-[var(--paper)] hover:border-[var(--paper)]/60"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
      <p className="mono mt-3 text-[10px] text-[var(--mute)]">[ {caption} ]</p>
    </div>
  );
}
