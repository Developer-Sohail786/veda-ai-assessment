"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionList from "./QuestionList";
import AnswerSheetViewer from "./AnswerSheetViewer";
import ResultTabs from "./ResultTabs";
import { useAssessment } from "@/lib/assessment-context";

export default function ResultPage() {
  const router = useRouter();
  const { result } = useAssessment();

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    result?.questions[0]?.id ?? null
  );

  const [mobileTab, setMobileTab] = useState<
    "questions" | "answerSheet"
  >("questions");

  useEffect(() => {
    if (!result) {
      router.replace("/exams/upload");
    }
  }, [result, router]);

  const selection = useMemo(() => {
    if (!result || !selectedQuestionId) return null;

    const index = result.questions.findIndex(
      (question) => question.id === selectedQuestionId
    );

    const mapping = result.mappings.find(
      (mapping) => mapping.questionId === selectedQuestionId
    );

    const answer = result.answers.find(
      (answer) => answer.id === mapping?.answerId
    );

    return { index, answer };
  }, [result, selectedQuestionId]);

  if (!result) return null;

  function handleSelectQuestion(id: string) {
    setSelectedQuestionId(id);
    setMobileTab("answerSheet");
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ResultTabs
        active={mobileTab}
        onChange={setMobileTab}
      />

      <main className="grid min-h-0 flex-1 grid-cols-1 gap-3 px-3 pb-3 pt-3 md:grid-cols-[1.2fr_1fr] md:gap-4 md:px-4 md:pb-4 md:pt-4">
        <div
          className={`min-h-0 overflow-hidden ${
            mobileTab === "questions" ? "flex" : "hidden"
          } md:flex`}
        >
          <QuestionList
            questions={result.questions}
            answers={result.answers}
            mappings={result.mappings}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={handleSelectQuestion}
          />
        </div>

        <div
          className={`min-h-0 overflow-hidden ${
            mobileTab === "answerSheet" ? "flex" : "hidden"
          } md:flex`}
        >
          <AnswerSheetViewer
            key={selectedQuestionId ?? "no-selection"}
            answerSheetPages={result.answerSheetPages}
            selectedAnswer={selection?.answer}
            selectedLabel={
              selection && selection.index >= 0
                ? `Q${selection.index + 1}`
                : ""
            }
          />
        </div>
      </main>
    </div>
  );
}