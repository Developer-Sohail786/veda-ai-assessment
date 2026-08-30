"use client";

import { Sparkles } from "lucide-react";
import type { Answer } from "@/types/answer";
import type { MappingStatus } from "@/types/mapping";

interface AIInsightProps {
  status: MappingStatus;
  answer?: Answer;
}

function buildMessage(
  status: MappingStatus,
  answer?: Answer
): string {
  if (status === "unanswered") {
    return "No handwritten answer was matched to this question. The student may have skipped it, or it could be on a page that wasn't scanned.";
  }

  if (status === "unmatched" && answer) {
    return "This handwritten answer couldn't be matched to a question with confidence. Review it manually on the answer sheet.";
  }

  if (answer?.feedback) {
    return answer.feedback;
  }

  if (answer && answer.regions.length > 1) {
    const pages = answer.regions
      .map((region) => region.page)
      .join(", ");

    return `This answer was matched across ${answer.regions.length} regions on pages ${pages}.`;
  }

  if (answer) {
    return `Matched to a handwritten answer on page ${
      answer.regions[0]?.page ?? "?"
    }.`;
  }

  return "";
}

export default function AIInsight({
  status,
  answer,
}: AIInsightProps) {
  const message = buildMessage(status, answer);

  if (!message) return null;

  return (
    <div className="rounded-[14px] bg-[#F3F2F0] px-4 py-3.5">
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-tint)]">
          <Sparkles
            className="h-3 w-3 text-[var(--color-accent)]"
            strokeWidth={2}
          />
        </span>

        <p className="text-[13px] font-bold leading-5 text-[#3B3B3B]">
          AI Feedback
        </p>
      </div>

      <p className="mt-2 text-[13px] leading-[1.5] text-[#68655F]">
        {message}
      </p>

      {answer && (
        <blockquote className="mt-3 border-l-2 border-[#D4D1CC] pl-3 text-[13px] italic leading-[1.5] text-[#68655F]">
          &ldquo;{answer.text}&rdquo;
        </blockquote>
      )}
    </div>
  );
}