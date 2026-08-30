export type MappingStatus = "answered" | "unanswered" | "unmatched";

export interface Mapping {
  questionId: string | null;
  answerId: string | null;
  status: MappingStatus;
}