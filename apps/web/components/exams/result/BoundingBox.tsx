import type { AnswerRegion } from "@/types/answer";

interface BoundingBoxProps {
  region: AnswerRegion;
  label?: string;
  active?: boolean;
  text?: string;
}

export default function BoundingBox({
  region,
  label,
  active = false,
  text,
}: BoundingBoxProps) {
  const [ymin, xmin, ymax, xmax] = region.box_2d;

  const top = ymin / 10;
  const left = xmin / 10;
  const height = (ymax - ymin) / 10;
  const width = (xmax - xmin) / 10;

  return (
    <div
      className={`absolute flex items-start rounded-[6px] border-2 p-2 transition-colors ${
        active
          ? "z-10 border-[var(--color-success)] bg-[var(--color-success-bg)]/60"
          : "border-transparent"
      }`}
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: `${width}%`,
        height: `${height}%`,
      }}
    >
      {active && label && (
        <span className="absolute -left-0.5 -top-3 rounded-[5px] bg-[var(--color-success)] px-1.5 py-0.5 text-[10px] font-bold leading-3 text-white">
          {label}
        </span>
      )}

      {active && text && (
        <p className="line-clamp-[8] text-xs leading-relaxed text-[var(--color-ink)] md:text-sm">
          {text}
        </p>
      )}
    </div>
  );
}