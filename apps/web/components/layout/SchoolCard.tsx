import Image from "next/image";

interface SchoolCardProps {
  name: string;
  location: string;
  collapsed?: boolean;
}

export default function SchoolCard({
  name,
  location,
  collapsed = false,
}: SchoolCardProps) {
  const crest = (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white p-1.5">
      <Image
        src="/images/school-crest.png"
        alt={`${name} crest`}
        fill
        sizes="36px"
        className="object-contain p-1"
      />
    </div>
  );

  if (collapsed) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl bg-[var(--color-panel-muted)] p-2"
        title={name}
      >
        {crest}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[var(--color-panel-muted)] p-3">
      {crest}
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-[var(--color-ink)]">
          {name}
        </p>
        <p className="truncate text-xs text-[var(--color-ink-faint)]">
          {location}
        </p>
      </div>
    </div>
  );
}
