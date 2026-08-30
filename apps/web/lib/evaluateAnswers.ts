import type { Question } from "@/types/question";
import type { Answer } from "@/types/answer";

export interface AnswerEvaluation {
  questionId: string;
  answerId: string | null;
  score: number;
}

export function evaluateAnswers(
  questions: Question[],
  answers: Answer[]
): AnswerEvaluation[] {
  return questions.map((question) => {
    const answer = answers.find(
      (item) =>
        item.questionNumber?.toLowerCase() === question.number.toLowerCase()
    );

    return {
      questionId: question.id,
      answerId: answer?.id ?? null,
      score: answer ? question.marks : 0,
    };
  });
}