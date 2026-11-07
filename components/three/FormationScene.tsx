"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";

/**
 * The bookend. Eleven players in a 4-3-3 drift on a dark pitch.
 * As the clock reaches 90', passing lanes connect one by one and the team becomes a network.
 * The last connection is teal (accent use #5).
 */

// x = width of pitch (-1..1), z = length (own goal -1 .. attack +1)
const PLAYERS: [number, number][] = [
  [0, -1.0], // GK
  [-0.75, -0.55], [-0.26, -0.62], [0.26, -0.62], [0.75, -0.55], // back four
  [-0.48, -0.1], [0, -0.2], [0.48, -0.1], // midfield three
  [-0.68, 0.48], [0, 0.62], [0.68, 0.48], // front three
];

// passing lanes, built from the back to the front; the last one is the one that matters
const EDGES: [number, number][] = [
  [0, 2], [0, 3], [1, 2], [2, 3], [3, 4],
  [1, 5], [2, 6], [3, 6], [4, 7],
  [5, 6], [6, 7], [5, 8], [7, 10],
  [6, 9], [8, 9], [9, 10], [5, 9], [7, 9],
  [1, 8], [4, 10], [0, 9],
];

const SCALE = 2.6;

function Team({ progress }: { progress: RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const dots = useRef<THREE.InstancedMesh>(null);
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const base = useMemo(() => PLAYERS.map(([x, z]) => new THREE.Vector3(x * SCALE * 1.15, 0, z * SCALE)), []);
  const pos = useMemo(() => base.map((v) => v.clone()), [base]);
  const lineRefs = useRef<({ geometry: { setPositions: (a: number[]) => void }; material: THREE.Material & { opacity: number } } | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const p = progress.current ?? 0;
    if (group.current) group.current.rotation.y = Math.sin(t * 0.08) * 0.18;

    base.forEach((b, i) => {
      pos[i].set(b.x + Math.sin(t * 0.5 + i * 1.7) * 0.07, 0, b.z + Math.cos(t * 0.42 + i * 2.3) * 0.07);
      tmp.position.copy(pos[i]);
      tmp.rotation.set(-Math.PI / 2, 0, 0);
      tmp.scale.setScalar(1);
      tmp.updateMatrix();
      dots.current?.setMatrixAt(i, tmp.matrix);
    });
    if (dots.current) dots.current.instanceMatrix.needsUpdate = true;

    const shown = p * EDGES.length;
    EDGES.forEach(([a, b], i) => {
      const l = lineRefs.current[i];
      if (!l) return;
      const k = Math.max(0, Math.min(1, shown - i)); // 0..1 draw-on for this edge
      const end = pos[a].clone().lerp(pos[b], k);
      l.geometry.setPositions([pos[a].x, 0, pos[a].z, end.x, 0, end.z]);
      l.material.opacity = k > 0 ? (i === EDGES.length - 1 ? 1 : 0.38) : 0;
    });
  });

  return (
    <group ref={group}>
      <Pitch />
      <instancedMesh ref={dots} args={[undefined, undefined, PLAYERS.length]}>
        <circleGeometry args={[0.055, 24]} />
        <meshBasicMaterial color="#f0ede8" side={THREE.DoubleSide} />
      </instancedMesh>
      {EDGES.map((_, i) => (
        <Line
          key={i}
          ref={(el) => void (lineRefs.current[i] = el as unknown as (typeof lineRefs.current)[number])}
          points={[
            [0, 0, 0],
            [0, 0, 0.0001],
          ]}
          color={i === EDGES.length - 1 ? "#00d4b4" : "#f0ede8"}
          lineWidth={i === EDGES.length - 1 ? 1.6 : 1}
          transparent
          opacity={0}
        />
      ))}
    </group>
  );
}

/** Faint pitch markings so the formation reads as football before it reads as a graph. */
function Pitch() {
  const W = SCALE * 1.15 * 1.08;
  const L = SCALE * 1.12;
  const circle = useMemo(
    () =>
      Array.from({ length: 49 }, (_, i) => {
        const a = (i / 48) * Math.PI * 2;
        return [Math.cos(a) * 0.55, -0.01, Math.sin(a) * 0.55 + L] as [number, number, number];
      }),
    [L]
  );
  const c = { color: "#f0ede8", lineWidth: 1, transparent: true, opacity: 0.09 } as const;
  return (
    <group>
      <Line points={[[-W, -0.01, -L], [W, -0.01, -L], [W, -0.01, L], [-W, -0.01, L], [-W, -0.01, -L]]} {...c} />
      <Line points={[[-0.9, -0.01, -L], [-0.9, -0.01, -L + 0.6], [0.9, -0.01, -L + 0.6], [0.9, -0.01, -L]]} {...c} />
      <Line points={circle} {...c} />
    </group>
  );
}

export default function FormationScene({ active, progress }: { active: boolean; progress: RefObject<number> }) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 7.6, 6.8], fov: 34 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0.2)}
      style={{ position: "absolute", inset: 0 }}
    >
      <Team progress={progress} />
    </Canvas>
  );
}
