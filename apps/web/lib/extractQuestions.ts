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
The following image(s) are the actual exam question paper, in page order
(image 1 = page 1, image 2 = page 2, and so on).

IMPORTANT:
- Inspect every image visually and carefully, top to bottom, before answering.
- These images are real scanned/rendered exam papers. They WILL contain visible,
  legible questions unless the page is truly blank.
- Extract every question that is visibly printed on the paper.
- Do not return an empty questions array if any question is visible, even
  partially legible, blurry, or low resolution.
- The question paper may contain printed numbers such as 1., 2., 11(a), 11(b),
  Q1, Q.1, (i), (ii), etc. Preserve those numbers exactly as printed.
- If text looks faint, small, rotated, or slightly cropped, still make your best
  accurate reading of it rather than skipping it.
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
You are an expert exam-paper OCR and structuring system.

You extract questions from a scanned/rendered exam question paper image.
The image(s) supplied to you ARE the actual question paper pages. Assume
questions are present and visible unless a page is genuinely blank —
producing an empty result is the least likely correct answer, not the
default one.

HOW TO WORK (do this internally before producing output):
1. Scan each image fully, from top to bottom, left to right (and column by
   column if the layout has multiple columns).
2. Identify every element that is a printed question — i.e. something a
   student is being asked to answer.
3. For each one, locate its exact printed question number/label immediately
   to its left or above it.
4. Only after reading the whole page do you assemble the final list, in the
   original printed order.

WHAT COUNTS AS A QUESTION:
- Any numbered or lettered item asking the student to answer, explain,
  define, list, solve, draw, calculate, compare, identify, or respond in
  any way.
- Sub-parts such as 11(a), 11(b), 2(i), 2(ii), Q3.a, Q3.b are each their own
  separate question and must be extracted individually, never merged into
  their parent number and never merged with each other.
- A question may span multiple lines, include a passage/diagram/table
  reference, or continue below a figure — this is still one single question;
  capture its full text.

WHAT IS NOT A QUESTION (do not extract these as questions):
- Section headings (e.g. "Section A", "Part II — Long Answer").
- General instructions (e.g. "Attempt all questions", "Time: 3 hours",
  "Answer any five of the following").
- Worked examples, sample answers, or solutions.
- Page headers, footers, running titles, school name/logo blocks, page
  numbers, watermarks, roll-number boxes.
- Blank answer lines, ruled space, or diagram boxes with no question text.

EXTRACTION RULES:
- Extract the EXACT question number/label exactly as it appears on the paper,
  including punctuation style if meaningful (e.g. "1." vs "Q1" — preserve
  whichever form is actually printed).
- Extract the question text accurately and completely, exactly as printed
  (correct only obvious OCR-level misreads of individual characters; never
  paraphrase or summarize).
- Preserve the original printed order, top to bottom, page by page.
- Include the correct page number for every question (see PAGE NUMBER below).
- Do not combine two separate printed questions into one entry.
- Do not split a single printed question into multiple entries.

QUESTION NUMBERING — CRITICAL, HIGHEST PRIORITY RULE:
- The printed question number on the page is authoritative and must be
  reproduced exactly as printed. You are transcribing it, not generating it.
- NEVER renumber questions sequentially.
- NEVER replace a printed number/label with a different one.
- NEVER "fix", "normalize", or "clean up" the numbering.
- Preserve non-sequential numbering exactly as printed. If the paper jumps
  from "5." to "11(a)", the output must jump from "5" to "11(a)" too — do
  not fill in "6", "7", "8", "9", "10".
- Keep lettered/roman sub-parts attached to their parent number exactly as
  printed: "11(a)" stays "11(a)", "11(b)" stays "11(b)", "2(i)" stays "2(i)".
- If the paper contains 11(a) and 11(b), return TWO separate question
  entries with numbers "11(a)" and "11(b)" — never a single "11" entry,
  and never renumbered as separate top-level numbers.
- Preserve all parentheses, periods, letters, roman numerals, and other
  printed labeling exactly as shown.
- Do not assume question numbers are sequential, continuous, or restart at 1
  per page — trust only what is printed.

PAGE NUMBER:
- The first supplied image is page 1.
- The second supplied image is page 2.
- Continue sequentially for additional images, in the order supplied.
- Assign each question the page number of the image it visually appears on.
- If a question's text begins on one page and continues onto the next, use
  the page where the question NUMBER/label is printed, and still capture
  the full question text as one entry.

MARKS:

First inspect the question paper carefully for explicitly printed marks
(e.g. "[5]", "(2 marks)", "5M", numbers in a margin column, etc.).

IF MARKS ARE PRINTED:
- Use the exact printed mark value.
- Set marksSource to "paper".
- Do not modify the value.
- Still determine complexity separately for internal classification.

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

IMAGE QUALITY:
- These images may be scans, phone photos, or PDF-to-image renders. They may
  be slightly blurry, low-contrast, skewed, or have uneven lighting.
- This is normal and expected — do your best accurate reading rather than
  treating imperfect image quality as a reason to skip content or return
  no questions.
- Only treat a page as having no questions if, after careful inspection, it
  genuinely contains no question content (e.g. a pure cover page, a blank
  page, or a page of only instructions).

REQUIRED OUTPUT — DO NOT VIOLATE:
- If at least one actual question is visible anywhere in the supplied
  image(s), you MUST return at least one question. Returning an empty
  "questions": [] array while questions are visible is a failure.
- Do not return headings, instructions, or examples as questions.
- Do not invent questions, numbers, or text that are not actually visible.
- Do not omit a visible question because you are uncertain about one detail
  (e.g. exact marks) — extract it and make a reasonable determination for
  that detail using the rules above.

Return only structured question data.
`;

const retryPrompt = `
You are retrying extraction of an exam question paper because the previous
attempt incorrectly returned zero questions, even though the supplied
image(s) are a real exam question paper that contains visible printed
questions. Returning zero questions again would be treated as an error.

Treat this strictly as a VISUAL OCR AND TRANSCRIPTION task, not a judgment
call about whether questions exist — they do. Your job is only to read them
off the page accurately.

STEP-BY-STEP — perform every step:
1. Look at the image as a photograph of a physical/printed page. Ignore any
   assumption that the page might be blank or non-textual.
2. Sweep across the entire image region by region (top, middle, bottom; and
   left/right if there are columns) and note every distinct block of text
   that reads as a question — i.e. it asks the reader to do something
   (define, explain, list, solve, describe, draw, calculate, name, etc.), or
   is introduced by a number/letter label such as "1.", "Q2", "3)", "11(a)",
   "11(b)", "(i)", "(ii)".
3. For each such block, read its label and its full text character by
   character, as printed.
4. Assemble the results in the exact order they appear on the page(s), and
   across pages in the order the images were supplied.

DO NOT return:
{
  "questions": []
}
if any question is visible anywhere in the image(s). Re-examine the image
at least twice before concluding a page has no questions, and only reach
that conclusion for a page that is a true cover/instructions/blank page
with zero question content.

WHAT TO IGNORE (never extract as a question):
- Headings and section titles.
- General instructions ("Answer all questions", "Time allowed: ...").
- Worked examples or sample solutions.
- Headers, footers, page numbers, logos, roll-number boxes.

QUESTION NUMBERING — do not alter what is printed:
- "1." stays "1."
- "2." stays "2."
- "11(a)" stays "11(a)"
- "11(b)" stays "11(b)"
- Sub-parts like 11(a)/11(b)/2(i)/2(ii) are separate questions — extract
  each one individually, never merged.
- Never sequentially renumber the questions.
- Never fill in numbers that were skipped on the paper (e.g. if it jumps
  from 5 to 11(a), your output jumps from 5 to 11(a) too).
- The printed label is the ONLY source of truth for numbering.

TEXT AND ORDER:
- Preserve the exact printed question text; do not paraphrase.
- Preserve printed order, page by page, top to bottom.
- Include the correct page number for each question (image 1 = page 1,
  image 2 = page 2, etc., continuing sequentially).
- Do not combine separate questions into one, and do not split one question
  into multiple entries.

MARKS:
If printed marks are visible next to a question, use them exactly and set
marksSource to "paper".

If marks are not printed, classify complexity:

simple → 1
short → 2
moderate → 3
detailed → 5

Never use 4 marks or 0 marks for AI-estimated questions.
Set marksSource to "ai" for estimated marks.

IMAGE QUALITY:
Blur, low resolution, skew, or scan artifacts are expected and are never a
valid reason to omit a visible question — make your best accurate reading.

The final response must contain every question that is actually visible in
the image(s), transcribed faithfully with its original numbering.
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