# VedaAI --- AI-Powered Exam Assessment & Answer Mapping

VedaAI is an AI-assisted exam assessment platform that helps teachers
process question papers and handwritten answer sheets, automatically
extract questions and answers, evaluate responses, and map each answer
back to its corresponding question.

The application is built around a teacher-focused workflow that makes
AI-assisted assessment easier to review, with extracted questions,
scores, feedback, answer locations, and unmatched responses presented in
one interface.

## Key Features

### Question Paper Extraction

Automatically extracts:

-   Original question numbering
-   Question text
-   Page number
-   Printed marks
-   Question complexity

Sub-parts such as `11(a)` and `11(b)` are preserved as separate
questions rather than being renumbered.

### Handwritten Answer Extraction

Processes the answer sheet page by page and extracts:

``` text
Question number
Answer text
Score
Teacher-style feedback
Answer regions
```

Answers spanning multiple pages can contain multiple bounding-box
regions using:

``` text
[ymin, xmin, ymax, xmax]
```

Coordinates are normalized from `0` to `1000`.

### AI-Based Answer Evaluation

Answers are evaluated against their corresponding questions using:

-   Correctness
-   Completeness
-   Relevance
-   Accuracy
-   Required concepts
-   Required number of items
-   Required comparisons
-   Partial correctness

Scores are constrained so that:

``` text
0 <= score <= question maximum marks
```

Whole and half marks are supported where appropriate.

### Intelligent Answer Mapping

Mapping uses a two-stage strategy:

``` text
1. Explicit question-number matching
2. Content/text similarity fallback
```

Question-number normalization handles variations such as:

``` text
Q5
q5
5
5.
```

Final mapping states are:

``` text
answered
unanswered
unmatched
```

This prevents uncertain answers from being silently assigned to the
wrong question.

### Interactive Answer Sheet Viewer

Teachers can inspect the scanned answer sheet with:

-   Page navigation
-   Zoom controls
-   Answer highlighting
-   Bounding boxes
-   Question selection

Selecting a question highlights its corresponding handwritten response.

### AI Feedback

Each evaluated answer can display concise teacher-style feedback
explaining:

``` text
What was correct
What was missing
Why marks were awarded
Why marks were lost
```

### Strict Response Validation

AI responses are validated with **Zod** before reaching the UI.

Validated structures include:

``` text
Questions
Answers
Mappings
Answer sheet pages
Bounding boxes
Scores
Question metadata
```

Unexpected AI responses are rejected instead of being rendered as
potentially invalid application data.

### File Validation

Supported uploads:

``` text
PDF
PNG
JPG / JPEG
```

Maximum file size:

``` text
10 MB
```

The upload interface supports:

-   Drag & drop
-   File preview
-   File size display
-   Page-count preview
-   File removal
-   Validation messages

------------------------------------------------------------------------

# Performance & Processing Architecture

A key implementation goal is to keep the assessment workflow simple
while avoiding unnecessary frontend/API round trips.

## Single End-to-End Processing Request

Once both files are selected, the frontend sends them together to:

``` text
POST /api/process
```

The backend performs the complete workflow:

``` text
PDF / image processing
        ↓
Question extraction
        ↓
Answer extraction + grading
        ↓
Answer mapping
        ↓
Result
```

The result is then validated on the client before the UI renders it.

## Server-Side PDF Processing

PDF conversion is performed server-side using:

``` text
pdfjs-dist
@napi-rs/canvas
```

PDF pages are rendered into PNG images before being supplied to the AI
extraction pipeline.

The project configures these packages as server-side external packages
in `apps/web/next.config.ts`.

## Structured AI Generation

The application uses:

``` ts
generateObject()
```

with Zod schemas instead of relying on uncontrolled text responses and
manual parsing.

This makes AI output structured and predictable for the application.

## React Compiler

React Compiler is enabled in `apps/web/next.config.ts`:

``` ts
reactCompiler: true
```

This allows compiler-driven React optimizations without manually adding
memoization throughout the application.

## Optimized Image Handling

Static and UI images use:

``` text
next/image
```

Generated answer-sheet images intentionally use:

``` text
unoptimized
```

because they are created dynamically during PDF processing.

------------------------------------------------------------------------

# Project Structure

VedaAI uses an npm workspace monorepo:

``` text
veda-ai-assessment/
│
├── apps/
│   └── web/
│       ├── app/
│       │   ├── (dashboard)/
│       │   │   ├── exams/
│       │   │   │   ├── page.tsx
│       │   │   │   ├── upload/
│       │   │   │   ├── processing/
│       │   │   │   └── result/
│       │   │   ├── layout.tsx
│       │   │   └── page.tsx
│       │   ├── api/
│       │   │   └── process/
│       │   │       └── route.ts
│       │   ├── globals.css
│       │   └── layout.tsx
│       │
│       ├── components/
│       │   ├── exams/
│       │   │   ├── processing/
│       │   │   ├── result/
│       │   │   └── upload/
│       │   ├── layout/
│       │   └── ui/
│       │
│       ├── lib/
│       │   ├── assessment-context.tsx
│       │   ├── assessment-response.ts
│       │   ├── evaluateAnswers.ts
│       │   ├── extractAnswers.ts
│       │   ├── extractQuestions.ts
│       │   ├── gemini.ts
│       │   ├── mapAnswers.ts
│       │   ├── pdf.ts
│       │   ├── prompts.ts
│       │   ├── schemas.ts
│       │   └── upload-validation.ts
│       │
│       ├── types/
│       │   ├── answer.ts
│       │   ├── assessment.ts
│       │   ├── mapping.ts
│       │   └── question.ts
│       │
│       ├── public/
│       │   ├── icons/
│       │   └── images/
│       │
│       ├── next.config.ts
│       ├── package.json
│       └── eslint.config.mjs
│
├── package.json
├── package-lock.json
└── .gitignore
```

------------------------------------------------------------------------

# Processing Pipeline

The main backend endpoint is:

``` text
POST /api/process
```

## Step 1 --- Receive and Validate Files

The endpoint receives:

``` text
questionPaper
answerSheet
```

Both are verified as actual `File` objects before processing.

## Step 2 --- Convert Documents

``` ts
pdfToImages()
```

PDF pages are rendered into PNG image data.

Image uploads can be processed directly.

## Step 3 --- Extract Questions

``` ts
extractQuestions()
```

The AI identifies:

``` text
Question number
Question text
Page
Marks
Complexity
Marks source
```

## Step 4 --- Extract and Grade Answers

``` ts
extractAnswers()
```

The AI identifies:

``` text
Handwritten answer
Question number
Answer regions
Score
Feedback
```

and evaluates each answer against the extracted question context.

## Step 5 --- Map Answers

``` ts
mapAnswers()
```

Explicit question-number matching is attempted first, followed by
content similarity when the question number is unavailable.

## Step 6 --- Validate Result

The result is validated before the frontend accepts it.

The client uses:

``` ts
isAssessmentResult()
```

to ensure the response contains the expected question, answer, mapping,
and page structures.

## Step 7 --- Render Results

The frontend receives:

``` ts
{
  questions,
  answers,
  mappings,
  answerSheetPages
}
```

and displays the interactive assessment result.

------------------------------------------------------------------------

# Tech Stack

  Technology          Purpose
  ------------------- ---------------------------------------
  `Next.js 16.3.3`    Full-stack React framework
  `React 19`          UI development
  `TypeScript`        Type safety
  `Tailwind CSS 4`    Styling
  `Google Gemini`     AI extraction, evaluation and grading
  `Vercel AI SDK`     Structured AI generation
  `Zod`               Runtime schema validation
  `pdfjs-dist`        PDF parsing and rendering
  `@napi-rs/canvas`   Server-side canvas rendering
  `Lucide React`      UI icons

------------------------------------------------------------------------

# AI Model

Google Gemini is accessed through the Vercel AI SDK.

The model configuration is located in:

``` text
apps/web/lib/gemini.ts
```

The current implementation uses the configured Gemini model for:

``` text
Question extraction
Handwritten answer extraction
Answer evaluation
Scoring
Teacher feedback
Question association
```

> The API key is supplied through an environment variable and is never
> hard-coded into the repository.

------------------------------------------------------------------------

# Important Design Decisions

## Preserve Original Question Numbers

The application never reconstructs question numbers from array
positions.

For example:

``` text
5
11(a)
11(b)
14
```

remains:

``` text
5
11(a)
11(b)
14
```

This is important for reliable answer mapping.

## Printed Marks Take Priority

The grading hierarchy is:

``` text
Printed marks > AI-estimated marks
```

AI estimation is used only when marks are unavailable on the question
paper.

When marks are not printed, complexity determines the estimated marks:

``` text
simple   → 1
short    → 2
moderate → 3
detailed → 5
```

## Explicit Mapping Before Semantic Mapping

The system prefers:

``` text
Question number
```

before:

``` text
Text similarity
```

This reduces false-positive mappings.

## Preserve Uncertainty

The system does not force every extracted answer into a question.

Uncertain responses remain:

``` text
unmatched
```

This gives teachers an opportunity to review them manually.

------------------------------------------------------------------------

# Result States

### Answered

A corresponding answer was confidently mapped.

``` text
answered
```

### Unanswered

No corresponding student answer was found.

``` text
unanswered
```

### Unmatched

An answer was extracted but could not be confidently associated with a
question.

``` text
unmatched
```

An unanswered question and an unmatched answer therefore remain
distinguishable.

------------------------------------------------------------------------

# UI / UX

The application is designed around a teacher-focused assessment
workflow.

## Upload Screen

Teachers upload:

``` text
Question Paper
Answer Sheet
```

The `Start Mapping` action becomes available only after both files have
been selected.

## Processing Screen

The processing state provides immediate feedback:

``` text
Extracting...
This may take a while
```

Processing failures provide a recovery path back to the upload screen.

## Results Screen

The desktop result interface provides:

``` text
Extracted Questions
+
Answer Sheet Viewer
```

On smaller screens, users can switch between:

``` text
Questions
Answer Sheet
```

------------------------------------------------------------------------

# Error Handling

The API handles common failures with appropriate responses:

``` text
400 → Missing question paper
400 → Missing answer sheet
500 → Assessment processing failure
```

The frontend catches processing failures and displays a user-friendly
recovery state.

Unexpected AI responses are rejected before the result page is rendered.

------------------------------------------------------------------------

# Accessibility

The application includes:

``` text
ARIA labels
Keyboard-focus styles
Semantic buttons
Semantic navigation
Accessible image alt text
Live processing status
```

The processing state uses:

``` html
role="status"
aria-live="polite"
```

to communicate state changes to assistive technologies.

------------------------------------------------------------------------

# Project Scripts

All root scripts delegate to the `apps/web` workspace.

## Development

``` bash
npm run dev
```

Open:

``` text
http://localhost:3000
```

## Lint

``` bash
npm run lint
```

## Production Build

``` bash
npm run build
```

This validates:

``` text
TypeScript
Next.js compilation
Static page generation
Route generation
Production optimization
```

## Production Server

After building:

``` bash
npm run start
```

This starts the application using the generated production build.

------------------------------------------------------------------------

# Environment Variables

Create:

``` text
apps/web/.env.local
```

Add:

``` env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

Do not commit `.env.local` or expose the API key publicly.

The repository `.gitignore` already excludes environment files.

------------------------------------------------------------------------

# Getting Started

## 1. Clone the repository

``` bash
git clone https://github.com/Developer-Sohail786/veda-ai-assessment.git
cd veda-ai-assessment
```

## 2. Install dependencies

``` bash
npm install
```

The root `package.json` uses npm workspaces, so dependencies for
`apps/web` are installed through the root project.

## 3. Configure the environment

Create:

``` text
apps/web/.env.local
```

and add:

``` env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

## 4. Start development

``` bash
npm run dev
```

Then open:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

# Validation Before Submission

Run:

``` bash
npm run lint
```

Then:

``` bash
npm run build
```

For production testing:

``` bash
npm run start
```

A successful build should complete without TypeScript or compilation
errors.

------------------------------------------------------------------------

# Current Scope

The current implementation focuses on:

``` text
Exam question extraction
Handwritten answer extraction
AI grading
Question-answer mapping
Answer visualization
Teacher feedback
```

The navigation UI also includes:

``` text
Home
My Classroom
Assignments
Exams
My Library
Settings
```

The implemented assessment workflow is centered around the Exams
experience.

------------------------------------------------------------------------

# Future Improvements

Potential extensions include:

``` text
Persistent assessment history
Teacher authentication
Database-backed results
Bulk assessment processing
Multiple student answer sheets
Export to PDF / CSV
Manual score correction
Teacher override of mappings
Improved semantic matching
Processing progress indicators
Background job processing
Assessment analytics
Class-level performance reports
```

------------------------------------------------------------------------

# Project Highlights

The key strengths of VedaAI are:

-   **AI-powered handwritten answer extraction**
-   **Automatic question and answer mapping**
-   **AI-assisted grading with maximum-mark constraints**
-   **Preservation of original question numbering**
-   **Bounding-box visualization of handwritten answers**
-   **Teacher-style AI feedback**
-   **Explicit `answered`, `unanswered`, and `unmatched` states**
-   **Strict runtime validation using Zod**
-   **PDF-to-image processing using `pdfjs-dist` and `@napi-rs/canvas`**
-   **Responsive teacher-focused interface**
-   **Single end-to-end processing request**
-   **Reduced unnecessary frontend/API round trips**
-   **Type-safe full-stack implementation with TypeScript**
-   **React Compiler enabled**
-   **Production-ready Next.js build pipeline**

------------------------------------------------------------------------

# Repository

``` text
https://github.com/Developer-Sohail786/veda-ai-assessment
```

------------------------------------------------------------------------

# License

This project was developed as an assessment project demonstrating
full-stack development, AI integration, document processing, structured
data validation, and responsive UI implementation.
