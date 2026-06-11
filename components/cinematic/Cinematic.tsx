"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import StampMark from "@/components/StampMark";
import SubscribeForm from "@/components/SubscribeForm";
import { COLORS, COPY } from "@/lib/brand";
import { track } from "@/lib/analytics";
import Scene, { ScrollState } from "./Scene";
import {
  ACT_MARKS,
  worldBackground,
  worldForeground,
} from "./choreography";
import s from "./Cinematic.module.css";

// The film. A tall scroll spacer sets the runtime; everything visible lives
// in a fixed stage. One ScrollTrigger maps scroll → progress; the DOM
// timeline scrubs from it and the 3D scene reads the same value per frame.

function dateline() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    timeZone: "Europe/London",
  })
    .format(new Date())
    .toUpperCase();
}

export default function Cinematic({ onReady }: { onReady: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [ready, setReady] = useState(false);
  const scroll = useMemo<ScrollState>(() => ({ p: 0, press: 0 }), []);
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
    [],
  );

  useEffect(() => {
    if (!ready) return;
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    // Lenis owns scrolling; the native smooth-behavior would fight it
    document.documentElement.style.scrollBehavior = "auto";
    const lenis = new Lenis({ lerp: 0.09 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.scrollTo(0, { immediate: true });

    const q = gsap.utils.selector(stage);
    const seenActs = new Set<number>();

    // DOM timeline, normalised 0..1 to mirror the scroll progress
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: wrap,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          scroll.p = self.progress;
          stage.style.backgroundColor = worldBackground(self.progress);
          stage.style.setProperty("--world-fg", worldForeground(self.progress));
          (Object.entries(ACT_MARKS) as Array<[string, number]>).forEach(([key, mark], i) => {
            if (self.progress >= mark && !seenActs.has(i)) {
              seenActs.add(i);
              track("act_viewed", { act: i + 1, key });
            }
          });
        },
      },
    });

    gsap.set(q(`.${s.layer}`), { autoAlpha: 0 });

    // ACT I — the stamp, at rest, loaded
    tl.fromTo(q(`.${s.act1}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0.005)
      .fromTo(q(`.${s.title}`), { y: 28 }, { y: 0, duration: 0.05 }, 0.005)
      .to(q(`.${s.act1}`), { autoAlpha: 0, y: -40, duration: 0.05 }, 0.17);

    // ACT II — the number, after the impact
    tl.fromTo(q(`.${s.act2}`), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.04 }, 0.385)
      .to(q(`.${s.act2}`), { autoAlpha: 0, duration: 0.045 }, 0.5);

    // ACT III — the promise; verb stamps print in sequence
    tl.fromTo(q(`.${s.act3}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.03 }, 0.565);
    const verbs = q(`.${s.verb}`);
    verbs.forEach((el, i) => {
      tl.fromTo(
        el,
        { autoAlpha: 0, scale: 1.45 },
        { autoAlpha: 1, scale: 1, duration: 0.012, ease: "power3.in" },
        0.585 + i * 0.032,
      );
    });
    tl.fromTo(q(`.${s.strap}`), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.025 }, 0.655)
      .fromTo(q(`.${s.promiseCopy}`), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.025 }, 0.68)
      .fromTo(q(`.${s.houseLine}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.025 }, 0.705)
      .to(q(`.${s.act3}`), { autoAlpha: 0, y: -30, duration: 0.04 }, 0.745);

    // ACT IV — stamp your name
    tl.fromTo(
      q(`.${s.act4}`),
      { autoAlpha: 0, y: 36 },
      { autoAlpha: 1, y: 0, duration: 0.05 },
      0.83,
    );
    // keep the timeline's full duration at 1 so positions map 1:1 to progress
    tl.to({}, { duration: 0.001 }, 0.999);

    stage.style.backgroundColor = worldBackground(0);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.style.scrollBehavior = "";
    };
  }, [ready, scroll]);

  // The finale press — fired by a successful subscribe
  function pressStamp() {
    const state = { v: 0 };
    gsap.to(state, {
      v: 1,
      duration: 0.22,
      ease: "power3.in",
      onUpdate: () => (scroll.press = state.v),
      onComplete: () => {
        gsap.to(state, {
          v: 0,
          duration: 0.7,
          delay: 0.15,
          ease: "elastic.out(1, 0.55)",
          onUpdate: () => (scroll.press = state.v),
        });
      },
    });
  }

  function jumpToSubscribe() {
    const lenis = lenisRef.current;
    const target = document.body.scrollHeight;
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.6 });
    } else {
      window.scrollTo(0, target);
    }
  }

  return (
    <div ref={wrapRef}>
      {/* the film's runtime */}
      <div style={{ height: isMobile ? "480vh" : "620vh" }} aria-hidden="true" />

      <div ref={stageRef} className={`${s.stage} ${ready ? s.stageReady : ""}`}>
        <div className={s.canvas}>
          <Canvas
            dpr={[1, isMobile ? 1.5 : 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ fov: isMobile ? 46 : 35, position: [0, 0.5, 5.4], near: 0.1, far: 50 }}
            onCreated={() => {
              requestAnimationFrame(() => {
                setReady(true);
                onReady();
              });
            }}
          >
            <Scene scroll={scroll} isMobile={isMobile} />
          </Canvas>
        </div>

        <header className={s.header}>
          <span className={s.mastheadName}>{COPY.masthead}</span>
          <div className={s.headerRight}>
            <span className={`mono ${s.dateline}`}>{dateline()}</span>
            <button type="button" className="skip-to-subscribe" onClick={jumpToSubscribe}>
              Subscribe
            </button>
          </div>
        </header>

        {/* ACT I */}
        <div className={`${s.layer} ${s.act1}`}>
          <h1 className={s.title}>{COPY.title}</h1>
          <p className={s.sub}>{COPY.sub}</p>
          <span className={`mono ${s.cue}`}>Scroll</span>
        </div>

        {/* ACT II */}
        <div className={`${s.layer} ${s.act2}`}>
          <span className={`mono ${s.kicker}`}>The number</span>
          <div className={s.statLines}>
            {COPY.statLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        {/* ACT III */}
        <div className={`${s.layer} ${s.act3}`}>
          <div className={s.verbRow}>
            {COPY.verbs.map((verb, i) => (
              <span className={s.verb} key={verb}>
                <StampMark
                  word={verb}
                  color={COLORS.ink}
                  height={isMobile ? 34 : 46}
                  rotation={i % 2 === 0 ? -3 : 2.5}
                  title={verb}
                />
              </span>
            ))}
          </div>
          <h2 className={s.strap}>{COPY.strap}</h2>
          <p className={s.promiseCopy}>{COPY.promise}</p>
          <blockquote className={s.houseLine}>{COPY.houseLine}</blockquote>
        </div>

        {/* ACT IV */}
        <div className={`${s.layer} ${s.act4}`}>
          <div className={s.act4inner}>
            <h2 className={s.finaleHeading}>{COPY.finaleHeading}</h2>
            <SubscribeForm id="subscribe-film" onDone={pressStamp} />
          </div>
          <footer className={`mono ${s.footer}`}>
            <span>Done Friday · donefriday.com · sent weekly, Friday</span>
            <span className={s.from}>
              {COPY.footerFrom} <a href={COPY.whisperLink.href}>{COPY.whisperLink.label}</a>
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
