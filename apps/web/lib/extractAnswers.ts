import { generateObject } from "ai";
import { gemini } from "./gemini";
import { answerExtractionSchema } from "./schemas";
import type { Question } from "@/types/question";

function normalizeQuestionNumber(value: string | null) {
  if (!value) return null;

  return value
    .trim()
    .toLowerCase()
    .replace(/^q/, "")
    .replace(/\s+/g, "")
    .replace(/\.+$/, "");
}

function clampScore(score: number, maxMarks: number) {
  if (!Number.isFinite(score)) return 0;

  return Math.min(
    Math.max(Math.round(score * 2) / 2, 0),
    maxMarks
  );
}

export async function extractAnswers(
  images: string[],
  questions: Question[]
) {
  const questionContext = questions
    .map(
      (question) =>
        `${question.number}: ${question.text} | Maximum marks: ${question.marks}`
    )
    .join("\n");

  const { object } = await generateObject({
    model: gemini,
    schema: answerExtractionSchema,
    system: `
You extract, evaluate, and grade handwritten answers from a student's answer sheet.

QUESTION PAPER:
${questionContext}

For every distinct handwritten answer:

EXTRACTION:
- Identify the question number if written.
- Transcribe the handwritten answer accurately.
- Identify every page containing the answer.
- Return a bounding box covering the exact handwritten answer.
- Coordinates must use [ymin, xmin, ymax, xmax].
- Coordinates are normalized from 0 to 1000.
- Do not include borders, margins, or blank areas.
- If an answer continues onto another page, return a region for each page.
- If an answer cannot clearly be associated with a question, use questionNumber null.

GRADING:

For each answer:
1. Find the corresponding question from the QUESTION PAPER.
2. Use that question's "Maximum marks" as the absolute maximum.
3. Evaluate only what the student actually wrote.
4. Compare the answer against the requirements of the question.
5. Award marks according to correctness, completeness, relevance, and accuracy.
6. Give partial marks when the answer contains some correct but incomplete information.
7. Give full marks only when the answer sufficiently answers the question.
8. Give 0 when the answer is incorrect, irrelevant, or effectively missing.
9. NEVER award more than the stated Maximum marks.
10. Do not give full marks merely because the answer contains keywords.
11. For list questions, check whether the required number of items was actually provided.
12. For comparison questions, check whether the required differences are actually explained.
13. For explanation questions, check whether the important requested concepts are covered.
14. Do not give credit for information the student did not write.

SCORING:
- score must be a number.
- score must be between 0 and the question's Maximum marks.
- Use whole or half marks when appropriate.
- Do not randomly give full marks.
- Do not give the same score to every answer.

FEEDBACK:
- Provide concise teacher-style feedback explaining the awarded score.
- Mention what the student did correctly.
- If marks were lost, explain what was missing or incorrect.
- If full marks were awarded, briefly explain why.
- Keep feedback to 1-3 sentences.
- Do not repeat the entire answer.
- Do not mention internal AI reasoning.

IMPORTANT:
The question's Maximum marks are authoritative.
Do not change them while grading.
Do not invent additional marks.
`,
    messages: [
      {
        role: "user",
        content: images.map((image) => ({
          type: "file" as const,
          data: image,
          mediaType: "image/png",
        })),
      },
    ],
  });

  return object.answers.map((answer) => {
    const normalizedNumber = normalizeQuestionNumber(
      answer.questionNumber
    );

    const question = questions.find(
      (item) =>
        normalizeQuestionNumber(item.number) === normalizedNumber
    );

    if (!question) {
      return {
        ...answer,
        score: 0,
        feedback:
          answer.feedback ||
          "This answer could not be confidently matched to a question.",
      };
    }

    return {
      ...answer,
      score: clampScore(answer.score, question.marks),
      feedback:
        answer.feedback ||
        "The answer was evaluated against the requirements of the question.",
    };
  });
}