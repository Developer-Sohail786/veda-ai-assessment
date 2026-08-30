"use client";

import { useId, useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";

import FilePreview from "./FilePreview";
import {
  estimatePageCountForPreview,
  formatFileSize,
  isAcceptedFileType,
  isWithinSizeLimit,
  MAX_FILE_SIZE_MB,
} from "@/lib/upload-validation";
import type { UploadedFileMeta } from "@/types/assessment";

interface UploadCardProps {
  label: string;
  highlight: string;
  fileMeta: UploadedFileMeta | null;
  onSelect: (meta: UploadedFileMeta) => void;
  onRemove: () => void;
}

export default function UploadCard({
  label,
  highlight,
  fileMeta,
  onSelect,
  onRemove,
}: UploadCardProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!isAcceptedFileType(file)) {
      setError("Please upload a PDF, PNG, or JPG file.");
      return;
    }

    if (!isWithinSizeLimit(file)) {
      setError(`File is larger than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const pageCount = await estimatePageCountForPreview(file);

    onSelect({
      file,
      name: file.name,
      sizeLabel: formatFileSize(file.size),
      pageCount,
    });
  }

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      void handleFile(file);
    }
  }


  if (fileMeta) {
    return (
      <div
        className="
          flex w-full items-center justify-center
          rounded-[18px]
          bg-white
          px-3 py-2.5
          min-h-[118px]
          sm:min-h-[145px]
          md:min-h-[165px]
          md:px-6 md:py-5
        "
      >
        <FilePreview
          fileName={fileMeta.name}
          sizeLabel={fileMeta.sizeLabel}
          pageCount={fileMeta.pageCount}
          isPdf={fileMeta.file.type === "application/pdf"}
          onRemove={onRemove}
        />
      </div>
    );
  }

 
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={[
          "flex w-full cursor-pointer flex-col items-center justify-center",
          "rounded-[16px] border border-dashed",
          "bg-white text-center",
          "px-3",
          "min-h-[118px]",
          "py-2.5",
          "sm:min-h-[145px] sm:py-5",
          "md:min-h-[165px] md:px-4 md:py-6",
          "transition-all duration-200",
          "focus-within:border-[var(--color-accent)]",
          dragActive
            ? "scale-[1.01] border-[var(--color-accent)] bg-[var(--color-accent-tint-2)]"
            : "border-[#DCDAD6] hover:border-[var(--color-accent)]",
        ].join(" ")}
      >
        {/* Upload icon */}
        <span
          className="
            mb-1.5
            flex h-[34px] w-[34px]
            items-center justify-center
            rounded-[10px]
            bg-[#F6F6F6]
            sm:mb-2.5
            sm:h-[40px] sm:w-[40px]
            md:mb-3 md:h-[42px] md:w-[42px]
          "
        >
          <Upload
            className="
              h-[17px] w-[17px]
              text-[var(--color-ink)]
              sm:h-[20px] sm:w-[20px]
              md:h-[21px] md:w-[21px]
            "
            strokeWidth={2}
          />
        </span>

        {/* Upload label */}
        <span className="text-[13px] font-bold leading-5 text-[var(--color-ink)] sm:text-[14px] md:text-[15px]">
          {label}{" "}
          <span className="text-[var(--color-accent)] md:underline md:decoration-[1.5px] md:underline-offset-[2px]">
            {highlight}
          </span>
        </span>

        {/* Size */}
        <span className="mt-0.5 text-[10px] text-[var(--color-ink-faint)] sm:mt-1 md:mt-1.5 md:text-xs">
          Max {MAX_FILE_SIZE_MB}MB
        </span>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];

            if (file) {
              void handleFile(file);
            }

            e.target.value = "";
          }}
        />
      </label>

      {error && (
        <p
          role="alert"
          className="mt-2 text-xs font-medium text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </div>
  );
}