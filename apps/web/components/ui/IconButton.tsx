import { type ButtonHTMLAttributes, type ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  active?: boolean;
  showDot?: boolean;
  size?: "sm" | "md";
}

export default function IconButton({
  icon,
  label,
  active = false,
  showDot = false,
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  const dimensions = size === "sm" ? "h-8 w-8" : "h-9 w-9 md:h-10 md:w-10";
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative inline-flex ${dimensions} shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2 ${
        active
          ? "bg-[var(--color-panel-muted)] text-[var(--color-ink)]"
          : "bg-white text-[var(--color-ink-soft)] hover:bg-[var(--color-panel-muted)]"
      } ${className}`}
      {...props}
    >
      {icon}
      {showDot && (
        <span
          aria-hidden="true"
          className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--color-accent)] ring-2 ring-white"
        />
      )}
    </button>
  );
}
