"use client";

import dynamic from "next/dynamic";
import { ReactNode, useEffect, useState } from "react";

// The film is a separate chunk, loaded after first paint. The choice of
// film vs static is made pre-paint by the inline gate in app/layout.tsx
// (html.film); the static page is the baseline and the recovery path.
const Cinematic = dynamic(() => import("@/components/cinematic/Cinematic"), {
  ssr: false,
});

function abortFilm() {
  document.documentElement.classList.remove("film", "film-ready");
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
    if (initialDone) {
      // post-subscribe redirect: keep the calm page
      abortFilm();
      return;
    }
    if (!document.documentElement.classList.contains("film")) return;

    const idle =
      "requestIdleCallback" in window
        ? (cb: () => void) => requestIdleCallback(cb, { timeout: 2000 })
        : (cb: () => void) => setTimeout(cb, 350);
    idle(() => setLoadFilm(true));
  }, [initialDone]);

  // If the 3D chunk never arrives (slow network, blocked script), fall
  // back to the static cut rather than holding the curtain forever.
  useEffect(() => {
    if (!loadFilm || filmReady) return;
    const bail = setTimeout(abortFilm, 12000);
    return () => clearTimeout(bail);
  }, [loadFilm, filmReady]);

  return (
    <>
      <div className="static-cut" hidden={filmReady}>
        {children}
      </div>
      {loadFilm ? (
        <Cinematic
          onReady={() => {
            setFilmReady(true);
            // drop the curtain only once the stage has fully faded in
            // over it, so the held title never blinks
            setTimeout(() => document.documentElement.classList.add("film-ready"), 950);
          }}
        />
      ) : null}
    </>
  );
}
