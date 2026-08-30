export interface Question {
  id: string;
  number: string;
  text: string;
  page: number;
  marks: number;
  marksSource: "paper" | "ai";
  complexity: "simple" | "short" | "moderate" | "detailed";
}