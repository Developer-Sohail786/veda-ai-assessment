export const questionExtractionPrompt = `
Extract every question from the question paper.

Rules:
- Preserve the original printed order.
- Preserve the exact question numbering.
- Treat labelled sub-parts such as 11(a) and 11(b) as separate questions.
- Do not merge separate questions.
- Return only actual questions.
- Include the page number where each question appears.
`;

export const answerExtractionPrompt = `
Extract every handwritten answer from the answer sheet.

Rules:
- Identify the question number when written by the student.
- Preserve the handwritten answer text as accurately as possible.
- Answers may appear out of order.
- Answers may span multiple pages.
- Identify every page and exact region containing each answer.
- Return bounding boxes for every answer region.
- Use bounding boxes in [ymin, xmin, ymax, xmax] format normalized to 0-1000.
- Do not invent answers or question numbers.
`;

export const answerMappingPrompt = `
Map each extracted student answer to the corresponding extracted question.

Rules:
- Match using question number first.
- Use semantic/content matching when the question number is missing or unclear.
- Handle answers appearing out of order.
- Mark questions with no corresponding answer as "unanswered".
- Mark answers that cannot be matched to any question as "unmatched".
- Keep sub-parts such as 11(a) and 11(b) separate.
- An answer may contain multiple regions across multiple pages.
`;