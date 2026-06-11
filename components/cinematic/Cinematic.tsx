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
  TAP_TARGETS,
  rawForProgress,
  remapScroll,
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
  const nextRef = useRef<HTMLButtonElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const [ready, setReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const scroll = useMemo<ScrollState>(() => ({ p: 0, press: 0 }), []);
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches,
    [],
  );

  // The die face and ink prints are canvas-painted with the brand fonts,
  // so the scene only mounts once they're usable (with a cap — a hung
  // font fetch must not hold the page hostage).
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const cap = new Promise((r) => setTimeout(r, 2500));
    Promise.race([fonts, cap]).then(() => {
      if (alive) setFontsLoaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    // Lenis owns scrolling; the native smooth-behavior would fight it
    document.documentElement.style.scrollBehavior = "auto";
    // unhurried: a soft lerp and a calmer wheel slow the film right down
    const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.8 });
    lenisRef.current = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.scrollTo(0, { immediate: true });

    const q = gsap.utils.selector(stage);
    const seenActs = new Set<number>();

    // The advance stamp stays hidden while the film moves; it stamps in
    // 1s after the frame settles (and never over the finale form).
    const nextBtn = nextRef.current;
    let nextTimer: ReturnType<typeof setTimeout> | undefined;
    let lastP = -1;
    const scheduleNext = () => {
      if (nextTimer) clearTimeout(nextTimer);
      nextBtn?.classList.remove(s.nextShown);
      if (scroll.p > 0.86) return;
      nextTimer = setTimeout(() => nextBtn?.classList.add(s.nextShown), 1000);
    };

    // DOM timeline, normalised 0..1. Raw scroll passes through
    // remapScroll() — which holds the frame at the pins — before driving
    // the timeline, the 3D and the colour grade, all from the same value.
    const tl = gsap.timeline({ defaults: { ease: "none" }, paused: true });

    ScrollTrigger.create({
      trigger: wrap,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = remapScroll(self.progress);
        scroll.p = p;
        tl.progress(p);
        stage.style.backgroundColor = worldBackground(p);
        stage.style.setProperty("--world-fg", worldForeground(p));
        if (Math.abs(p - lastP) > 0.0004) {
          lastP = p;
          scheduleNext();
        }
        (Object.entries(ACT_MARKS) as Array<[string, number]>).forEach(([key, mark], i) => {
          if (p >= mark && !seenActs.has(i)) {
            seenActs.add(i);
            track("act_viewed", { act: i + 1, key });
          }
        });
      },
    });

    gsap.set(q(`.${s.layer}`), { autoAlpha: 0 });
    // Act I is the opening frame — visible at rest, it only ever leaves
    gsap.set(q(`.${s.act1}`), { autoAlpha: 1 });

    tl.to(q(`.${s.act1}`), { autoAlpha: 0, y: -40, duration: 0.05 }, 0.17);

    // ACT II — the why: the tension lands alone before the press; once the
    // stamp is down it dims to a setup line and the answer prints beneath it
    tl.fromTo(q(`.${s.act2}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.24)
      .fromTo(q(`.${s.why1}`), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.035 }, 0.25)
      .to(q(`.${s.why1}`), { opacity: 0.55, duration: 0.04 }, 0.4)
      .fromTo(q(`.${s.why2}`), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.04 }, 0.405)
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
    // everything must be fully landed by 0.73 — that's where the pin
    // holds the frame, and a half-revealed line reads as a broken page
    tl.fromTo(q(`.${s.strap}`), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.022 }, 0.652)
      .fromTo(q(`.${s.promiseCopy}`), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.022 }, 0.672)
      .to(q(`.${s.houseLine}`), { clipPath: "inset(0 0% 0 0)", duration: 0.034, ease: "power1.inOut" }, 0.694)
      .to(q(`.${s.act3}`), { autoAlpha: 0, y: -30, duration: 0.04 }, 0.745);

    // THE GOODS — what a subscription gets you, by example; everything is
    // landed before the 0.82 pin so the held frame is the completed act
    tl.fromTo(q(`.${s.goods}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0.755)
      .fromTo(q(`.${s.goodsKicker}`), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.02 }, 0.757);
    const goodsRows = q(`.${s.goodsRow}`);
    goodsRows.forEach((el, i) => {
      tl.fromTo(
        el,
        { autoAlpha: 0, scale: 1.3 },
        { autoAlpha: 1, scale: 1, duration: 0.012, ease: "power3.in" },
        0.768 + i * 0.013,
      );
    });
    tl.fromTo(q(`.${s.goodsTakeaway}`), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.018 }, 0.796)
      .fromTo(q(`.${s.goodsCred}`), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.014 }, 0.802)
      .to(q(`.${s.goods}`), { autoAlpha: 0, y: -28, duration: 0.04 }, 0.83);

    // ACT IV — stamp your name
    tl.fromTo(
      q(`.${s.act4}`),
      { autoAlpha: 0, y: 36 },
      { autoAlpha: 1, y: 0, duration: 0.05 },
      0.9,
    );
    // keep the timeline's full duration at 1 so positions map 1:1 to progress
    tl.to({}, { duration: 0.001 }, 0.999);

    stage.style.backgroundColor = worldBackground(0);
    scheduleNext();

    return () => {
      if (nextTimer) clearTimeout(nextTimer);
      ScrollTrigger.getAll().forEach((st) => st.kill());
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

  // Tap-to-advance: animate the scroll to the next act's hold-point so the
  // film plays through on the way — same choreography, directed pacing.
  // Free scrolling stays available underneath; the button is the guide.
  function advance() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const next = TAP_TARGETS.find((t) => t > scroll.p + 0.02) ?? 1;
    const target = rawForProgress(next) * max;
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { duration: 2.8, easing: (t: number) => 1 - Math.pow(1 - t, 3) });
    } else {
      window.scrollTo({ top: target, behavior: "smooth" });
    }
    track("tap_advance", { target: next });
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
      {/* the film's runtime (the pins absorb ~25% of it) */}
      <div style={{ height: isMobile ? "920vh" : "1215vh" }} aria-hidden="true" />

      <div ref={stageRef} className={`${s.stage} ${ready ? s.stageReady : ""}`}>
        <div className={s.canvas}>
          <Canvas
            dpr={[1, isMobile ? 1.5 : 2]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ fov: isMobile ? 46 : 35, position: [0, 0.5, 5.4], near: 0.1, far: 50 }}
          >
            {fontsLoaded ? (
              <Scene
                scroll={scroll}
                isMobile={isMobile}
                onFirstFrames={() => {
                  // the scene has genuinely drawn — reveal the stage
                  setReady(true);
                  onReady();
                }}
              />
            ) : null}
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
        </div>

        {/* ACT II */}
        <div className={`${s.layer} ${s.act2}`}>
          <div className={s.whyStack}>
            <p className={`${s.whyLine} ${s.why1}`}>{COPY.whyLines[0]}</p>
            <p className={`${s.whyLine} ${s.why2}`}>{COPY.whyLines[1]}</p>
          </div>
        </div>

        {/* ACT III */}
        <div className={`${s.layer} ${s.act3}`}>
          <div className={s.verbRow}>
            {COPY.steps.map((step, i) => (
              <span className={s.verb} key={step}>
                <StampMark
                  word={step.toUpperCase()}
                  color={COLORS.ink}
                  height={isMobile ? 34 : 46}
                  rotation={i % 2 === 0 ? -3 : 2.5}
                  title={step}
                />
              </span>
            ))}
          </div>
          <h2 className={s.strap}>{COPY.strap}</h2>
          <p className={s.promiseCopy}>{COPY.promiseHeading}</p>
          <blockquote className={s.houseLine}>{COPY.houseLine}</blockquote>
        </div>

        {/* THE GOODS */}
        <div className={`${s.layer} ${s.goods}`}>
          <span className={`mono ${s.goodsKicker}`}>{COPY.goodsKicker}</span>
          <ul className={s.goodsList}>
            {COPY.goods.map(({ build, verb }) => (
              <li className={s.goodsRow} key={verb}>
                <span className={s.goodsBuild}>{build}</span>
                <StampMark
                  word={verb}
                  color={COLORS.brick}
                  height={isMobile ? 28 : 36}
                  rotation={-3}
                  title={verb}
                />
              </li>
            ))}
          </ul>
          <p className={s.goodsTakeaway}>{COPY.goodsTakeaway}</p>
          <p className={s.goodsCred}>{COPY.goodsCred}</p>
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

        {/* tap-to-advance — a stamped NEXT, pressed in once the frame rests */}
        <button
          ref={nextRef}
          type="button"
          className={s.next}
          onClick={advance}
          aria-label="Continue to the next scene"
        >
          <StampMark
            word="NEXT"
            color={COLORS.brick}
            height={isMobile ? 34 : 42}
            rotation={-4}
            title="Next"
          />
        </button>
      </div>
    </div>
  );
}
