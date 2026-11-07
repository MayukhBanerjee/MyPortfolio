/**
 * A very small language model: word-level trigram with bigram and unigram back-off.
 * Trained only on the text of this website. No libraries, no API.
 */

export type Candidate = { word: string; p: number };

const SEP = "\u0001";
const END = new Set([".", "?", "!"]);

export function tokenize(text: string): string[] {
  const out: string[] = [];
  const re = /[A-Za-z0-9₂%+→\-]+(?:['’][A-Za-z]+)?|[.,:;?!]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[0].replace("’", "'"));
  return out;
}

function bump(map: Map<string, Map<string, number>>, key: string, next: string) {
  let inner = map.get(key);
  if (!inner) map.set(key, (inner = new Map()));
  inner.set(next, (inner.get(next) ?? 0) + 1);
}

export class TrigramModel {
  private tri = new Map<string, Map<string, number>>();
  private bi = new Map<string, Map<string, number>>();
  private uni = new Map<string, number>();
  readonly vocab: number;
  readonly tokens: number;

  constructor(text: string) {
    const toks = tokenize(text);
    this.tokens = toks.length;
    for (let i = 0; i < toks.length; i++) {
      const w = toks[i];
      this.uni.set(w, (this.uni.get(w) ?? 0) + 1);
      if (i >= 1) bump(this.bi, toks[i - 1], w);
      if (i >= 2) bump(this.tri, toks[i - 2] + SEP + toks[i - 1], w);
    }
    this.vocab = this.uni.size;
  }

  has(word: string): boolean {
    return this.uni.has(word);
  }

  /** Full next-word distribution for the context, using the longest context we've seen. */
  distribution(context: string[]): { order: 3 | 2 | 1; dist: Candidate[] } {
    const a = context[context.length - 2];
    const b = context[context.length - 1];
    let order: 3 | 2 | 1 = 1;
    let counts: Map<string, number> | undefined;
    if (a !== undefined && b !== undefined) counts = this.tri.get(a + SEP + b);
    if (counts) order = 3;
    if (!counts && b !== undefined) {
      counts = this.bi.get(b);
      if (counts) order = 2;
    }
    if (!counts) counts = this.uni;
    let total = 0;
    counts.forEach((c) => (total += c));
    const dist: Candidate[] = [];
    counts.forEach((c, word) => dist.push({ word, p: c / total }));
    dist.sort((x, y) => y.p - x.p);
    return { order, dist };
  }

  /** Weighted draw with temperature. rng returns [0, 1). */
  sample(dist: Candidate[], temperature: number, rng: () => number): string {
    const weights = dist.map((d) => Math.pow(d.p, 1 / Math.max(0.05, temperature)));
    const sum = weights.reduce((s, w) => s + w, 0);
    let r = rng() * sum;
    for (let i = 0; i < dist.length; i++) {
      r -= weights[i];
      if (r <= 0) return dist[i].word;
    }
    return dist[0].word;
  }

  static isEnd(word: string): boolean {
    return END.has(word);
  }
}

/** Deterministic RNG so the first demo run is always the same, good one. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function detokenize(words: string[]): string {
  return words.reduce((s, w, i) => (i === 0 ? w : /^[.,:;?!]$/.test(w) ? s + w : s + " " + w), "");
}
