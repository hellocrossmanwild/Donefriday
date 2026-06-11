import { STAMP, stampRatio } from "@/lib/stamp-mark";
import { COLORS } from "@/lib/brand";

type Props = {
  word?: string;
  color?: string;
  /** rendered frame height in px (width derives from the word) */
  height?: number;
  rotation?: number;
  className?: string;
  title?: string;
};

/**
 * The 2D stamp mark — same geometry as the 3D rubber face (lib/stamp-mark.ts).
 * Pure SVG so it stays crisp at any size.
 */
export default function StampMark({
  word = "DONE",
  color = COLORS.brick,
  height = 64,
  rotation = STAMP.rotation,
  className,
  title,
}: Props) {
  const ratio = stampRatio(word);
  const h = 100;
  const w = h * ratio;
  const stroke = h * STAMP.stroke;
  const r = h * STAMP.cornerRadius;
  // Bleed so rotation never clips
  const bleed = h * 0.25;
  const vw = w + bleed * 2;
  const vh = h + bleed * 2;

  return (
    <svg
      className={className}
      width={(height / h) * vw}
      height={(height / h) * vh}
      viewBox={`0 0 ${vw} ${vh}`}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      {title ? <title>{title}</title> : null}
      <g transform={`rotate(${rotation} ${vw / 2} ${vh / 2})`}>
        <rect
          x={bleed + stroke / 2}
          y={bleed + stroke / 2}
          width={w - stroke}
          height={h - stroke}
          rx={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
        />
        <text
          x={vw / 2}
          y={vh / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={color}
          fontFamily="var(--font-display), sans-serif"
          fontWeight={700}
          fontSize={h * STAMP.fontSize}
          letterSpacing={`${STAMP.fontSize * h * STAMP.tracking}`}
          style={{ textTransform: "uppercase" }}
        >
          {word}
        </text>
      </g>
    </svg>
  );
}
