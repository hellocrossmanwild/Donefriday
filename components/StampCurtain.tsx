"use client";

import { useEffect, useRef } from "react";

// Loading curtain: dark stage with a stamp-outline border that draws and
// re-draws around the viewport edge until the 3D film chunk is ready.
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
    const cycle = 2800; // ms per half-cycle: draw, then chase off

    const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

    function draw(ts: number) {
      const phase = (ts / cycle) % 2;
      if (phase < 1) {
        // ink the border on, clockwise from the top-left
        rect!.style.strokeDashoffset = String(perimeter * (1 - easeInOut(phase)));
      } else {
        // the tail chases the head off, same direction — a travelling band
        rect!.style.strokeDashoffset = String(-perimeter * easeInOut(phase - 1));
      }
      rafId = requestAnimationFrame(draw);
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
        opacity: hide ? 0 : 1,
        transition: "opacity 0.85s ease",
        pointerEvents: hide ? "none" : "auto",
      }}
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
        fill="none"
      >
        <rect
          ref={rectRef}
          x={18}
          y={18}
          rx={3}
          stroke="rgba(246, 241, 232, 0.35)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
