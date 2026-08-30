import type { Question } from "./question";
import type { Answer } from "./answer";
import type { Mapping } from "./mapping";

export interface AssessmentPage {
  pageNumber: number;
  width: number;
  height: number;
  image: string;
}

export interface AssessmentResult {
  questions: Question[];
  answers: Answer[];
  mappings: Mapping[];
  answerSheetPages: AssessmentPage[];
}

export interface UploadedFileMeta {
  file: File;
  name: string;
  sizeLabel: string;
  pageCount: number | null;
}