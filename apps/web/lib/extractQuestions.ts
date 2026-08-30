import { generateObject } from "ai";
import { gemini } from "./gemini";
import { questionExtractionSchema } from "./schemas";

const marksByComplexity = {
  simple: 1,
  short: 2,
  moderate: 3,
  detailed: 5,
} as const;

function validateQuestions(
  questions: Array<{
    id: string;
    number: string;
    text: string;
    page: number;
    marks: number;
    marksSource: "paper" | "ai";
    complexity: "simple" | "short" | "moderate" | "detailed";
  }>
) {
  return questions
    .filter(
      (question) =>
        question.number.trim().length > 0 &&
        question.text.trim().length > 0
    )
    .map((question) => {
      if (question.marksSource === "paper") {
        return question;
      }

      return {
        ...question,
        marks: marksByComplexity[question.complexity],
      };
    });
}

async function extractWithPrompt(
  images: string[],
  systemPrompt: string
) {
  const { object } = await generateObject({
    model: gemini,
    schema: questionExtractionSchema,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `
The following image(s) are the actual exam question paper.

IMPORTANT:
- Inspect the image visually.
- Extract the questions that are visibly printed on the paper.
- Do not return an empty questions array if questions are visible.
- The question paper may contain printed numbers such as 1., 2., 11(a), 11(b), etc.
- Preserve those numbers exactly.
`,
          },

          ...images.map((image) => ({
            type: "file" as const,
            data: image,
            mediaType: "image/png" as const,
          })),
        ],
      },
    ],
  });

  return object.questions;
}

const basePrompt = `
You extract questions from an exam question paper.

The provided image is the question paper itself.

For every visible question:

EXTRACTION:
- Extract the EXACT question number exactly as it appears on the paper.
- Extract the question text accurately.
- Preserve the original printed order.
- Include the page number.
- Treat labelled sub-parts such as 11(a) and 11(b) as separate questions.
- Do not include headings, instructions, examples, or answers.
- Only extract actual questions printed on the paper.

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

PAGE NUMBER:
- The first supplied image is page 1.
- The second supplied image is page 2.
- Continue sequentially for additional images.
- Return the page containing the question.

MARKS:

First inspect the question paper carefully for explicitly printed marks.

IF MARKS ARE PRINTED:
- Use the exact printed mark value.
- Set marksSource to "paper".
- Do not modify the value.
- Determine complexity separately.

IF MARKS ARE NOT PRINTED:
- Set marksSource to "ai".
- Classify the question into exactly one complexity level.

simple:
A single definition, fact, identification, or very short response.

short:
A short answer, list, naming multiple items, or basic comparison.

moderate:
An explanation requiring several relevant points, steps, or concepts.

detailed:
A long explanation, multi-part response, derivation, analysis, or complex task.

For AI-estimated marks use exactly:
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

REQUIRED OUTPUT:
- Return at least one question whenever at least one actual question is visible in the supplied image.
- Do not return headings or instructions as questions.
- Do not invent questions that are not visible.
- Do not invent question numbers.
- Do not invent question text.

Return only structured question data.
`;

const retryPrompt = `
You are retrying extraction of an exam question paper because the previous
attempt incorrectly returned zero questions.

This is a VISUAL OCR task.

Look directly at the supplied image and identify every actual printed question.

The image contains an exam question paper. It is expected to contain visible
questions.

DO NOT return:
{
  "questions": []
}

if any question is visible.

Instead:

1. Read the printed question numbers directly from the image.
2. Read the corresponding question text.
3. Preserve the exact printed numbering.
4. Preserve lettered sub-parts such as 11(a) and 11(b).
5. Preserve printed order.
6. Include the correct page number.
7. Ignore headings, instructions and examples.
8. Do not invent content that cannot be seen.

QUESTION NUMBERING:
- "1." stays "1."
- "2." stays "2."
- "11(a)" stays "11(a)"
- "11(b)" stays "11(b)"
- Never sequentially renumber the questions.

MARKS:
If printed marks are visible, use them exactly and set marksSource to "paper".

If marks are not printed, classify complexity:

simple → 1
short → 2
moderate → 3
detailed → 5

Set marksSource to "ai" for estimated marks.

The final response must contain the questions that are actually visible
in the image.
`;

export async function extractQuestions(images: string[]) {
  if (!images.length) {
    throw new Error(
      "No question-paper images were provided."
    );
  }

  let firstError: unknown = null;

  /*
   * First extraction attempt.
   */
  try {
    console.info(
      "QUESTION EXTRACTION: attempt 1"
    );

    const questions = await extractWithPrompt(
      images,
      basePrompt
    );

    console.info(
      "QUESTION EXTRACTION: attempt 1 returned",
      questions.length,
      "questions"
    );

    const cleanedQuestions =
      validateQuestions(questions);

    if (cleanedQuestions.length > 0) {
      return cleanedQuestions;
    }

    console.warn(
      "QUESTION EXTRACTION: attempt 1 returned zero valid questions"
    );
  } catch (error) {
    firstError = error;

    console.warn(
      "QUESTION EXTRACTION: attempt 1 failed",
      error
    );
  }

  /*
   * Second attempt uses a deliberately different,
   * more explicit visual-extraction prompt.
   */
  console.info(
    "QUESTION EXTRACTION: retrying with visual OCR prompt"
  );

  try {
    const questions = await extractWithPrompt(
      images,
      retryPrompt
    );

    console.info(
      "QUESTION EXTRACTION: retry returned",
      questions.length,
      "questions"
    );

    const cleanedQuestions =
      validateQuestions(questions);

    if (cleanedQuestions.length > 0) {
      return cleanedQuestions;
    }

    throw new Error(
      "The model returned zero visible questions."
    );
  } catch (retryError) {
    console.error(
      "QUESTION EXTRACTION: retry failed",
      retryError
    );

    throw new Error(
      `Unable to extract questions from the question paper: ${
        retryError instanceof Error
          ? retryError.message
          : firstError instanceof Error
            ? firstError.message
            : "No questions were extracted."
      }`
    );
  }
}