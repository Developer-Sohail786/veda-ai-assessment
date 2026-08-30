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

    const questionBuffer = Buffer.from(await questionPaper.arrayBuffer());
    const answerBuffer = Buffer.from(await answerSheet.arrayBuffer());

    const questionPages = await pdfToImages(
      questionBuffer,
      questionPaper.type
    );

    const answerPages = await pdfToImages(
      answerBuffer,
      answerSheet.type
    );

    const questions = await extractQuestions(
      questionPages.map((page) => page.image)
    );

    const answers = await extractAnswers(
      answerPages.map((page) => page.image),
      questions
    );

    const mappings = mapAnswers(questions, answers);

    return NextResponse.json({
      questions,
      answers,
      mappings,
      answerSheetPages: answerPages,
    });
 } catch (error) {
  console.error("PROCESS API ERROR:", error);

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : "Failed to process assessment.",
    },
    { status: 500 },
  );
 }}