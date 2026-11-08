"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/**
 * The fibre optic lamp from childhood: a spray of thin fibres rising from a hidden base,
 * dark along their length, glowing only at the tips.
 *
 * - Move the cursor through it: tips near the pointer light up, and fade slowly once it leaves.
 * - Click / tap: a ring of light ripples out from that point through the whole lamp.
 * - Colours are one rainbow laid around the lamp (by the fibre's direction), turning slowly,
 *   so neighbouring tips always agree, like the colour wheel under the real thing.
 * - Before anyone touches it, a soft beam sweeps round on its own so you can tell it's alive.
 *
 * Fibres sway a little and lean away from the cursor. Rendering is additive on black.
 */

export type LampLayout = {
  /** base position, as a share of the canvas width (0 = left edge) */
  baseX: number;
  /** how tall the spray is, as a share of the canvas height */
  reach: number;
  /** widest half-angle of the spray, in radians */
  spread: number;
  count: number;
};

const SEGMENTS = 16;
const FOV = 30;
const CAM_Z = 10;

const hsv = /* glsl */ `
  vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
    return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
  }
`;

// shared vertex logic: sway, lean away from the pointer, read this fibre's light level
const common = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;     // pointer on the z = 0 plane, world units
  uniform float uPush;       // 0..1, how present the pointer is
  uniform sampler2D uLevels; // per-fibre light level, 1 x count
  uniform float uCount;
  attribute float aId;
  attribute float aT;        // 0 at the base, 1 at the tip
  attribute float aHue;
  attribute float aPhase;
  varying float vI;
  varying float vT;
  varying float vHue;

  vec3 bend(vec3 p) {
    float t2 = aT * aT;
    p.x += sin(uTime * 0.7 + aPhase) * 0.05 * t2;
    p.z += cos(uTime * 0.55 + aPhase * 1.3) * 0.05 * t2;
    vec2 d = p.xy - uPointer;
    float f = exp(-dot(d, d) / 0.35) * uPush;
    p.xy += normalize(d + 1e-4) * f * 0.22 * t2;
    return p;
  }

  void readLevel() {
    vI = texture2D(uLevels, vec2((aId + 0.5) / uCount, 0.5)).r;
    vT = aT;
    vHue = aHue;
  }
`;

const lineVert = /* glsl */ `
  ${common}
  void main() {
    readLevel();
    gl_Position = projectionMatrix * modelViewMatrix * vec4(bend(position), 1.0);
  }
`;

const lineFrag = /* glsl */ `
  uniform float uTime;
  varying float vI;
  varying float vT;
  varying float vHue;
  ${hsv}
  void main() {
    vec3 col = hsv2rgb(vec3(fract(vHue + uTime * 0.025 + vT * 0.06), 0.72, 1.0));
    // the fibre itself is nearly invisible; light shows near the tip, and a little at the LED
    float body = 0.009 + 0.02 * smoothstep(0.12, 0.0, vT);
    float lit = vI * (0.03 + 1.1 * smoothstep(0.62, 1.0, vT));
    gl_FragColor = vec4(mix(vec3(0.8), col, 0.6) * body + col * lit, 1.0);
  }
`;

const tipVert = /* glsl */ `
  ${common}
  uniform float uPixelRatio;
  uniform float uScale;
  attribute float aSize;
  void main() {
    readLevel();
    vec4 mv = modelViewMatrix * vec4(bend(position), 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * (1.0 + 3.2 * vI) * uPixelRatio * uScale / -mv.z;
  }
`;

const tipFrag = /* glsl */ `
  uniform float uTime;
  varying float vI;
  varying float vHue;
  ${hsv}
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    float core = smoothstep(0.35, 0.0, r);
    float halo = pow(1.0 - r, 2.2);
    vec3 col = hsv2rgb(vec3(fract(vHue + uTime * 0.025 + 0.06), 0.68, 1.0));
    vec3 idle = vec3(0.86, 0.85, 0.83) * 0.3;           // a dark lamp still catches a little light
    vec3 c = idle * (core + halo * 0.25) + col * vI * (core * 4.0 + halo * 1.8);
    gl_FragColor = vec4(c, 1.0);
  }
`;

type Fibre = { tip: THREE.Vector3; phase: number; azimuth: number };

function build(layout: LampLayout, viewW: number, viewH: number) {
  const { count, reach, spread, baseX } = layout;
  const base = new THREE.Vector3((baseX - 0.5) * viewW, -viewH / 2 - 0.15, 0);
  const verts = count * SEGMENTS * 2;
  const pos = new Float32Array(verts * 3);
  const id = new Float32Array(verts);
  const tAttr = new Float32Array(verts);
  const hue = new Float32Array(verts);
  const phase = new Float32Array(verts);

  const tipPos = new Float32Array(count * 3);
  const tipId = new Float32Array(count);
  const tipT = new Float32Array(count).fill(1);
  const tipHue = new Float32Array(count);
  const tipPhase = new Float32Array(count);
  const tipSize = new Float32Array(count);
  const fibres: Fibre[] = [];

  // deterministic, so the lamp looks the same on every visit
  let seed = 1337;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const p = new THREE.Vector3();
  let v = 0;
  for (let i = 0; i < count; i++) {
    const azimuth = rnd() * Math.PI * 2;
    const theta = spread * Math.pow(rnd(), 0.75);
    const L = viewH * reach * (0.78 + 0.3 * rnd());
    const droop = 0.62 * Math.sin(theta) * L;
    const dir = new THREE.Vector3(Math.sin(theta) * Math.cos(azimuth), Math.cos(theta), Math.sin(theta) * Math.sin(azimuth) * 0.55);
    const b = base.clone().add(new THREE.Vector3((rnd() - 0.5) * 0.08, 0, (rnd() - 0.5) * 0.08));
    const ph = rnd() * Math.PI * 2;
    // hue follows the sideways direction, so the rainbow is laid out across the lamp
    const h = (azimuth / (Math.PI * 2) + 0.5 * Math.sin(theta)) % 1;

    const at = (t: number, out: THREE.Vector3) =>
      out.copy(b).addScaledVector(dir, L * t).add(new THREE.Vector3(0, -droop * t * t, 0));

    for (let s = 0; s < SEGMENTS; s++) {
      for (const t of [s / SEGMENTS, (s + 1) / SEGMENTS]) {
        at(t, p);
        pos.set([p.x, p.y, p.z], v * 3);
        id[v] = i;
        tAttr[v] = t;
        hue[v] = h;
        phase[v] = ph;
        v++;
      }
    }
    at(1, p);
    tipPos.set([p.x, p.y, p.z], i * 3);
    tipId[i] = i;
    tipHue[i] = h;
    tipPhase[i] = ph;
    tipSize[i] = 0.15 + 0.1 * rnd();
    fibres.push({ tip: p.clone(), phase: ph, azimuth });
  }

  const lines = new THREE.BufferGeometry();
  lines.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  lines.setAttribute("aId", new THREE.BufferAttribute(id, 1));
  lines.setAttribute("aT", new THREE.BufferAttribute(tAttr, 1));
  lines.setAttribute("aHue", new THREE.BufferAttribute(hue, 1));
  lines.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));

  const tips = new THREE.BufferGeometry();
  tips.setAttribute("position", new THREE.BufferAttribute(tipPos, 3));
  tips.setAttribute("aId", new THREE.BufferAttribute(tipId, 1));
  tips.setAttribute("aT", new THREE.BufferAttribute(tipT, 1));
  tips.setAttribute("aHue", new THREE.BufferAttribute(tipHue, 1));
  tips.setAttribute("aPhase", new THREE.BufferAttribute(tipPhase, 1));
  tips.setAttribute("aSize", new THREE.BufferAttribute(tipSize, 1));

  return { lines, tips, fibres };
}

type Pointer = { x: number; y: number; inside: boolean; moved: boolean };
type Ripple = { x: number; y: number; t0: number };

function Lamp({ layout, pointer, ripples, touch }: { layout: LampLayout; pointer: React.RefObject<Pointer>; ripples: React.RefObject<Ripple[]>; touch: boolean }) {
  const { size, camera, gl } = useThree();
  const viewH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const viewW = viewH * (size.width / Math.max(1, size.height));

  const { lines, tips, fibres } = useMemo(
    () => build(layout, viewW, viewH),
    // rebuild only when the shape of the screen really changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layout, Math.round(viewW * 20)]
  );
  useEffect(() => () => (lines.dispose(), tips.dispose()), [lines, tips]);

  const levels = useMemo(() => new Float32Array(layout.count), [layout.count]);
  const levelTex = useMemo(() => {
    const t = new THREE.DataTexture(levels, layout.count, 1, THREE.RedFormat, THREE.FloatType);
    t.needsUpdate = true;
    return t;
  }, [levels, layout.count]);
  useEffect(() => () => levelTex.dispose(), [levelTex]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uPush: { value: 0 },
      uLevels: { value: levelTex },
      uCount: { value: layout.count },
      uPixelRatio: { value: gl.getPixelRatio() },
      uScale: { value: size.height * 0.11 },
    }),
    [levelTex, layout.count, gl, size.height]
  );

  const shared = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending } as const;
  const lineMat = useMemo(() => new THREE.ShaderMaterial({ uniforms, vertexShader: lineVert, fragmentShader: lineFrag, ...shared }), [uniforms]); // eslint-disable-line react-hooks/exhaustive-deps
  const tipMat = useMemo(() => new THREE.ShaderMaterial({ uniforms, vertexShader: tipVert, fragmentShader: tipFrag, ...shared }), [uniforms]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => (lineMat.dispose(), tipMat.dispose()), [lineMat, tipMat]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const idle = useRef(1);
  const push = useRef(0);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    uniforms.uTime.value = time;
    const ptr = pointer.current!;
    const w = size.width;
    const h = size.height;

    // pointer on the z = 0 plane
    const wx = (ptr.x / w - 0.5) * viewW;
    const wy = (0.5 - ptr.y / h) * viewH;
    uniforms.uPointer.value.set(wx, wy);
    push.current += ((ptr.inside ? 1 : 0) - push.current) * 0.08;
    uniforms.uPush.value = push.current;

    // the self-running sweep fades once someone starts playing (phones keep a little of it)
    const idleTarget = ptr.moved ? (touch ? 0.35 : 0) : 0.55;
    idle.current += (idleTarget - idle.current) * 0.02;

    const R = Math.max(110, Math.min(w, h) * 0.2);
    const now = performance.now();
    const rip = ripples.current!;
    for (let k = rip.length - 1; k >= 0; k--) if (now - rip[k].t0 > 2400) rip.splice(k, 1);

    for (let i = 0; i < fibres.length; i++) {
      const f = fibres[i];
      // the tip, swayed exactly as the shader sways it, then projected to the screen
      tmp.copy(f.tip);
      tmp.x += Math.sin(time * 0.7 + f.phase) * 0.05;
      tmp.z += Math.cos(time * 0.55 + f.phase * 1.3) * 0.05;
      tmp.project(camera);
      const sx = (tmp.x * 0.5 + 0.5) * w;
      const sy = (0.5 - tmp.y * 0.5) * h;

      let target = 0;
      if (ptr.inside) {
        const dx = sx - ptr.x;
        const dy = sy - ptr.y;
        target = Math.exp(-(dx * dx + dy * dy) / (R * R));
      }
      // the sweep: a beam going round the lamp
      if (idle.current > 0.01) {
        const a = Math.cos(f.azimuth - time * 0.6);
        target = Math.max(target, idle.current * Math.pow(Math.max(0, a), 14));
      }
      // ripples from clicks
      for (const r of rip) {
        const age = (now - r.t0) / 1000;
        const d = Math.hypot(sx - r.x, sy - r.y);
        const front = age * Math.max(w, h) * 0.45;
        const band = Math.exp(-Math.pow((d - front) / 110, 2)) * Math.max(0, 1 - age / 2.4);
        target = Math.max(target, band);
      }

      const cur = levels[i];
      levels[i] = cur + (target - cur) * (target > cur ? 0.3 : 0.03);
    }
    levelTex.needsUpdate = true;
  });

  return (
    <>
      <lineSegments geometry={lines} material={lineMat} frustumCulled={false} />
      <points geometry={tips} material={tipMat} frustumCulled={false} />
    </>
  );
}

export default function FiberLamp({ layout, active, className }: { layout: LampLayout; active: boolean; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const pointer = useRef<Pointer>({ x: -9999, y: -9999, inside: false, moved: false });
  const ripples = useRef<Ripple[]>([]);
  const touch = useMemo(() => typeof window !== "undefined" && window.matchMedia("(hover: none)").matches, []);

  // the canvas sits under text and the photo, so it listens on the window instead of itself
  useEffect(() => {
    if (!active) return;
    const local = (e: PointerEvent) => {
      const r = wrap.current!.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      return { x, y, inside: x >= 0 && y >= 0 && x <= r.width && y <= r.height };
    };
    const move = (e: PointerEvent) => {
      const l = local(e);
      Object.assign(pointer.current, l);
      if (l.inside) pointer.current.moved = true;
    };
    const down = (e: PointerEvent) => {
      const l = local(e);
      if (!l.inside) return;
      pointer.current.moved = true;
      ripples.current.push({ x: l.x, y: l.y, t0: performance.now() });
      if (ripples.current.length > 4) ripples.current.shift();
    };
    const leave = () => (pointer.current.inside = false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [active]);

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, CAM_Z], fov: FOV }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        <Lamp layout={layout} pointer={pointer} ripples={ripples} touch={touch} />
      </Canvas>
    </div>
  );
}
