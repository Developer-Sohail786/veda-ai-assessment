import { answerMappingSchema } from "./schemas";

type Question = {
  id: string;
  number: string;
  text: string;
  page: number;
};

type Answer = {
  id: string;
  questionNumber: string | null;
  text: string;
  regions: {
    page: number;
    box_2d: number[];
  }[];
};

function normalizeNumber(value: string | null): string | null {
  if (!value) return null;

  return value
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/^q/, "")
    .replace(/[.]/g, "");
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
  );
}

function textSimilarity(
  questionText: string,
  answerText: string
): number {
  const questionWords = tokenize(questionText);
  const answerWords = tokenize(answerText);

  if (!questionWords.size || !answerWords.size) {
    return 0;
  }

  let matches = 0;

  for (const word of questionWords) {
    if (answerWords.has(word)) {
      matches++;
    }
  }

  return matches / questionWords.size;
}

function hasExplicitQuestionNumber(
  answer: Answer
): boolean {
  return Boolean(answer.questionNumber?.trim());
}

export function mapAnswers(
  questions: Question[],
  answers: Answer[]
) {
  const mappings: {
    questionId: string | null;
    answerId: string | null;
    status:
      | "answered"
      | "unanswered"
      | "unmatched";
  }[] = [];

  const usedAnswers = new Set<string>();

  for (const question of questions) {
    const questionNumber = normalizeNumber(
      question.number
    );

    if (!questionNumber) {
      continue;
    }

    const matchedAnswer = answers.find(
      (answer) =>
        !usedAnswers.has(answer.id) &&
        hasExplicitQuestionNumber(answer) &&
        normalizeNumber(answer.questionNumber) ===
          questionNumber
    );

    if (matchedAnswer) {
      usedAnswers.add(matchedAnswer.id);

      mappings.push({
        questionId: question.id,
        answerId: matchedAnswer.id,
        status: "answered",
      });
    } else {
      mappings.push({
        questionId: question.id,
        answerId: null,
        status: "unanswered",
      });
    }
  }

  
  const mappingByQuestion = new Map(
    mappings
      .filter((mapping) => mapping.questionId !== null)
      .map((mapping) => [
        mapping.questionId as string,
        mapping,
      ])
  );

  for (const question of questions) {
    const existingMapping = mappingByQuestion.get(
      question.id
    );

    if (
      existingMapping?.status === "answered"
    ) {
      continue;
    }

    let bestAnswer: Answer | undefined;
    let bestScore = 0;

    for (const answer of answers) {
      if (usedAnswers.has(answer.id)) continue;

    
      if (hasExplicitQuestionNumber(answer)) {
        continue;
      }

      const score = textSimilarity(
        question.text,
        answer.text
      );

      if (score > bestScore) {
        bestScore = score;
        bestAnswer = answer;
      }
    }

    if (bestAnswer && bestScore >= 0.25) {
      usedAnswers.add(bestAnswer.id);

      const mapping = mappings.find(
        (item) => item.questionId === question.id
      );

      if (mapping) {
        mapping.answerId = bestAnswer.id;
        mapping.status = "answered";
      }
    }
  }


  for (const answer of answers) {
    if (usedAnswers.has(answer.id)) {
      continue;
    }

    mappings.push({
      questionId: null,
      answerId: answer.id,
      status: "unmatched",
    });
  }

  return answerMappingSchema.parse({
    mappings,
  }).mappings;
}