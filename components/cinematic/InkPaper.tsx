"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS } from "@/lib/brand";
import { displayFontFamily, paintStampMark } from "@/lib/stamp-mark";
import {
  CONTACT_UV,
  PAPER_CENTER,
  PAPER_TILT,
  gradeT,
  inkProgress,
  paperReveal,
  pressAmount,
} from "./choreography";

// The Act II sheet. Ink bloom is faked in the fragment shader: a noisy
// distance field grows from the contact point and reveals the printed stat,
// with a darker wicking edge and paper-fibre grain. No physics sim.

const vertex = /* glsl */ `
  uniform float uPress;
  uniform vec2 uContact;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    float d = distance(uv, uContact);
    // paper gives slightly under the stamp
    p.z -= uPress * 0.05 * exp(-d * d * 24.0);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;

  uniform sampler2D uInkMap;
  uniform float uProgress;   // ink bloom 0..1
  uniform float uWorld;      // 0 dark studio .. 1 paper world
  uniform float uReveal;     // sheet opacity
  uniform float uPress;      // contact shade
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uInkDeep;
  uniform vec2 uContact;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // warm paper with fibre grain
    float fibre = fbm(vUv * 160.0);
    vec3 base = uPaper * (0.97 + 0.05 * fibre);

    // ink bloom: noisy distance field growing from the contact point
    float d = distance(vUv * vec2(1.45, 1.0), uContact * vec2(1.45, 1.0));
    float field = d + (fbm(vUv * 26.0) - 0.5) * 0.22;
    float grown = uProgress * 0.9;
    float mask = smoothstep(grown, grown - 0.16, field);

    vec4 ink = texture2D(uInkMap, vUv);
    // darker wick at the bloom's leading edge
    float edge = 1.0 - 0.45 * smoothstep(0.1, 0.0, abs(field - grown));
    // slightly uneven coverage, like real rubber
    float coverage = 0.82 + 0.18 * fbm(vUv * 90.0);
    vec3 inkCol = mix(uInkDeep, uInk, edge) * coverage;
    float inkA = ink.a * mask;

    // contact shade under the stamp
    float shade = uPress * 0.3 * exp(-d * d * 18.0);

    vec3 col = mix(base, inkCol, inkA) * (1.0 - shade);

    // in the dark studio the sheet is spotlit, not evenly lit
    float spot = mix(0.16 + 1.05 * exp(-d * d * 5.0), 1.0, uWorld);
    col *= spot;

    gl_FragColor = vec4(col, uReveal);
  }
`;

export default function InkPaper({ scroll }: { scroll: { p: number } }) {
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uInkMap: { value: new THREE.Texture() },
      uProgress: { value: 0 },
      uWorld: { value: 0 },
      uReveal: { value: 0 },
      uPress: { value: 0 },
      uPaper: { value: new THREE.Color(COLORS.paper) },
      uInk: { value: new THREE.Color(COLORS.brick) },
      uInkDeep: { value: new THREE.Color(COLORS.brickPressed) },
      uContact: { value: new THREE.Vector2(...CONTACT_UV) },
    }),
    [],
  );

  // Paint the print once the display font is ready. The stamp prints what
  // its face says — DONE — from the same mark definition as the rubber die.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof document !== "undefined" && document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 704; // plane is 5.8 × 4.0 — keep aspect close
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // colour comes from the shader; alpha is the print
      const mark = paintStampMark({
        word: "DONE",
        color: "#ffffff",
        height: 150,
        fontFamily: displayFontFamily(),
      });
      ctx.save();
      // contact UV (0.5, 0.6) → canvas coords (v flips)
      ctx.translate(canvas.width * CONTACT_UV[0], canvas.height * (1 - CONTACT_UV[1]));
      ctx.rotate((-2.6 * Math.PI) / 180); // matches the stamp's roll at contact
      ctx.drawImage(mark, -mark.width / 2, -mark.height / 2);
      ctx.restore();

      const tex = new THREE.CanvasTexture(canvas);
      tex.anisotropy = 4;
      tex.colorSpace = THREE.NoColorSpace;
      if (mat.current) {
        mat.current.uniforms.uInkMap.value = tex;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useFrame(() => {
    const m = mat.current;
    if (!m) return;
    const p = scroll.p;
    m.uniforms.uProgress.value = inkProgress(p);
    m.uniforms.uWorld.value = gradeT(p);
    m.uniforms.uReveal.value = paperReveal(p);
    m.uniforms.uPress.value = pressAmount(p);
  });

  return (
    <mesh position={PAPER_CENTER} rotation={[PAPER_TILT, 0, 0]}>
      <planeGeometry args={[5.8, 4.0, 48, 48]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
