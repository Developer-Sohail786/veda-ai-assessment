import { generateObject } from "ai";
import { gemini } from "./gemini";
import { questionExtractionSchema } from "./schemas";

const systemPrompt = `
You are an exam question-paper extraction system.

Your ONLY task is to inspect the provided exam question-paper images
and extract the actual questions visible in them.

IMPORTANT:
- Carefully inspect the image visually.
- Extract EVERY visible question.
- Preserve the original printed order.
- Do not invent questions.
- Do not omit clearly visible questions.
- Do not return an empty questions array if questions are visible.

QUESTION NUMBERING:
- Extract the question number EXACTLY as printed.
- NEVER renumber questions.
- NEVER replace a printed number with a sequential number.
- Preserve letters, parentheses, dots, and other meaningful labels.
- If the paper shows "11(a)", return "11(a)".
- If the paper shows "11(b)", return "11(b)".
- "11(a)" and "11(b)" MUST be returned as separate questions.
- Do not convert "11(a)" into "6", "7", or "11".
- Do not assume question numbers are sequential.
- If numbering skips from 5 to 11(a), preserve the printed numbering.

QUESTION TEXT:
- Transcribe the actual question accurately.
- Preserve the meaning of the original question.
- Do not include headings or general instructions.
- Do not include sample answers.
- Do not include marks as part of the question text unless the marks are naturally part of the printed question.

PAGE:
- Return the page number on which the question appears.
- Page numbering starts at 1.
- If a question appears on page 2, return page: 2.

MARKS:

First determine whether marks are explicitly printed for the question.

IF MARKS ARE PRINTED:
- Use the exact printed mark value.
- Set marksSource to "paper".
- Do not modify the printed value.

IF MARKS ARE NOT PRINTED:
- Set marksSource to "ai".
- Determine the expected complexity of the QUESTION.

simple:
A single definition, fact, identification, or very short response.

short:
A short answer, list, naming multiple items, or basic comparison.

moderate:
An explanation requiring several relevant points, steps, or concepts.

detailed:
A long explanation, multi-part response, derivation, analysis, or complex task.

AI MARK MAPPING:
- simple → 1
- short → 2
- moderate → 3
- detailed → 5

Never use 4 marks for AI-estimated questions.
Never use 0 marks.

IMPORTANT:
The complexity describes what the question expects from the student,
NOT what the student actually answered.

OUTPUT:
Return structured question data only.
`;

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const commaIndex = dataUrl.indexOf(",");

  if (commaIndex === -1) {
    throw new Error(
      "Invalid image data URL."
    );
  }

  const base64 = dataUrl.slice(
    commaIndex + 1
  );

  return new Uint8Array(
    Buffer.from(base64, "base64")
  );
}

async function extractQuestionsOnce(
  images: string[]
) {
  const { object } = await generateObject({
    model: gemini,
    schema: questionExtractionSchema,
    system: systemPrompt,

    messages: [
      {
        role: "user",
        content: images.map((image) => ({
          type: "file" as const,
          data: dataUrlToBytes(image),
          mediaType: "image/png",
        })),
      },
    ],
  });

  return object.questions;
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
        marksByComplexity[
          question.complexity
        ],
    };
  });
}

export async function extractQuestions(
  images: string[]
) {
  if (!images.length) {
    throw new Error(
      "No question-paper images were generated."
    );
  }

  let lastError: unknown;

  /*
   * First extraction attempt.
   */
  try {
    console.log(
      "QUESTION EXTRACTION: attempt 1"
    );

    const questions =
      await extractQuestionsOnce(images);

    console.log(
      "QUESTION EXTRACTION: attempt 1 returned",
      questions.length,
      "questions"
    );

    if (questions.length > 0) {
      return applyAIMarks(questions);
    }

    lastError = new Error(
      "The AI returned zero questions."
    );
  } catch (error) {
    lastError = error;

    console.warn(
      "QUESTION EXTRACTION: attempt 1 failed",
      error
    );
  }

  /*
   * Retry with the same image data.
   * The schema requires at least one question,
   * so a successful response must contain
   * actual extracted questions.
   */
  try {
    console.log(
      "QUESTION EXTRACTION: retrying"
    );

    const questions =
      await extractQuestionsOnce(images);

    console.log(
      "QUESTION EXTRACTION: retry returned",
      questions.length,
      "questions"
    );

    if (questions.length > 0) {
      return applyAIMarks(questions);
    }

    lastError = new Error(
      "The AI returned zero questions on the retry."
    );
  } catch (error) {
    lastError = error;

    console.error(
      "QUESTION EXTRACTION: retry failed",
      error
    );
  }

  throw new Error(
    lastError instanceof Error
      ? `Unable to extract questions from the question paper: ${lastError.message}`
      : "Unable to extract questions from the question paper."
  );
}