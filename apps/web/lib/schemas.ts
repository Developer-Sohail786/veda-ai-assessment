import { z } from "zod";

export const questionSchema = z.object({
  id: z.string(),
  number: z.string(),
  text: z.string(),
  page: z.number().int().positive(),
  marks: z.number().positive(),
  marksSource: z.enum(["paper", "ai"]),
  complexity: z.enum([
    "simple",
    "short",
    "moderate",
    "detailed",
  ]),
});

export const questionExtractionSchema = z.object({
  // At least one question must be extracted.
  // This prevents an empty AI response from silently
  // continuing into answer mapping.
  questions: z.array(questionSchema).min(1),
});

export const boundingBoxSchema = z.object({
  page: z.number().int().positive(),
  box_2d: z.array(z.number()).length(4),
});

export const answerSchema = z.object({
  id: z.string(),
  questionNumber: z.string().nullable(),
  text: z.string(),
  score: z.number().nonnegative(),
  feedback: z.string(),
  regions: z.array(boundingBoxSchema),
});

export const answerExtractionSchema = z.object({
  answers: z.array(answerSchema),
});

export const mappingSchema = z.object({
  questionId: z.string().nullable(),
  answerId: z.string().nullable(),
  status: z.enum([
    "answered",
    "unanswered",
    "unmatched",
  ]),
});

export const answerMappingSchema = z.object({
  mappings: z.array(mappingSchema),
});