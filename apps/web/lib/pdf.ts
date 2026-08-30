import {
  createCanvas,
  DOMMatrix,
  Path2D,
} from "@napi-rs/canvas";

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

import path from "node:path";
import { pathToFileURL } from "node:url";

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  image: string;
}

/*
 * PDF.js requires DOMMatrix and Path2D when running
 * in a Node.js environment.
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
 */
const standardFontDirectory = path.resolve(
  process.cwd(),
  "public",
  "pdfjs",
  "standard_fonts"
);

const standardFontDataUrl = pathToFileURL(
  standardFontDirectory + path.sep
).href;

/*
 * PDF.js fake-worker source.
 *
 * The worker exists as a real file inside the deployed
 * application:
 *
 * public/pdfjs/pdf.worker.mjs
 *
 * We use a file:// URL because this code executes on
 * the Node.js server, not in the browser.
 */
const workerPath = path.resolve(
  process.cwd(),
  "public",
  "pdfjs",
  "pdf.worker.mjs"
);

const workerSrc = pathToFileURL(workerPath).href;

pdfjsLib.GlobalWorkerOptions.workerSrc =
  workerSrc;

export async function pdfToImages(
  buffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<PDFPage[]> {
  /*
   * Images don't require PDF.js.
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
   * Load the PDF.
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

    pages.push({
      pageNumber,
      width: viewport.width,
      height: viewport.height,
      image: canvas.toDataURL(
        "image/png"
      ),
    });
  }

  return pages;
}