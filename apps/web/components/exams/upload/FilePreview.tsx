import Image from "next/image";
import { ImageIcon, X } from "lucide-react";

interface FilePreviewProps {
  fileName: string;
  sizeLabel: string;
  pageCount: number | null;
  isPdf: boolean;
  onRemove: () => void;
}

export default function FilePreview({
  fileName,
  sizeLabel,
  pageCount,
  isPdf,
  onRemove,
}: FilePreviewProps) {
  return (
    <div className="flex w-full items-center gap-3 rounded-2xl bg-[var(--color-panel-muted)] px-4 py-3.5">
      {isPdf ? (
        <span className="relative h-9 w-9 shrink-0">
          <Image
            src="/images/pdf-file-icon.png"
            alt=""
            fill
            sizes="36px"
            className="object-contain"
          />
        </span>
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white">
          <ImageIcon className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-bold text-[var(--color-ink)]">
          {fileName}
        </p>
        <p className="text-xs text-[var(--color-ink-faint)]">
          {sizeLabel}
          {pageCount !== null ? ` \u2022 ${pageCount} Page${pageCount === 1 ? "" : "s"}` : ""}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Remove ${fileName}`}
        onClick={onRemove}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-white hover:bg-black"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
