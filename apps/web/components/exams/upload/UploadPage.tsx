"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import UploadCard from "./UploadCard";
import TeacherIllustration from "./TeacherIllustration";
import Button from "@/components/ui/Button";
import { useAssessment } from "@/lib/assessment-context";
import type { UploadedFileMeta } from "@/types/assessment";

export default function UploadPage() {
  const router = useRouter();
  const { setFiles, setError } = useAssessment();

  const [questionPaperMeta, setQuestionPaperMeta] =
    useState<UploadedFileMeta | null>(null);

  const [answerSheetMeta, setAnswerSheetMeta] =
    useState<UploadedFileMeta | null>(null);

  const bothSelected = Boolean(questionPaperMeta && answerSheetMeta);

  function handleStartMapping() {
    if (!questionPaperMeta || !answerSheetMeta) return;

    setError(null);

    setFiles({
      questionPaper: questionPaperMeta.file,
      answerSheet: answerSheetMeta.file,
    });

    router.push("/exams/processing");
  }

  return (
    <main
      className="
        flex min-h-full w-full flex-col items-center
        bg-[#E8E5E1]
        px-0 pb-5 pt-2
        sm:px-4 sm:pb-8 sm:pt-4
        md:px-8 md:pb-8 md:pt-9
      "
    >
      <div className="w-full max-w-[1100px] text-center">
        {/* Heading */}
        <section className="w-full px-4 md:px-0">
          {/* Desktop heading */}
          <h1 className="hidden font-extrabold leading-[1.1] tracking-[-0.035em] text-[var(--color-ink)] md:block md:whitespace-nowrap md:text-[40px]">
            Upload{" "}
            <span className="rounded-[8px] bg-[var(--color-accent-tint)] px-2 py-1 text-[var(--color-accent)]">
              Question Paper &amp; Answer Sheets
            </span>
          </h1>

          {/* Mobile heading */}
          <h1
            className="
              mx-auto block max-w-[310px]
              text-[22px] font-extrabold
              leading-[1.14] tracking-[-0.03em]
              text-[var(--color-ink)]
              sm:max-w-[320px] sm:text-[24px]
              md:hidden
            "
          >
            Upload Question Paper
            <br />
            &amp; Answer Sheets
          </h1>

          {/* Desktop subtitle */}
          <p className="mt-3 hidden text-[15px] leading-5 text-[var(--color-ink-soft)] md:block md:text-base">
            Upload both files to get started
          </p>
        </section>

        {/* Teacher illustration */}
        <div className="mt-[14px] sm:mt-5 md:mt-6">
          <TeacherIllustration />
        </div>

        {/* Upload cards */}
        <section
          className="
            mx-[10px] mt-[18px]
            w-[calc(100%-20px)]
            rounded-[22px]
            bg-white
            p-[10px]
            sm:mx-auto sm:mt-6 sm:w-full sm:max-w-[820px] sm:p-3.5
            md:mt-6
          "
        >
          <div className="grid grid-cols-1 gap-[10px] md:grid-cols-2 md:gap-4">
            <UploadCard
              label="Upload"
              highlight="Question Paper"
              fileMeta={questionPaperMeta}
              onSelect={setQuestionPaperMeta}
              onRemove={() => setQuestionPaperMeta(null)}
            />

            <UploadCard
              label="Upload"
              highlight="Answer Sheet"
              fileMeta={answerSheetMeta}
              onSelect={setAnswerSheetMeta}
              onRemove={() => setAnswerSheetMeta(null)}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mt-[20px] flex flex-col items-center gap-[10px] sm:mt-6 sm:gap-3 md:mt-6">
          <Button
            disabled={!bothSelected}
            icon={<ArrowRight className="h-4 w-4" />}
            onClick={handleStartMapping}
          >
            Start Mapping
          </Button>

          <p className="max-w-[300px] text-center text-xs leading-[1.45] text-[var(--color-ink-faint)] sm:max-w-[340px] md:max-w-[520px]">
            Once both files are uploaded, you&apos;ll be able to map answers
            with questions
          </p>
        </section>
      </div>
    </main>
  );
}