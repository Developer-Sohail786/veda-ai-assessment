import type { Question } from "@/types/question";
import type { Answer } from "@/types/answer";
import type { Mapping } from "@/types/mapping";
import type {
  AssessmentResult,
  AssessmentPage,
} from "@/types/assessment";

function isQuestion(value: unknown): value is Question {
  if (!value || typeof value !== "object") return false;

  const q = value as Record<string, unknown>;

  return (
    typeof q.id === "string" &&
    typeof q.number === "string" &&
    typeof q.text === "string" &&
    typeof q.page === "number" &&
    typeof q.marks === "number" &&
    (q.marksSource === "paper" || q.marksSource === "ai") &&
    (q.complexity === "simple" ||
      q.complexity === "short" ||
      q.complexity === "moderate" ||
      q.complexity === "detailed")
  );
}

function isAnswer(value: unknown): value is Answer {
  if (!value || typeof value !== "object") return false;

  const a = value as Record<string, unknown>;

  return (
    typeof a.id === "string" &&
    (a.questionNumber === null ||
      typeof a.questionNumber === "string") &&
    typeof a.text === "string" &&
    typeof a.score === "number" &&
    typeof a.feedback === "string" &&
    Array.isArray(a.regions)
  );
}

function isMapping(value: unknown): value is Mapping {
  if (!value || typeof value !== "object") return false;

  const m = value as Record<string, unknown>;

  return (
    (typeof m.questionId === "string" ||
      m.questionId === null) &&
    (typeof m.answerId === "string" ||
      m.answerId === null) &&
    (m.status === "answered" ||
      m.status === "unanswered" ||
      m.status === "unmatched")
  );
}

function isAssessmentPage(
  value: unknown
): value is AssessmentPage {
  if (!value || typeof value !== "object") return false;

  const p = value as Record<string, unknown>;

  return (
    typeof p.pageNumber === "number" &&
    typeof p.width === "number" &&
    typeof p.height === "number" &&
    typeof p.image === "string"
  );
}

export function isAssessmentResult(
  value: unknown
): value is AssessmentResult {
  if (!value || typeof value !== "object") return false;

  const r = value as Record<string, unknown>;

  return (
    Array.isArray(r.questions) &&
    Array.isArray(r.answers) &&
    Array.isArray(r.mappings) &&
    Array.isArray(r.answerSheetPages) &&
    r.questions.every(isQuestion) &&
    r.answers.every(isAnswer) &&
    r.mappings.every(isMapping) &&
    r.answerSheetPages.every(isAssessmentPage)
  );
}