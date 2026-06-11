// The DONE stamp mark — single geometric definition shared by the 2D SVG
// component (components/StampMark.tsx) and the 3D rubber-face / ink-print
// canvas painters, so the 3D stamp face matches the 2D mark exactly.

export const STAMP = {
  // Frame proportions, all relative to frame height = 1
  paddingX: 0.34, // horizontal padding between frame and word
  stroke: 0.085, // border thickness
  cornerRadius: 0.06,
  fontSize: 0.5, // cap height budget for the word
  tracking: 0.14, // letter-spacing in em
  rotation: -3, // degrees; brand: 2–5°, never upright-rigid
} as const;

/** Width/height ratio of the stamp frame for a given word. */
export function stampRatio(word: string): number {
  // Approximate grotesk caps advance ≈ 0.72em + tracking per glyph
  const w =
    word.length * STAMP.fontSize * (0.72 + STAMP.tracking) + STAMP.paddingX * 2;
  return Math.max(w, 1.6);
}

export type PaintStampOptions = {
  word: string;
  color: string;
  /** canvas px height of the frame */
  height: number;
  fontFamily: string;
  /** mirror horizontally (a real rubber face reads in reverse) */
  mirror?: boolean;
  background?: string;
};

/**
 * Paints the stamp mark centred on a canvas and returns it.
 * Canvas size derives from the same proportions as the SVG mark.
 */
export function paintStampMark(opts: PaintStampOptions): HTMLCanvasElement {
  const { word, color, height, fontFamily, mirror = false, background } = opts;
  const ratio = stampRatio(word);
  const pad = height * 0.18; // bleed so the rotated/feathered edge never clips
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(height * ratio + pad * 2);
  canvas.height = Math.ceil(height + pad * 2);
  const ctx = canvas.getContext("2d")!;

  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (mirror) ctx.scale(-1, 1);

  const h = height;
  const w = height * ratio;
  const stroke = h * STAMP.stroke;
  const r = h * STAMP.cornerRadius;

  // Frame
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke;
  ctx.beginPath();
  roundedRect(ctx, -w / 2 + stroke / 2, -h / 2 + stroke / 2, w - stroke, h - stroke, r);
  ctx.stroke();

  // Word — drawn glyph by glyph so tracking matches the SVG `letter-spacing`
  const fontSize = h * STAMP.fontSize;
  ctx.font = `700 ${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  const trackingPx = fontSize * STAMP.tracking;
  const widths = [...word].map((ch) => ctx.measureText(ch).width);
  const total =
    widths.reduce((a, b) => a + b, 0) + trackingPx * (word.length - 1);
  let x = -total / 2;
  [...word].forEach((ch, i) => {
    ctx.fillText(ch, x, fontSize * 0.04); // slight optical centring
    x += widths[i] + trackingPx;
  });

  ctx.restore();
  return canvas;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Resolves the display (grotesk) font family from the next/font CSS variable. */
export function displayFontFamily(): string {
  if (typeof document === "undefined") return "sans-serif";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-display")
    .trim();
  return v || "sans-serif";
}
