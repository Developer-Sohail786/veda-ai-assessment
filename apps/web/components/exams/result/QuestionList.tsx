"use client";

import { useState } from "react";
import QuestionCard from "./QuestionCard";
import Badge from "@/components/ui/Badge";
import type { Question } from "@/types/question";
import type { Answer } from "@/types/answer";
import type { Mapping } from "@/types/mapping";

interface QuestionListProps {
  questions: Question[];
  answers: Answer[];
  mappings: Mapping[];
  selectedQuestionId: string | null;
  onSelectQuestion: (questionId: string) => void;
}

export default function QuestionList({
  questions,
  answers,
  mappings,
  selectedQuestionId,
  onSelectQuestion,
}: QuestionListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [expandAll, setExpandAll] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedIds(new Set());
      setExpandAll(false);
    } else {
      setExpandedIds(new Set(questions.map((question) => question.id)));
      setExpandAll(true);
    }
  };

  const unmatched = mappings.filter(
    (mapping) => mapping.status === "unmatched"
  );

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[20px] bg-white">
      <header className="flex shrink-0 items-center justify-between px-5 pb-4 pt-5 md:px-6 md:pb-5 md:pt-6">
        <h2 className="text-[15px] font-extrabold leading-5 text-[var(--color-ink)]">
          Extracted Questions{" "}
          <span className="font-extrabold text-[var(--color-ink)]">
            (from question paper)
          </span>
        </h2>

        <button
          type="button"
          onClick={handleExpandAll}
          className="shrink-0 rounded-full border border-[#DCDAD6] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#3B3B3B] transition-colors hover:bg-[#F6F5F3]"
        >
          {expandAll ? "Collapse All" : "Expand All"}
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 sm:px-5 md:px-6 md:pb-6">
        <div className="flex flex-col gap-3">
          {questions.map((question) => {
            const mapping = mappings.find(
              (item) => item.questionId === question.id
            );

            const status = mapping?.status ?? "unanswered";

            const answer = answers.find(
              (item) => item.id === mapping?.answerId
            );

            return (
              <QuestionCard
                key={question.id}
                question={question}
                status={status}
                answer={answer}
                selected={selectedQuestionId === question.id}
                expanded={expandedIds.has(question.id)}
                onSelect={() => onSelectQuestion(question.id)}
                onToggleExpand={() => toggleExpand(question.id)}
              />
            );
          })}
        </div>

        {unmatched.length > 0 && (
          <div className="mt-5 pb-2">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-ink-faint)]">
                Unmatched answers
              </h3>

              <Badge tone="neutral">{unmatched.length}</Badge>
            </div>

            <div className="flex flex-col gap-2">
              {unmatched.map((mapping) => {
                const answer = answers.find(
                  (item) => item.id === mapping.answerId
                );

                if (!answer) return null;

                return (
                  <div
                    key={mapping.answerId}
                    className="rounded-[14px] bg-[#F4F3F1] p-4"
                  >
                    <p className="text-sm leading-5 text-[var(--color-ink-soft)]">
                      {answer.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}