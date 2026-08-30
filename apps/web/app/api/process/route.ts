import { NextRequest, NextResponse } from "next/server";
import { extractQuestions } from "@/lib/extractQuestions";
import { extractAnswers } from "@/lib/extractAnswers";
import { mapAnswers } from "@/lib/mapAnswers";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    console.log("PROCESS START");

    const formData = await request.formData();

    const questionPaper = formData.get("questionPaper");
    const answerSheet = formData.get("answerSheet");

    if (!(questionPaper instanceof File)) {
      return NextResponse.json(
        {
          error: "Question paper is required.",
        },
        { status: 400 }
      );
    }

    if (!(answerSheet instanceof File)) {
      return NextResponse.json(
        {
          error: "Answer sheet is required.",
        },
        { status: 400 }
      );
    }

    console.log("Question paper:", {
      name: questionPaper.name,
      type: questionPaper.type,
      size: questionPaper.size,
    });

    console.log("Answer sheet:", {
      name: answerSheet.name,
      type: answerSheet.type,
      size: answerSheet.size,
    });

    /*
     * Load PDF processing only when the API request needs it.
     */
    const { pdfToImages } = await import("@/lib/pdf");

    const questionBuffer = Buffer.from(
      await questionPaper.arrayBuffer()
    );

    const answerBuffer = Buffer.from(
      await answerSheet.arrayBuffer()
    );

    /*
     * QUESTION PAPER
     *
     * pdfToImages() currently returns PDFPage[].
     * We still render the pages because the existing result
     * structure expects questionPages, but question extraction
     * itself now uses the PDF's native text.
     */
    const questionPages = await pdfToImages(
      questionBuffer,
      questionPaper.type
    );

    console.log(
      "Question pages:",
      questionPages.length
    );

    console.log(
      "QUESTION IMAGE PREFIX:",
      questionPages[0]?.image?.slice(0, 100)
    );

    console.log(
      "QUESTION IMAGE LENGTH:",
      questionPages[0]?.image?.length ?? 0
    );

    /*
     * Extract the native text from the question PDF.
     *
     * We use pdf-parse directly here because the rendered
     * question screenshot is unreliable in the deployment
     * environment, while PDF text extraction has been verified
     * to work correctly.
     */
    const { PDFParse } = await import("pdf-parse");

  const questionParser = new PDFParse({
  data: questionBuffer,
});

    let questionText = "";

    try {
      const textResult =
        await questionParser.getText();

      questionText = textResult.text ?? "";

      console.log(
        "QUESTION TEXT LENGTH:",
        questionText.length
      );

      console.log(
        "QUESTION TEXT:",
        questionText
      );
    } finally {
      await questionParser.destroy();
    }

    if (!questionText.trim()) {
      throw new Error(
        "Unable to extract text from the question paper."
      );
    }

    /*
     * ANSWER SHEET
     *
     * Keep rendering the answer sheet because it contains
     * handwritten answers.
     */
    const answerPages = await pdfToImages(
      answerBuffer,
      answerSheet.type
    );

    console.log(
      "Answer pages:",
      answerPages.length
    );

    console.log(
      "ANSWER IMAGE PREFIX:",
      answerPages[0]?.image?.slice(0, 100)
    );

    console.log(
      "ANSWER IMAGE LENGTH:",
      answerPages[0]?.image?.length ?? 0
    );

    /*
     * Extract questions from the native PDF text.
     */
    const questions = await extractQuestions(
      questionText
    );

    console.log(
      "QUESTIONS EXTRACTED:",
      questions.length
    );

    console.log(
      "QUESTION NUMBERS:",
      questions.map(
        (question) => question.number
      )
    );

    /*
     * Extract handwritten answers from rendered images.
     */
    const answers = await extractAnswers(
      answerPages.map(
        (page) => page.image
      ),
      questions
    );

    console.log(
      "ANSWERS EXTRACTED:",
      answers.length
    );

    console.log(
      "ANSWER QUESTION NUMBERS:",
      answers.map(
        (answer) => answer.questionNumber
      )
    );

    /*
     * Map answers to questions.
     */
    const mappings = mapAnswers(
      questions,
      answers
    );

    console.log(
      "MAPPINGS:",
      mappings.map((mapping) => ({
        questionId: mapping.questionId,
        answerId: mapping.answerId,
        status: mapping.status,
      }))
    );

    console.log("PROCESS COMPLETE");

    return NextResponse.json({
      questions,
      answers,
      mappings,

      // Keep the existing response structure.
      questionPages,
      answerSheetPages: answerPages,
    });
  } catch (error) {
    console.error(
      "PROCESS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process assessment.",
      },
      { status: 500 }
    );
  }
}