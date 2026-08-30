"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useAssessment } from "@/lib/assessment-context";
import { isAssessmentResult } from "@/lib/assessment-response";
import Image from "next/image";

export default function ProcessingView() {
  const router = useRouter();
  const { questionPaper, answerSheet, setResult, setError } = useAssessment();
  const [failed, setFailed] = useState<string | null>(null);
  const requestSentRef = useRef(false);

  useEffect(() => {
    

    if (!questionPaper || !answerSheet || requestSentRef.current) return;

    requestSentRef.current = true;

    const formData = new FormData();
    formData.append("questionPaper", questionPaper);
    formData.append("answerSheet", answerSheet);

    (async () => {
      try {
        const res = await fetch("/api/process", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(
            body?.error ?? "Processing failed. Please try again."
          );
        }

        const data = await res.json();

    

        if (!isAssessmentResult(data)) {
          
          throw new Error(
            "Received an unexpected response. Please try again."
          );
        }

        setResult(data);
        router.push("/exams/result");
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";

      
        setFailed(message);
        setError(message);
      }
    })();
  }, [questionPaper, answerSheet, router, setResult, setError]);

  if (failed) {
    return (
      <main className="mt-4 flex h-[calc(100%-16px)] min-h-[520px] w-full flex-col items-center justify-center rounded-[24px] bg-white px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-danger-bg)]">
          <Sparkles
            className="h-7 w-7 text-[var(--color-danger)]"
            strokeWidth={1.8}
          />
        </span>

        <h1 className="mt-5 text-xl font-extrabold text-[var(--color-ink)]">
          Processing failed
        </h1>

        <p className="mt-2 max-w-sm text-sm leading-5 text-[var(--color-ink-soft)]">
          {failed}
        </p>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-5 rounded-full bg-[var(--color-pill)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Back to upload
        </button>
      </main>
    );
  }

  return (
    <main
      className="mt-4 flex h-[calc(100%-16px)] min-h-[520px] w-full flex-col items-center justify-center rounded-[24px] bg-white px-6 text-center"
      role="status"
      aria-live="polite"
    >
    <Image
  src="/images/processing-stars.svg"
  alt=""
  aria-hidden="true"
  width={140}
  height={140}
  className="h-[132px] w-[132px] object-contain sm:h-[140px] sm:w-[140px]"
/>

      <h1 className="mt-6 text-[28px] font-extrabold leading-none tracking-[-0.035em] text-[#3B3B3B] sm:text-[30px]">
        Extracting...
      </h1>

      <p className="mt-3 text-[18px] font-normal leading-none tracking-[-0.01em] text-[#777777] sm:text-[19px]">
        This may take a while
      </p>
    </main>
  );
}