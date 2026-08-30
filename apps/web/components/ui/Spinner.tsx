interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

export default function Spinner({
  size = 20,
  className = "",
  label = "Loading",
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
