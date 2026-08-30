import {
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AnswerSheetToolbarProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

const ZOOM_MIN = 50;
const ZOOM_MAX = 200;
const ZOOM_STEP = 10;

export default function AnswerSheetToolbar({
  zoom,
  onZoomChange,
  page,
  pageCount,
  onPageChange,
}: AnswerSheetToolbarProps) {
  return (
    <div className="flex h-[64px] shrink-0 items-center justify-between bg-[#30302E] px-4 md:px-5">
      <h2 className="text-[15px] font-extrabold text-white">
        Answer Sheet
      </h2>

      <div className="flex items-center gap-2">
        {/* Zoom */}
        <div className="flex h-9 items-center rounded-full bg-[#444441] px-1">
          <button
            type="button"
            aria-label="Zoom out"
            disabled={zoom <= ZOOM_MIN}
            onClick={() =>
              onZoomChange(Math.max(ZOOM_MIN, zoom - ZOOM_STEP))
            }
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" strokeWidth={2} />
          </button>

          <span className="w-11 text-center text-[11px] font-bold text-white">
            {zoom}%
          </span>

          <button
            type="button"
            aria-label="Zoom in"
            disabled={zoom >= ZOOM_MAX}
            onClick={() =>
              onZoomChange(Math.min(ZOOM_MAX, zoom + ZOOM_STEP))
            }
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Pages */}
        <div className="flex h-9 items-center rounded-full bg-[#444441] px-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} />
          </button>

          <span className="min-w-[82px] px-1 text-center text-[11px] font-bold text-white">
            Page {page} of {pageCount}
          </span>

          <button
            type="button"
            aria-label="Next page"
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}