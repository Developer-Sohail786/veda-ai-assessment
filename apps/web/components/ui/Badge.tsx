import { type ReactNode } from "react";

type Tone = "success" | "danger" | "neutral" | "accent";

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const tones: Record<Tone, string> = {
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  danger: "bg-[var(--color-danger-bg)] text-[var(--color-danger)]",
  neutral: "bg-[var(--color-panel-muted)] text-[var(--color-ink-soft)]",
  accent: "bg-[var(--color-accent-tint)] text-[var(--color-accent-dark)]",
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
