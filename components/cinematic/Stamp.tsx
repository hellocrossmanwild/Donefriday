"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import { displayFontFamily, paintStampMark } from "@/lib/stamp-mark";

// The hero object: a procedural rubber stamp. Turned wooden handle
// (lathe profile), lacquered mount, red rubber pad, and a face textured
// with the exact 2D DONE mark — mirrored, as a real rubber face reads.
// Group origin sits at the rubber face so press maths are simple.

// classic turned-handle silhouette, [radius, y] from base of handle upward
const HANDLE_PROFILE: Array<[number, number]> = [
  [0.155, 0.0],
  [0.16, 0.04],
  [0.12, 0.1],
  [0.075, 0.22],
  [0.06, 0.38],
  [0.07, 0.52],
  [0.105, 0.66],
  [0.145, 0.78],
  [0.16, 0.88],
  [0.15, 0.95],
  [0.1, 1.0],
  [0.0, 1.02],
];

const Stamp = forwardRef<THREE.Group>(function Stamp(_, ref) {
  const [face, setFace] = useState<{ tex: THREE.CanvasTexture; ratio: number } | null>(null);

  const handleGeometry = useMemo(() => {
    const pts = HANDLE_PROFILE.map(([r, y]) => new THREE.Vector2(r, y));
    return new THREE.LatheGeometry(pts, 48);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled) return;
      // Ink-loaded mark on red rubber; mirrored like a real die
      const canvas = paintStampMark({
        word: "DONE",
        color: "#4A1209",
        height: 220,
        fontFamily: displayFontFamily(),
        mirror: true,
        background: "#94402F",
      });
      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 8;
      setFace({ tex, ratio: canvas.width / canvas.height });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <group ref={ref}>
      {/* turned wooden handle */}
      <mesh geometry={handleGeometry} position={[0, 0.46, 0]} castShadow>
        <meshStandardMaterial color="#8A5A33" roughness={0.48} metalness={0.02} />
      </mesh>
      {/* brass-dark collar between handle and mount */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.06, 32]} />
        <meshStandardMaterial color="#3A2E22" roughness={0.4} metalness={0.35} />
      </mesh>
      {/* lacquered mount */}
      <RoundedBox args={[1.7, 0.32, 0.78]} radius={0.05} smoothness={3} position={[0, 0.27, 0]} castShadow>
        <meshStandardMaterial color="#26201A" roughness={0.32} metalness={0.08} />
      </RoundedBox>
      {/* red rubber pad */}
      <RoundedBox args={[1.6, 0.13, 0.68]} radius={0.025} smoothness={2} position={[0, 0.065, 0]}>
        <meshStandardMaterial color="#7E3023" roughness={0.92} metalness={0} />
      </RoundedBox>
      {/* the die — the DONE mark itself, facing down */}
      {face ? (
        <mesh position={[0, 0.002, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.62 * face.ratio, 0.62]} />
          <meshStandardMaterial map={face.tex} roughness={0.85} metalness={0} />
        </mesh>
      ) : null}
    </group>
  );
});

export default Stamp;
