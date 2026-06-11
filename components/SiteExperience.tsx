"use client";

import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";

// The film is a separate chunk, loaded after first paint and only for
// capable, motion-friendly devices. The static page is the baseline.
const Cinematic = dynamic(() => import("@/components/cinematic/Cinematic"), {
  ssr: false,
});

function canRunCinematic(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  // Respect data-saver
  const conn = (navigator as { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export default function SiteExperience({
  children,
  initialDone,
}: {
  children: ReactNode;
  initialDone?: boolean;
}) {
  const [loadFilm, setLoadFilm] = useState(false);
  const [filmReady, setFilmReady] = useState(false);

  useEffect(() => {
    if (initialDone) return; // post-subscribe redirect: keep the calm page
    if (!canRunCinematic()) return;
    // Lazy-load the 3D after first paint
    const idle =
      "requestIdleCallback" in window
        ? (cb: () => void) => requestIdleCallback(cb, { timeout: 2000 })
        : (cb: () => void) => setTimeout(cb, 350);
    idle(() => setLoadFilm(true));
  }, [initialDone]);

  return (
    <>
      {/* SSR'd editorial page: visible until (and unless) the film takes over */}
      <div hidden={filmReady} style={filmReady ? { display: "none" } : undefined}>
        {children}
      </div>
      {loadFilm ? <Cinematic onReady={() => setFilmReady(true)} /> : null}
    </>
  );
}
