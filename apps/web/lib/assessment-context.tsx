"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AssessmentResult } from "@/types/assessment";

interface AssessmentContextValue {
  questionPaper: File | null;
  answerSheet: File | null;
  setFiles: (files: { questionPaper?: File | null; answerSheet?: File | null }) => void;
  result: AssessmentResult | null;
  setResult: (result: AssessmentResult | null) => void;
  error: string | null;
  setError: (error: string | null) => void;
  reset: () => void;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [questionPaper, setQuestionPaper] = useState<File | null>(null);
  const [answerSheet, setAnswerSheet] = useState<File | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const value = useMemo<AssessmentContextValue>(
    () => ({
      questionPaper,
      answerSheet,
      setFiles: (files) => {
        if ("questionPaper" in files) setQuestionPaper(files.questionPaper ?? null);
        if ("answerSheet" in files) setAnswerSheet(files.answerSheet ?? null);
      },
      result,
      setResult,
      error,
      setError,
      reset: () => {
        setQuestionPaper(null);
        setAnswerSheet(null);
        setResult(null);
        setError(null);
      },
    }),
    [questionPaper, answerSheet, result, error]
  );

  return (
    <AssessmentContext.Provider value={value}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);

  if (!ctx) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }

  return ctx;
}