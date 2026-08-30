export interface AnswerRegion {
  page: number;
  box_2d: [number, number, number, number];
}

export interface Answer {
  id: string;
  questionNumber: string | null;
  text: string;
  score: number;
  feedback: string;
  regions: AnswerRegion[];
}