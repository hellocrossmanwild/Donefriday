"use client";

import { useEffect, useRef } from "react";

// Loading curtain: dark stage + stamp-outline SVG border that draws around
// the viewport edges while the 3D film chunk loads.
export default function StampCurtain({ hide }: { hide: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const rectRef = useRef<SVGRectElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    const rect = rectRef.current;
    if (!svg || !rect) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const m = 18;
    const rw = w - m * 2;
    const rh = h - m * 2;
    const perimeter = 2 * (rw + rh);

    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    rect.setAttribute("width", String(rw));
    rect.setAttribute("height", String(rh));
    rect.style.strokeDasharray = String(perimeter);
    rect.style.strokeDashoffset = String(perimeter);

    let rafId: number;
    let startTs: number | null = null;
    const dur = 2600;

    function draw(ts: number) {
      if (startTs === null) startTs = ts;
      const raw = Math.min(1, (ts - startTs) / dur);
      // ease in-out cubic
      const t = raw < 0.5 ? 4 * raw ** 3 : 1 - (-2 * raw + 2) ** 3 / 2;
      rect!.style.strokeDashoffset = String(perimeter * (1 - t));
      if (raw < 1) rafId = requestAnimationFrame(draw);
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "var(--ink)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingBottom: "calc(16vh + 96px)",
        opacity: hide ? 0 : 1,
        transition: "opacity 0.85s ease",
        pointerEvents: hide ? "none" : "auto",
      }}
    >
      <svg
        ref={svgRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        fill="none"
        aria-hidden="true"
      >
        <rect
          ref={rectRef}
          x={18}
          y={18}
          rx={3}
          stroke="rgba(246, 241, 232, 0.3)"
          strokeWidth="1.5"
        />
      </svg>
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--font-display), system-ui, sans-serif",
          fontSize: "clamp(46px, 9vw, 104px)",
          fontWeight: 800,
          letterSpacing: "-0.025em",
          color: "var(--paper)",
        }}
      >
        Done Friday.
      </span>
    </div>
  );
}
