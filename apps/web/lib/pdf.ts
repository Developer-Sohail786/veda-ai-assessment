import {
  createCanvas,
  DOMMatrix,
  Path2D,
} from "@napi-rs/canvas";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  image: string;
}

/*
 * PDF.js may require DOMMatrix and Path2D when running
 * in the Node.js/Vercel environment.
 *
 * @napi-rs/canvas provides these implementations.
 */
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix =
    DOMMatrix as typeof globalThis.DOMMatrix;
}

if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D =
    Path2D as typeof globalThis.Path2D;
}

/*
 * Standard PDF fonts.
 *
 * These files are stored in:
 *
 * apps/web/public/pdfjs/standard_fonts/
 *
 * We verify that the directory exists before giving
 * it to PDF.js.
 */
const standardFontDirectory = path.resolve(
  process.cwd(),
  "public",
  "pdfjs",
  "standard_fonts"
);

if (!fs.existsSync(standardFontDirectory)) {
  throw new Error(
    `PDF standard font directory not found: ${standardFontDirectory}`
  );
}

const standardFontDataUrl = pathToFileURL(
  standardFontDirectory + path.sep
).href;

/*
 * PDF.js worker.
 *
 * The worker is stored inside the server-side lib directory:
 *
 * apps/web/lib/pdf.worker.mjs
 */
const workerPath = path.resolve(
  process.cwd(),
  "lib",
  "pdf.worker.mjs"
);

if (!fs.existsSync(workerPath)) {
  throw new Error(
    `PDF worker not found: ${workerPath}`
  );
}

const workerSrc = pathToFileURL(
  workerPath
).href;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  workerSrc;

export async function pdfToImages(
  buffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<PDFPage[]> {
  /*
   * If the uploaded file is already an image,
   * no PDF processing is required.
   */
  if (mimeType.startsWith("image/")) {
    const image = `data:${mimeType};base64,${buffer.toString(
      "base64"
    )}`;

    return [
      {
        pageNumber: 1,
        width: 1000,
        height: 1000,
        image,
      },
    ];
  }

  /*
   * Load the PDF using PDF.js.
   */
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),

    useWorkerFetch: false,

    standardFontDataUrl,
  }).promise;

  const pages: PDFPage[] = [];

  for (
    let pageNumber = 1;
    pageNumber <= pdf.numPages;
    pageNumber++
  ) {
    const page =
      await pdf.getPage(pageNumber);

    const viewport =
      page.getViewport({
        scale: 2,
      });

    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );

    const context =
      canvas.getContext("2d");

    await page.render({
      canvas:
        canvas as unknown as HTMLCanvasElement,

      canvasContext:
        context as unknown as CanvasRenderingContext2D,

      viewport,
    }).promise;

    const image =
      canvas.toDataURL("image/png");

    console.info(
      `PDF PAGE ${pageNumber}: ${viewport.width}x${viewport.height}, image length: ${image.length}`
    );

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      image,
    });
  }

  return pages;
}