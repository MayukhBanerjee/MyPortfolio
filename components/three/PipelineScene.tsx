"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrthographicCamera } from "@react-three/drei";
import { CACHE_Y, LLM_X0, LLM_X1, MAIN_Y, RETRY_Y, WORLD_W } from "./pipeline-layout";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * Moxsend's failure-first pipeline as a live diagram.
 * Emails leave in batches. Cache hits skip the model. Failures drop to a retry lane and come back.
 * Monochrome on purpose: it should read as a diagram, not a starfield.
 */

const COUNT = 900;
const BATCH = 30;
const SPEED = 1.15; // world units / second

type Kind = 0 | 1 | 2; // 0 = through the model, 1 = cache hit, 2 = fails once, retries


function path(kind: Kind): THREE.Vector2[] {
  const P = (x: number, y: number) => new THREE.Vector2(x, y);
  if (kind === 1)
    return [P(-4.8, MAIN_Y), P(-1.4, MAIN_Y), P(-0.9, CACHE_Y), P(2.5, CACHE_Y), P(3.0, MAIN_Y), P(4.8, MAIN_Y)];
  if (kind === 2)
    return [
      P(-4.8, MAIN_Y),
      P(LLM_X1 + 0.25, MAIN_Y),
      P(LLM_X1 + 0.6, RETRY_Y),
      P(-0.6, RETRY_Y),
      P(-0.2, MAIN_Y),
      P(4.8, MAIN_Y),
    ];
  return [P(-4.8, MAIN_Y), P(4.8, MAIN_Y)];
}

class Poly {
  pts: THREE.Vector2[];
  cum: number[] = [0];
  length: number;
  constructor(pts: THREE.Vector2[]) {
    this.pts = pts;
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    this.length = this.cum[this.cum.length - 1];
  }
  at(d: number, out: THREE.Vector2) {
    d = Math.max(0, Math.min(this.length, d));
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < d) i++;
    const t = (d - this.cum[i - 1]) / (this.cum[i] - this.cum[i - 1] || 1);
    return out.copy(this.pts[i - 1]).lerp(this.pts[i], t);
  }
}

function Flow({ counterRef }: { counterRef: RefObject<HTMLElement | null> }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const polys = useMemo(() => [new Poly(path(0)), new Poly(path(1)), new Poly(path(2))], []);
  const data = useMemo(() => {
    const kinds = new Uint8Array(COUNT);
    const offset = new Float32Array(COUNT);
    const jitter = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const r = Math.random();
      kinds[i] = r < 0.25 ? 1 : r < 0.3 ? 2 : 0;
      const batch = Math.floor(i / BATCH);
      offset[i] = batch * 0.9 + (i % BATCH) * 0.03; // batches leave together, slightly staggered
      jitter[i] = (Math.random() - 0.5) * 0.22;
    }
    return { kinds, offset, jitter };
  }, []);
  const cycle = (COUNT / BATCH) * 0.9;
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const v = useMemo(() => new THREE.Vector2(), []);
  const lastSent = useRef(0);

  useFrame(({ clock }) => {
    const m = mesh.current;
    if (!m) return;
    const time = clock.getElapsedTime() + 14; // start mid-campaign, never on an empty diagram
    let sent = 0;
    for (let i = 0; i < COUNT; i++) {
      const kind = data.kinds[i] as Kind;
      const poly = polys[kind];
      const local = (((time - data.offset[i]) % cycle) + cycle) % cycle;
      const d = local * SPEED;
      if (time < data.offset[i]) {
        tmp.scale.setScalar(0);
      } else if (d > poly.length) {
        tmp.scale.setScalar(0);
        sent++;
      } else {
        poly.at(d, v);
        const inLLM = v.x > LLM_X0 && v.x < LLM_X1 && Math.abs(v.y - MAIN_Y) < 0.05;
        tmp.position.set(v.x, v.y + data.jitter[i] * (inLLM ? 0.4 : 1), 0);
        tmp.scale.setScalar(kind === 1 ? 0.75 : 1);
      }
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
    const s = Math.floor(time / cycle) * COUNT + sent;
    if (s !== lastSent.current && counterRef.current) {
      lastSent.current = s;
      counterRef.current.textContent = Math.min(s, 100000).toLocaleString("en-IN");
    }
  });

  const colors = useMemo(() => {
    const c = new Float32Array(COUNT * 3);
    const white = new THREE.Color("#f0ede8");
    const grey = new THREE.Color("#8a8782");
    for (let i = 0; i < COUNT; i++) (data.kinds[i] === 1 ? grey : white).toArray(c, i * 3);
    return c;
  }, [data]);

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <planeGeometry args={[0.055, 0.055]}>
        <instancedBufferAttribute attach="attributes-color" args={[colors, 3]} />
      </planeGeometry>
      <meshBasicMaterial vertexColors toneMapped={false} />
    </instancedMesh>
  );
}

function Rect({ x0, x1, y0, y1, opacity = 0.6 }: { x0: number; x1: number; y0: number; y1: number; opacity?: number }) {
  return (
    <Line
      points={[
        [x0, y0, 0],
        [x1, y0, 0],
        [x1, y1, 0],
        [x0, y1, 0],
        [x0, y0, 0],
      ]}
      color="#f0ede8"
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
}

function Guide({ pts, opacity = 0.18 }: { pts: [number, number][]; opacity?: number }) {
  return (
    <Line
      points={pts.map(([x, y]) => [x, y, -0.01] as [number, number, number])}
      color="#f0ede8"
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
}

function Camera() {
  const { size } = useThree();
  return <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={size.width / WORLD_W} />;
}

export default function PipelineScene({ active, counterRef }: { active: boolean; counterRef: RefObject<HTMLElement | null> }) {
  const guides = useMemo(
    () => ({
      cache: [path(1).map((p) => [p.x, p.y] as [number, number])],
      retry: [path(2).slice(1, 5).map((p) => [p.x, p.y] as [number, number])],
    }),
    []
  );

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Camera />
      <Flow counterRef={counterRef} />
      <Guide pts={[[-4.8, MAIN_Y], [4.8, MAIN_Y]]} />
      <Guide pts={guides.cache[0]} />
      <Guide pts={guides.retry[0]} />
      <Guide pts={[[-3.2, MAIN_Y - 0.3], [-3.2, MAIN_Y + 0.3]]} opacity={0.5} />
      <Guide pts={[[-1.4, MAIN_Y - 0.3], [-1.4, MAIN_Y + 0.3]]} opacity={0.5} />
      <Rect x0={LLM_X0} x1={LLM_X1} y0={MAIN_Y - 0.32} y1={MAIN_Y + 0.32} opacity={0.8} />
    </Canvas>
  );
}
