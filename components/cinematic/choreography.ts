// Scroll choreography — every act, pose and colour reads from the one
// normalised scroll progress p ∈ [0,1], so 3D, DOM and the colour grade
// stay frame-locked (brief §5: scroll is the single source of truth).

import { COLORS } from "@/lib/brand";

export const ACT_MARKS = { act1: 0.01, act2: 0.3, act3: 0.6, act4: 0.85 } as const;

// ——— scroll remap: pins ———
// Raw scroll is remapped through piecewise segments before it drives
// anything. Zero-travel segments are pins: the frame holds while the
// reader keeps scrolling, so the big moments get room to land.
// [from, to, weight] — weight is the share of total scroll distance.
const SEGMENTS: Array<[number, number, number]> = [
  [0, 0.17, 1.0], // Act I — the stamp at rest
  [0.17, 0.33, 0.9], // anticipation
  [0.33, 0.48, 1.1], // the press, the DONE print, the answer
  [0.48, 0.48, 0.8], // PIN — sit with the printed DONE
  [0.48, 0.62, 0.8], // the world floods to paper
  [0.62, 0.73, 1.0], // verbs print, the strap lands
  [0.73, 0.73, 0.8], // PIN — Start Sunday. Done Friday.
  [0.73, 0.9, 0.8], // the stamp returns
  [0.9, 1, 0.5], // settle on the form
];
const TOTAL_WEIGHT = SEGMENTS.reduce((a, s) => a + s[2], 0);

export function remapScroll(raw: number): number {
  let start = 0;
  for (const [from, to, weight] of SEGMENTS) {
    const span = weight / TOTAL_WEIGHT;
    if (raw <= start + span) {
      return from + (to - from) * ((raw - start) / span);
    }
    start += span;
  }
  return 1;
}

// ——— easing / ranges ———

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** progress of p through [a,b], smoothstepped */
export function seg(p: number, a: number, b: number): number {
  const t = clamp01((p - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** linear segment (no easing) */
export function segLin(p: number, a: number, b: number): number {
  return clamp01((p - a) / (b - a));
}

const easeInCubic = (t: number) => t * t * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// ——— the colour grade: dark studio → warm paper ———

/** 0 = dark world, 1 = paper world */
export const gradeT = (p: number) => seg(p, 0.5, 0.62);

const hex = (h: string) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

const INK_RGB = hex(COLORS.ink);
const PAPER_RGB = hex(COLORS.paper);

export function worldBackground(p: number): string {
  const t = gradeT(p);
  const c = INK_RGB.map((a, i) => Math.round(a + (PAPER_RGB[i] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function worldForeground(p: number): string {
  // text flips paper→ink as the world floods
  const t = gradeT(p);
  const c = PAPER_RGB.map((a, i) => Math.round(a + (INK_RGB[i] - a) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// ——— the paper sheet (Act II) ———

// Tilted toward camera like a drafting desk so the print reads.
export const PAPER_TILT = -(55 * Math.PI) / 180; // rotation.x
export const PAPER_CENTER: [number, number, number] = [0, -1.0, 0.3];
// plane normal after tilt
const COS = Math.cos(55 * (Math.PI / 180));
const SIN = Math.sin(55 * (Math.PI / 180));
export const PAPER_NORMAL: [number, number, number] = [0, SIN, COS];
// where the stamp lands, in paper UV space
export const CONTACT_UV: [number, number] = [0.5, 0.6];

/** sheet rises out of the dark, then dissolves into the flooding paper world */
export const paperReveal = (p: number) => seg(p, 0.24, 0.32) * (1 - seg(p, 0.52, 0.61));

/** ink wicks through the fibres just after impact */
export const inkProgress = (p: number) => easeOutCubic(segLin(p, 0.365, 0.475));

/** contact amount — drives paper micro-displacement + contact shade */
export function pressAmount(p: number): number {
  return seg(p, 0.345, 0.365) * (1 - seg(p, 0.4, 0.46));
}

/** a sharp pulse at the moment of impact (camera shake, paper kick) */
export function impact(p: number): number {
  const d = (p - 0.368) / 0.012;
  return Math.exp(-d * d);
}

// ——— stamp pose ———

export type Pose = {
  pos: [number, number, number];
  rot: [number, number, number]; // euler xyz
  scale: number;
  visible: boolean;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// press travel runs along the paper normal from the contact point
const CONTACT: [number, number, number] = [
  PAPER_CENTER[0],
  PAPER_CENTER[1] + PAPER_NORMAL[1] * 0.012,
  PAPER_CENTER[2] + PAPER_NORMAL[2] * 0.012,
];
const ALIGN_X = PAPER_TILT + Math.PI / 2; // stamp face flush with the sheet

function alongNormal(lift: number): [number, number, number] {
  return [
    CONTACT[0] + PAPER_NORMAL[0] * lift,
    CONTACT[1] + PAPER_NORMAL[1] * lift,
    CONTACT[2] + PAPER_NORMAL[2] * lift,
  ];
}

/**
 * The hero's blocking, scroll start → finale.
 * `time` only adds idle life (slow turn, bob); everything else is p.
 */
export function stampPose(p: number, time: number, pressExtra: number): Pose {
  // Act I — floating, loaded with potential energy, slow showcase turn
  const float: Pose = {
    pos: [0, 0.05 + Math.sin(time * 0.9) * 0.04, 0],
    rot: [0.06, -0.5 + p * 5.2 + time * 0.05, -0.08],
    scale: 1,
    visible: true,
  };
  if (p < 0.24) return float;

  // Anticipation — rise, tip back, square up over the sheet
  const ready: Pose = {
    pos: alongNormal(1.7),
    rot: [ALIGN_X - 0.3, 0, -0.06],
    scale: 1,
    visible: true,
  };
  if (p < 0.33) {
    const t = seg(p, 0.24, 0.33);
    return blend(float, ready, t);
  }

  // The press — fast, committed
  if (p < 0.368) {
    const t = easeInCubic(segLin(p, 0.33, 0.368));
    return {
      pos: alongNormal(lerp(1.7, 0.02, t)),
      rot: [lerp(ALIGN_X - 0.3, ALIGN_X, t), 0, lerp(-0.06, -0.045, t)],
      scale: 1,
      visible: true,
    };
  }

  // Contact — hold, tiny settle
  if (p < 0.405) {
    return {
      pos: alongNormal(0.02),
      rot: [ALIGN_X, 0, -0.045],
      scale: 1,
      visible: true,
    };
  }

  // The lift — unhurried, job done
  if (p < 0.5) {
    const t = easeOutCubic(segLin(p, 0.405, 0.5));
    return {
      pos: alongNormal(lerp(0.02, 1.3, t)),
      rot: [lerp(ALIGN_X, ALIGN_X - 0.45, t), 0, -0.05],
      scale: 1,
      visible: true,
    };
  }

  // Exit — rises out of frame as the world floods to paper
  if (p < 0.64) {
    const t = seg(p, 0.5, 0.64);
    const from = alongNormal(1.3);
    return {
      pos: [from[0], from[1] + t * 4.2, from[2] - t * 0.5],
      rot: [ALIGN_X - 0.45 - t * 0.4, t * 0.6, -0.05],
      scale: lerp(1, 0.85, t),
      visible: true,
    };
  }

  // Offstage during the editorial heart
  if (p < 0.78) {
    return { pos: [0, 5, 0], rot: [0, 0, 0], scale: 0.85, visible: false };
  }

  // Finale — re-enter from above, poised over the form line
  const poiseY = 0.72 + Math.sin(time * 1.4) * 0.025;
  const enter = seg(p, 0.78, 0.9);
  const y = lerp(4.2, poiseY, enter);
  return {
    pos: [0, y - pressExtra * 1.35, 0.9],
    rot: [0.12 - pressExtra * 0.12, 0.0, -0.055],
    scale: 0.52,
    visible: true,
  };
}

function blend(a: Pose, b: Pose, t: number): Pose {
  return {
    pos: [lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t)],
    rot: [lerp(a.rot[0], b.rot[0], t), lerp(a.rot[1], b.rot[1], t), lerp(a.rot[2], b.rot[2], t)],
    scale: lerp(a.scale, b.scale, t),
    visible: true,
  };
}

// ——— camera ———

export type CamPose = { pos: [number, number, number]; look: [number, number, number] };

export function cameraPose(p: number, isMobile: boolean): CamPose {
  const back = isMobile ? 1.18 : 1; // portrait keeps the stamp in frame
  // Act I: product-film orbit height
  const a: CamPose = { pos: [0, 0.5, 5.4 * back], look: [0, 0.35, 0] };
  // Act II: dolly in and down toward the sheet
  const b: CamPose = { pos: [0.15, 0.65, 4.1 * back], look: [0, -0.55, 0.25] };
  // Act III: pull wide as the world floods
  const c: CamPose = { pos: [0, 0.3, 6.2 * back], look: [0, 0.1, 0] };
  // Act IV: settle on the poised stamp above the form
  const d: CamPose = { pos: [0, 0.55, 4.8 * back], look: [0, 0.85, 0] };

  if (p < 0.24) return a;
  if (p < 0.36) return lerpCam(a, b, seg(p, 0.24, 0.36));
  if (p < 0.5) return b;
  if (p < 0.66) return lerpCam(b, c, seg(p, 0.5, 0.66));
  if (p < 0.78) return c;
  return lerpCam(c, d, seg(p, 0.78, 0.9));
}

function lerpCam(a: CamPose, b: CamPose, t: number): CamPose {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    pos: [l(a.pos[0], b.pos[0]), l(a.pos[1], b.pos[1]), l(a.pos[2], b.pos[2])],
    look: [l(a.look[0], b.look[0]), l(a.look[1], b.look[1]), l(a.look[2], b.look[2])],
  };
}

// ——— lighting ———

export function lightState(p: number) {
  const t = gradeT(p);
  return {
    ambient: lerp(0.14, 0.95, t),
    key: lerp(26, 7, t), // spotlight: theatrical in the dark, soft on paper
    rim: lerp(2.2, 0.4, t),
  };
}
