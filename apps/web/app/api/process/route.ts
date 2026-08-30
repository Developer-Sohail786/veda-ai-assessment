import { NextRequest, NextResponse } from "next/server";
import { pdfToImages } from "@/lib/pdf";
import { extractQuestions } from "@/lib/extractQuestions";
import { extractAnswers } from "@/lib/extractAnswers";
import { mapAnswers } from "@/lib/mapAnswers";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const questionPaper = formData.get("questionPaper");
    const answerSheet = formData.get("answerSheet");

    if (!(questionPaper instanceof File)) {
      return NextResponse.json(
        { error: "Question paper is required." },
        { status: 400 }
      );
    }

    if (!(answerSheet instanceof File)) {
      return NextResponse.json(
        { error: "Answer sheet is required." },
        { status: 400 }
      );
    }

    const questionBuffer = Buffer.from(
      await questionPaper.arrayBuffer()
    );

    const answerBuffer = Buffer.from(
      await answerSheet.arrayBuffer()
    );

    console.log("PROCESS START");

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
     * Convert question paper PDF into images.
     */
    const questionPages = await pdfToImages(
      questionBuffer,
      questionPaper.type
    );

    console.log(
      "Question pages:",
      questionPages.length
    );

    /*
     * Diagnostic information for the first generated
     * question-paper image.
     */
    console.log(
      "QUESTION IMAGE PREFIX:",
      questionPages[0]?.image?.slice(0, 100)
    );

    console.log(
      "QUESTION IMAGE LENGTH:",
      questionPages[0]?.image?.length ?? 0
    );

    /*
     * Convert answer sheet PDF into images.
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
     * Extract questions from the question-paper images.
     */
    const questions = await extractQuestions(
      questionPages.map((page) => page.image)
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
     * Extract and grade answers.
     */
    const answers = await extractAnswers(
      answerPages.map((page) => page.image),
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
     * Map extracted answers to extracted questions.
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

      /*
       * Temporarily return the question pages so we can
       * verify that the PDF is being rendered correctly
       * on Vercel.
       */
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