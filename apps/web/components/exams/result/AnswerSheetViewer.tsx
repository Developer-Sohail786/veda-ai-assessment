"use client";

import { useState } from "react";
import Image from "next/image";
import AnswerSheetToolbar from "./AnswerSheetToolbar";
import BoundingBox from "./BoundingBox";
import type { Answer } from "@/types/answer";
import type { AssessmentPage } from "@/types/assessment";

interface AnswerSheetViewerProps {
  answerSheetPages: AssessmentPage[];
  selectedAnswer: Answer | undefined;
  selectedLabel: string;
}

export default function AnswerSheetViewer({
  answerSheetPages,
  selectedAnswer,
  selectedLabel,
}: AnswerSheetViewerProps) {
  const pageCount = Math.max(1, answerSheetPages.length);

  const [page, setPage] = useState(
    selectedAnswer?.regions[0]?.page ?? 1
  );
  const [zoom, setZoom] = useState(100);

  const currentPage = answerSheetPages.find(
    (item) => item.pageNumber === page
  );

  const regionsOnPage =
    selectedAnswer?.regions.filter(
      (region) => region.page === page
    ) ?? [];

  const answerLabel = selectedAnswer?.questionNumber
    ? `Q${selectedAnswer.questionNumber.replace(/\.$/, "")}`
    : selectedLabel;

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-t-[20px] bg-[#30302E]">
      <AnswerSheetToolbar
        zoom={zoom}
        onZoomChange={setZoom}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#30302E] scrollbar-thin">
        {currentPage ? (
          <div className="flex min-h-full w-full justify-center">
            <div
              className="relative shrink-0 overflow-hidden bg-[#FBFAF6]"
              style={{
                width: `${zoom}%`,
                maxWidth: 760,
                aspectRatio: `${currentPage.width} / ${currentPage.height}`,
              }}
            >
              <Image
                src={currentPage.image}
                alt={`Scanned answer sheet, page ${page}`}
                fill
                unoptimized
                sizes="760px"
                className="object-contain"
                priority={page === 1}
              />

              {regionsOnPage.map((region, index) => (
                <BoundingBox
                  key={`${region.page}-${index}`}
                  region={region}
                  active
                  label={answerLabel}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex min-h-full items-center justify-center text-sm text-white/60">
            Answer sheet page unavailable.
          </div>
        )}

        {!selectedAnswer && currentPage && (
          <p className="px-4 pb-4 pt-3 text-center text-sm text-white/60">
            Select a question to highlight its answer here.
          </p>
        )}
      </div>
    </section>
  );
}