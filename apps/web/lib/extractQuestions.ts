import { generateObject } from "ai";
import { gemini } from "./gemini";
import { questionExtractionSchema } from "./schemas";

const systemPrompt = `
You extract questions from an exam question paper.

For every question:
- Extract the EXACT question number exactly as it appears on the question paper.
- Extract the question text accurately.
- Preserve the original printed order.
- Include the page number.
- Treat labelled sub-parts such as 11(a) and 11(b) as separate questions.
- Do not include headings, instructions, examples, or answers.

QUESTION NUMBERING — CRITICAL:
- NEVER renumber questions.
- NEVER replace the printed question number with a sequential number.
- The printed question number is authoritative.
- If the paper shows "11(a)", return exactly "11(a)".
- If the paper shows "11(b)", return exactly "11(b)".
- Keep the lettered sub-part attached to its parent number.
- Preserve parentheses, letters, and other meaningful sub-part labels.
- Do not convert "11(a)" into "6", "7", "11", or any other number.
- Do not assume that question numbers are sequential.
- If numbering skips from 5 to 11(a), preserve that numbering exactly.
- If the paper contains 11(a) and 11(b), return TWO separate questions with numbers "11(a)" and "11(b)".

MARKS:

First inspect the question paper for explicitly printed marks.

IF MARKS ARE PRINTED:
- Use the exact printed mark value.
- Set marksSource to "paper".
- Do not modify the value.
- Determine complexity separately.

IF MARKS ARE NOT PRINTED:
- Set marksSource to "ai".
- DO NOT freely invent a mark value.
- First classify the question into exactly one complexity level:

simple:
A single definition, fact, identification, or very short response.

short:
A short answer, list, naming multiple items, or basic comparison.

moderate:
An explanation requiring several relevant points, steps, or concepts.

detailed:
A long explanation, multi-part response, derivation, analysis, or complex task.

For AI-estimated marks use this EXACT mapping:
- simple → 1 mark
- short → 2 marks
- moderate → 3 marks
- detailed → 5 marks

Do not use 4 marks for AI-estimated questions.
Do not assign 5 marks to simple or short questions.
Do not assign 2 marks to a simple definition merely because the answer could contain more detail.
Do not make all questions worth the same marks.

The complexity must describe the expected answer required by the QUESTION,
not the student's actual answer.

Never use 0 marks.

IMPORTANT EXTRACTION REQUIREMENT:
- The question paper contains one or more actual questions.
- You MUST extract every clearly visible question.
- Never intentionally return an empty questions array.
- If there are multiple pages, inspect all provided pages.
- Preserve every visible question and sub-question.
- Do not stop after identifying only the first few questions.

Return only structured question data.
`;

async function extractQuestionsOnce(images: string[]) {
  const { object } = await generateObject({
    model: gemini,
    schema: questionExtractionSchema,
    system: systemPrompt,
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

  return object.questions;
}

export async function extractQuestions(
  images: string[]
) {
  let lastError: unknown;

  // First attempt
  try {
    const questions = await extractQuestionsOnce(images);

    console.log(
      `Question extraction attempt 1 returned ${questions.length} questions`
    );

    if (questions.length > 0) {
      return applyAIMarks(questions);
    }
  } catch (error) {
    lastError = error;

    console.warn(
      "Question extraction attempt 1 failed:",
      error
    );
  }

  // Retry once
  try {
    console.log(
      "Retrying question extraction..."
    );

    const questions = await extractQuestionsOnce(images);

    console.log(
      `Question extraction attempt 2 returned ${questions.length} questions`
    );

    if (questions.length > 0) {
      return applyAIMarks(questions);
    }
  } catch (error) {
    lastError = error;

    console.error(
      "QUESTION EXTRACTION FINAL ERROR:",
      error
    );

    if (error instanceof Error) {
      console.error(
        "QUESTION EXTRACTION ERROR MESSAGE:",
        error.message
      );

      console.error(
        "QUESTION EXTRACTION ERROR STACK:",
        error.stack
      );
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Unable to extract questions from the question paper: ${lastError.message}`
      : "Unable to extract questions from the question paper."
  );
}

function applyAIMarks(
  questions: Awaited<
    ReturnType<typeof extractQuestionsOnce>
  >
) {
  const marksByComplexity = {
    simple: 1,
    short: 2,
    moderate: 3,
    detailed: 5,
  } as const;

  return questions.map((question) => {
    if (question.marksSource === "paper") {
      return question;
    }

    return {
      ...question,
      marks:
        marksByComplexity[question.complexity],
    };
  });
}