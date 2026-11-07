/**
 * Shared layout for the Moxsend pipeline diagram (world units; the canvas is 10 units wide).
 * Kept free of three.js so the DOM labels can import it without pulling WebGL into the main bundle.
 */
export const WORLD_W = 10;
export const MAIN_Y = 0.55;
export const CACHE_Y = -0.45;
export const RETRY_Y = -1.35;
export const LLM_X0 = 0.4;
export const LLM_X1 = 2.0;

/** Top-left anchored labels, positioned in world units. */
export const LABELS: { x: number; y: number; text: string }[] = [
  { x: -4.8, y: MAIN_Y + 0.62, text: "leads" },
  { x: -3.3, y: MAIN_Y + 0.62, text: "batch" },
  { x: -1.5, y: MAIN_Y + 0.62, text: "cache?" },
  { x: LLM_X0, y: MAIN_Y + 0.62, text: "model call" },
  { x: -0.9, y: CACHE_Y - 0.16, text: "cache hit · skips the model" },
  { x: -0.2, y: RETRY_Y - 0.16, text: "failed · retry lane" },
  { x: 3.9, y: MAIN_Y + 0.62, text: "sent" },
];
