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

const standardFontDataUrl = pathToFileURL(
  path.resolve(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "standard_fonts"
  ) + path.sep
).href;

export async function pdfToImages(
  buffer: Buffer,
  mimeType: string = "application/pdf"
): Promise<PDFPage[]> {
  if (mimeType.startsWith("image/")) {
    const image = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return [
      {
        pageNumber: 1,
        width: 1000,
        height: 1000,
        image,
      },
    ];
  }

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    standardFontDataUrl,
  }).promise;

  const pages: PDFPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
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
      canvas: canvas as unknown as HTMLCanvasElement,
      canvasContext: context as unknown as CanvasRenderingContext2D,
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