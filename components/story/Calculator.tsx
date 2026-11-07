"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { useInView, useReducedMotion } from "@/lib/hooks";

/**
 * The calculator everyone writes in class 10. This one works properly:
 * tap the keys or type on the keyboard (digits, + - * / . % Enter = Backspace Escape).
 * It types 2 + 2 = by itself the first time it's seen.
 */

const KEYS = [
  "C", "⌫", "%", "÷",
  "7", "8", "9", "×",
  "4", "5", "6", "−",
  "1", "2", "3", "+",
  "0", ".", "=",
];
const OPS = new Set(["+", "−", "×", "÷"]);
const NAMES: Record<string, string> = { C: "clear", "⌫": "backspace", "%": "percent", "÷": "divide", "×": "multiply", "−": "subtract", "+": "add", "=": "equals", ".": "point" };

type State = { expr: string; result: string; error: string };
const empty: State = { expr: "", result: "", error: "" };

const fmt = (n: number) => String(Number(n.toPrecision(12)));

/** Evaluate with the usual precedence. Returns a number or an error message. */
function evaluate(expr: string): number | string {
  const tokens = expr.match(/\d*\.?\d+|\d+\.|[+−×÷]/g);
  if (!tokens) return "";
  // a leading minus belongs to the first number
  if (tokens[0] === "−" && tokens.length > 1) {
    tokens.shift();
    tokens[0] = "-" + tokens[0];
  }
  if (OPS.has(tokens[tokens.length - 1])) tokens.pop();
  if (!tokens.length) return "";
  const stack: (number | string)[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "×" || t === "÷") {
      const a = stack.pop() as number;
      const b = parseFloat(tokens[++i]);
      if (t === "÷" && b === 0) return "Cannot divide by zero";
      stack.push(t === "×" ? a * b : a / b);
    } else stack.push(OPS.has(t) ? t : parseFloat(t));
  }
  let acc = stack[0] as number;
  for (let i = 1; i < stack.length; i += 2) {
    const n = stack[i + 1] as number;
    acc = stack[i] === "+" ? acc + n : acc - n;
  }
  return Number.isFinite(acc) ? acc : "Error";
}

const lastNumber = (e: string) => e.split(/[+−×÷]/).pop() ?? "";

function reducer(st: State, k: string): State {
  if (k === "C") return empty;
  if (st.error) return k >= "0" && k <= "9" ? { ...empty, expr: k } : empty;

  if (k === "⌫") {
    if (st.result) return empty;
    return { ...st, expr: st.expr.slice(0, -1) };
  }
  if (k === "=") {
    if (!st.expr || st.result) return st;
    const r = evaluate(st.expr);
    return typeof r === "string" ? (r ? { ...st, error: r } : st) : { ...st, result: fmt(r) };
  }
  if (k === "%") {
    const base = st.result || lastNumber(st.expr);
    if (!base || OPS.has(base)) return st;
    const v = fmt(parseFloat(base) / 100);
    if (st.result) return { expr: "", result: v, error: "" };
    return { ...st, expr: st.expr.slice(0, st.expr.length - base.length) + v };
  }

  // an answer is on screen: an operator carries on from it, anything else starts over
  if (st.result) {
    if (OPS.has(k)) return { expr: st.result + k, result: "", error: "" };
    return { expr: k === "." ? "0." : k, result: "", error: "" };
  }

  if (OPS.has(k)) {
    if (st.expr === "") return k === "−" ? { ...st, expr: "−" } : st;
    const end = st.expr[st.expr.length - 1];
    if (OPS.has(end)) return { ...st, expr: st.expr.slice(0, -1) + k }; // change your mind: replace it
    return { ...st, expr: st.expr + k };
  }
  if (k === ".") {
    const n = lastNumber(st.expr);
    if (n.includes(".")) return st;
    return { ...st, expr: st.expr + (n === "" ? "0." : ".") };
  }
  if (st.expr.length >= 22) return st;
  const n = lastNumber(st.expr);
  if (n === "0") return { ...st, expr: st.expr.slice(0, -1) + k }; // no leading zeros
  return { ...st, expr: st.expr + k };
}

const fromKeyboard = (e: KeyboardEvent): string | null => {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const k = e.key;
  if (/^[0-9]$/.test(k)) return k;
  switch (k) {
    case "+": return "+";
    case "-": return "−";
    case "*": case "x": case "X": return "×";
    case "/": return "÷";
    case ".": case ",": return ".";
    case "%": return "%";
    case "Enter": case "=": return "=";
    case "Backspace": return "⌫";
    case "Escape": case "c": case "C": return "C";
    default: return null;
  }
};

export default function Calculator({ caption }: { caption: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, "-20% 0px");
  const reduced = useReducedMotion();
  const [{ expr, result, error }, dispatch] = useReducer(reducer, empty);
  const [pressed, setPressed] = useState<string | null>(null);
  const demoed = useRef(false);
  const active = useRef(false); // pointer over it, or focus inside it
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const press = (k: string) => {
    dispatch(k);
    setPressed(k);
    timers.current.push(setTimeout(() => setPressed(null), 140));
  };

  // type on the keyboard while the pointer is over the calculator or it has focus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!active.current) return;
      const k = fromKeyboard(e);
      if (!k) return;
      e.preventDefault();
      e.stopPropagation();
      press(k);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  // the first time it's seen, it types 2 + 2 = on its own
  useEffect(() => {
    if (!inView || demoed.current) return;
    demoed.current = true;
    const seq = ["2", "+", "2", "="];
    if (reduced) {
      seq.forEach((k) => dispatch(k));
      return;
    }
    seq.forEach((k, i) => timers.current.push(setTimeout(() => press(k), 500 + i * 420)));
  }, [inView, reduced]);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const main = error || result || (expr ? lastNumber(expr) || "0" : "0");

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label="Calculator. Tap the keys, or type on your keyboard."
      onPointerEnter={() => (active.current = true)}
      onPointerLeave={() => (active.current = document.activeElement === ref.current)}
      onFocus={() => (active.current = true)}
      onBlur={() => (active.current = false)}
      className="w-full max-w-[22rem] outline-none focus-visible:ring-1 focus-visible:ring-[var(--paper)]/50"
    >
      <div className="border border-[var(--line-dark)] bg-[#0d0d0d] p-4">
        <div
          className="mb-4 flex h-24 flex-col items-end justify-end overflow-hidden border border-[var(--line-dark)] px-4 py-3"
          aria-live="polite"
        >
          <span className="mono min-h-[1.2em] max-w-full truncate text-[12px] normal-case tracking-normal text-[var(--mute)]">
            {expr || " "}
          </span>
          <span
            className="display max-w-full truncate leading-none"
            style={{ fontWeight: 700, fontStretch: "90%", fontSize: main.length > 9 ? 28 : 44 }}
          >
            {main}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              aria-label={NAMES[k] ?? k}
              className={`mono h-12 border text-[15px] transition-colors ${k === "0" ? "col-span-2" : ""} ${
                pressed === k
                  ? "border-[var(--paper)] bg-[var(--paper)] text-[var(--black)]"
                  : k === "="
                    ? "border-[var(--paper)] bg-[var(--paper)] text-[var(--black)] hover:opacity-80"
                    : OPS.has(k)
                      ? "border-[var(--paper)]/45 text-[var(--paper)] hover:border-[var(--paper)]"
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
