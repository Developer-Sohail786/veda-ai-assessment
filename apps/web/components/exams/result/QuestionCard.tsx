"use client";

import { ChevronDown } from "lucide-react";
import AIInsight from "./AIInsight";
import type { Question } from "@/types/question";
import type { Answer } from "@/types/answer";
import type { MappingStatus } from "@/types/mapping";

interface QuestionCardProps {
  question: Question;
  status: MappingStatus;
  answer?: Answer;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export default function QuestionCard({
  question,
  status,
  answer,
  selected,
  expanded,
  onSelect,
  onToggleExpand,
}: QuestionCardProps) {
  const isAnswered = status === "answered";
  const isUnmatched = status === "unmatched";

  const scoreLabel =
    isAnswered && answer
      ? `${answer.score}/${question.marks}`
      : isUnmatched
        ? "Unmatched"
        : "Unanswered";

  const scoreRatio =
    isAnswered && answer && question.marks > 0
      ? answer.score / question.marks
      : 0;

  const scoreClass = !isAnswered
    ? isUnmatched
      ? "bg-[#FDE5E0] text-[#C94D38]"
      : "bg-[#F1F0EE] text-[#77736C]"
    : scoreRatio === 0
      ? "bg-[#FDE5E0] text-[#C94D38]"
      : scoreRatio < 0.6
        ? "bg-[#FFF0D9] text-[#C87519]"
        : "bg-[#DDF4E5] text-[#23864A]";

  return (
    <article className={`overflow-hidden rounded-[16px] border transition-all ${selected ? "border-[var(--color-accent)] bg-white shadow-sm" : "border-transparent bg-[#F5F4F2]"}`}>
      <div className="flex w-full items-start gap-3 px-4 py-4 md:px-5 md:py-[17px]">
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Select question ${question.number}`}
          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selected ? "bg-[var(--color-accent)] text-white" : "bg-[#111111] text-white"}`}
        >
          {question.number}
        </button>

        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block text-[14px] font-semibold leading-[1.5] text-[#333] md:text-[15px]">
            {question.text}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold leading-4 ${scoreClass}`}>
            {scoreLabel}
          </span>

          <button
            type="button"
            aria-label={expanded ? "Collapse question details" : "Expand question details"}
            aria-expanded={expanded}
            onClick={(event) => {
              event.stopPropagation();
              onToggleExpand();
            }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#77736C] hover:bg-white"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 md:px-5 md:pb-5">
          <AIInsight status={status} answer={answer} />
        </div>
      )}
    </article>
  );
}