"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { corpus, method } from "@/data/portfolio";
import { detokenize, mulberry32, TrigramModel, type Candidate } from "@/lib/lm/trigram";
import { useInView, useReducedMotion } from "@/lib/hooks";

const MAX_WORDS = 22;
const MIN_WORDS = 9; // keep going past an early full stop so short seeds still make something
const STEP_MS = 620;

type Step = { context: string[]; order: number; top: Candidate[]; chosen: string };

/** The interactive: pick a word, watch a trigram model trained on this page pick the next ones. */
export default function TinyLM() {
  const model = useMemo(() => new TrigramModel(corpus()), []);
  const seeds = useMemo(() => method.lm.seeds.filter((s) => model.has(s)), [model]);

  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boxRef, "-15% 0px");
  const reduced = useReducedMotion();

  const [words, setWords] = useState<string[]>([]);
  const [step, setStep] = useState<Step | null>(null);
  const [running, setRunning] = useState(false);
  const [temp, setTemp] = useState(0.8);
  const runId = useRef(0);
  const rngRef = useRef(mulberry32(7));
  const autoStarted = useRef(false);

  const run = useCallback(
    (seed: string, fresh = false) => {
      const id = ++runId.current;
      if (fresh) rngRef.current = mulberry32(Math.floor(Math.random() * 1e9));
      const out = [seed];
      setWords([seed]);
      setStep(null);
      setRunning(true);

      const tick = () => {
        if (id !== runId.current) return;
        const { order, dist } = model.distribution(out);
        const chosen = model.sample(dist, temp, rngRef.current);
        setStep({ context: out.slice(-2), order, top: dist.slice(0, 5), chosen });
        out.push(chosen);
        setWords([...out]);
        if ((TrigramModel.isEnd(chosen) && out.length >= MIN_WORDS) || out.length >= MAX_WORDS) {
          setRunning(false);
          return;
        }
        setTimeout(tick, reduced ? 0 : STEP_MS);
      };
      setTimeout(tick, reduced ? 0 : 350);
    },
    [model, temp, reduced]
  );

  // first run starts by itself the first time it's seen, always with the same seed
  useEffect(() => {
    if (inView && !autoStarted.current) {
      autoStarted.current = true;
      run(seeds[0] ?? "I");
    }
  }, [inView, run, seeds]);

  useEffect(() => () => void runId.current++, []);

  const topMax = step?.top[0]?.p ?? 1;

  return (
    <div ref={boxRef} className="border-t border-[var(--black)] pt-6">
      <div className="mono flex flex-wrap items-center justify-between gap-4">
        <span>[ {method.lm.caption} ]</span>
        <span className="text-[var(--mute-dark)]">
          {model.vocab} words known · {model.tokens} tokens seen
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h3 className="display text-[clamp(28px,2.8vw,44px)] leading-[0.95]" style={{ fontWeight: 800 }}>
            {method.lm.title}
          </h3>
          <p className="body-copy mt-5 text-[var(--black)]/80">{method.lm.intro}</p>

          <div className="mt-8">
            <p className="mono mb-3 text-[var(--mute-dark)]">start with</p>
            <div className="flex flex-wrap gap-2">
              {seeds.map((s) => (
                <button
                  key={s}
                  onClick={() => run(s, true)}
                  className="mono border border-[var(--black)] px-3 py-2 transition-colors hover:bg-[var(--black)] hover:text-[var(--paper)]"
                >
                  {s}
                </button>
              ))}
            </div>
            <label className="mono mt-6 flex items-center gap-4 text-[var(--mute-dark)]">
              <span>temperature {temp.toFixed(1)}</span>
              <input
                type="range"
                min={0.2}
                max={1.6}
                step={0.1}
                value={temp}
                onChange={(e) => setTemp(parseFloat(e.target.value))}
                className="w-40 accent-black"
                aria-label="Sampling temperature"
              />
            </label>
          </div>
        </div>

        <div className="lg:col-span-7">
          <p
            className="min-h-[3.6em] text-[clamp(24px,2.6vw,40px)] leading-[1.2]"
            aria-live="polite"
            style={{ fontWeight: 500 }}
          >
            {detokenize(words)}
            {running && <span className="ml-1 inline-block h-[0.9em] w-[0.08em] translate-y-[0.1em] animate-pulse bg-[var(--black)]" />}
          </p>

          <div className="mt-8 border-t border-[var(--line-light)] pt-5">
            <div className="mono mb-4 flex justify-between text-[var(--mute-dark)]">
              <span>
                {step
                  ? `after "${step.context.join(" ")}" · ${step.order === 3 ? "trigram" : step.order === 2 ? "bigram, backed off" : "unigram, backed off"}`
                  : "waiting for a word"}
              </span>
              <span>p(next)</span>
            </div>
            <ul className="space-y-2">
              {(step?.top ?? Array.from({ length: 5 }, () => null)).map((c, i) => {
                const chosen = c && step && c.word === step.chosen;
                return (
                  <li key={i} className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3">
                    <span className={`mono truncate normal-case ${chosen ? "font-bold" : ""}`}>{c ? c.word : "·"}</span>
                    <span className="relative h-[10px] bg-[var(--line-light)]">
                      <span
                        className="absolute inset-y-0 left-0 block bg-[var(--black)] transition-[width] duration-300 ease-out"
                        style={{ width: c ? `${(c.p / topMax) * 100}%` : "0%", opacity: chosen ? 1 : 0.35 }}
                      />
                    </span>
                    <span className="mono text-right">{c ? `${Math.round(c.p * 100)}%` : ""}</span>
                  </li>
                );
              })}
            </ul>
            {step && !step.top.some((c) => c.word === step.chosen) && (
              <p className="mono mt-3 text-[var(--mute-dark)]">picked &quot;{step.chosen}&quot;, outside the top 5</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
