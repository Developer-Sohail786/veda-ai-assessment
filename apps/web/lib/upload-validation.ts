

const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const;

export const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function isAcceptedFileType(file: File): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);
}

export function isWithinSizeLimit(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}

export function formatFileSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}


export async function estimatePageCountForPreview(
  file: File
): Promise<number | null> {
  if (file.type !== "application/pdf") return null;
  const estimated = Math.max(1, Math.round(file.size / 55_000));
  return Math.min(estimated, 12);
}
