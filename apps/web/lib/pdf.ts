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
 * PDF.js standard fonts.
 *
 * These files are copied into:
 *
 * apps/web/public/pdfjs/standard_fonts/
 *
 * so they are included in the Vercel deployment.
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
   *
   * We intentionally don't specify workerSrc,
   * disableWorker, or worker: null here because
   * those are not valid DocumentInitParameters
   * for pdfjs-dist 6.2.108.
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
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({
      scale: 2,
    });

    const canvas = createCanvas(
      Math.ceil(viewport.width),
      Math.ceil(viewport.height)
    );

    const context = canvas.getContext("2d");

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
      image: canvas.toDataURL("image/png"),
    });
  }

  return pages;
}