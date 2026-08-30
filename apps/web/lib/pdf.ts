import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { createCanvas } from "@napi-rs/canvas";
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  image: string;
}

/*
 * PDF.js standard fonts are copied into public/pdfjs/standard_fonts
 * so they are guaranteed to exist in the Vercel deployment.
 */
const standardFontDirectory = path.resolve(
  process.cwd(),
  "public",
  "pdfjs",
  "standard_fonts"
);

const standardFontDataUrl =
  pathToFileURL(
    standardFontDirectory + path.sep
  ).href;

export async function pdfToImages(
  buffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<PDFPage[]> {
  /*
   * Images don't need PDF.js.
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
   *
   * useWorkerFetch: false ensures PDF.js uses the supplied
   * local standard font directory instead of attempting
   * to fetch the fonts through a worker.
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