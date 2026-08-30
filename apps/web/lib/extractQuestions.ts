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
  text: string,
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
The following text was extracted directly from the actual exam question
paper PDF.

IMPORTANT:
- This is the native text content of the question paper, not a student's
  answer sheet.
- Extract every actual question present in the supplied text.
- Preserve the printed question numbers exactly.
- Do not renumber questions.
- Do not invent missing questions.
- The PDF text may contain page separators such as "-- 1 of 1 --".
- Use those separators to determine page numbers when possible.
- Ignore headings, instructions, headers, footers, and page-number text.

EXAM QUESTION PAPER TEXT:

${text}
`,
          },
        ],
      },
    ],
  });

  return object.questions;
}

const basePrompt = `
You are an expert exam-paper text extraction and structuring system.

You are given text extracted directly from an exam question-paper PDF.

Your job is to identify and structure every actual question contained in the
text.

WHAT COUNTS AS A QUESTION:
- Any numbered or lettered item asking the student to answer, explain, define,
  list, solve, draw, calculate, compare, identify, or respond in any way.
- Sub-parts such as 11(a), 11(b), 2(i), 2(ii), Q3.a, Q3.b are each their own
  separate question.
- A question may span multiple lines. Capture the complete question text.

WHAT IS NOT A QUESTION:
- Section headings.
- General instructions.
- Worked examples or sample solutions.
- Page headers and footers.
- Page numbers.
- Watermarks.
- Marks-only text when it is not part of a question.

QUESTION NUMBERING — CRITICAL:
- The printed question number is authoritative.
- NEVER renumber questions sequentially.
- NEVER invent skipped numbers.
- NEVER replace a printed number with another number.
- Preserve labels such as:
  - 1.
  - 2.
  - 11(a)
  - 11(b)
  - 2(i)
  - 2(ii)
- If the paper jumps from 5. to 11(a), preserve that jump.
- Sub-parts must remain separate questions.

TEXT:
- Preserve the question text accurately.
- Do not paraphrase or summarize.
- Correct only obvious extraction/OCR artifacts.
- Do not invent information that is not present in the PDF text.

PAGE NUMBER:
- Use the page number associated with where the question appears.
- The extracted text may contain markers such as:
  "-- 1 of 1 --"
  "-- 1 of 2 --"
  "-- 2 of 2 --"
- Use those markers when determining the page.
- If the document has one page, questions belong to page 1.
- If a question begins on one page and continues onto another, use the page
  where its number/label first appears.

MARKS:

First inspect the question text for explicitly printed marks such as:

[1 mark]
[2 marks]
[5 marks]
(2 marks)
5M
etc.

IF MARKS ARE PRINTED:
- Use the exact printed mark value.
- Set marksSource to "paper".
- Do not modify the value.
- Still determine complexity separately.

IF MARKS ARE NOT PRINTED:
- Set marksSource to "ai".
- Determine complexity from the expected answer.

simple:
A single definition, fact, identification, or very short response.

short:
A short answer, list, naming multiple items, or basic comparison.

moderate:
An explanation requiring several relevant points, steps, or concepts.

detailed:
A long explanation, multi-part response, derivation, analysis, or complex
task.

For AI-estimated marks use exactly:
- simple → 1 mark
- short → 2 marks
- moderate → 3 marks
- detailed → 5 marks

Never use 4 marks for AI-estimated questions.
Never use 0 marks.

IMPORTANT:
The complexity describes the expected answer required by the question, NOT
the student's actual answer.

REQUIRED OUTPUT:
- Return every actual question present in the supplied text.
- If actual questions are present, do not return an empty questions array.
- Do not return headings or instructions as questions.
- Do not invent questions.
- Preserve original numbering and order.

Return only structured question data.
`;

const retryPrompt = `
You are retrying extraction of an exam question paper because the previous
attempt returned zero valid questions.

The supplied text is extracted directly from a real exam question paper.
Your job is to identify every actual question in that text.

Do NOT return an empty questions array if question text is present.

STEP-BY-STEP:
1. Read the entire supplied text.
2. Identify every distinct question.
3. Identify its exact printed number or label.
4. Capture the complete question text.
5. Determine its page from page separators when available.
6. Determine printed marks when explicitly present.
7. Estimate marks only when printed marks are absent.
8. Return the questions in their original order.

NUMBERING:
- Never sequentially renumber.
- Never fill skipped numbers.
- Preserve labels exactly:
  "1.", "2.", "11(a)", "11(b)", etc.
- Sub-parts are separate questions.

IGNORE:
- Headings.
- Instructions.
- Page headers/footers.
- Page numbers.
- Worked examples.
- Non-question text.

MARKS:
If printed marks exist, use them and set marksSource to "paper".

Otherwise:
- simple → 1
- short → 2
- moderate → 3
- detailed → 5

Never use 4 or 0 for AI-estimated marks.

TEXT:
Preserve the supplied question wording accurately.
Do not paraphrase.
Do not invent missing content.

Return every actual question found in the supplied PDF text.
`;

export async function extractQuestions(text: string) {
  if (!text || text.trim().length === 0) {
    throw new Error(
      "No question-paper text was extracted."
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
      text,
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
   * Retry with a more explicit extraction prompt.
   */
  console.info(
    "QUESTION EXTRACTION: retrying with text extraction prompt"
  );

  try {
    const questions = await extractWithPrompt(
      text,
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
      "The model returned zero questions."
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