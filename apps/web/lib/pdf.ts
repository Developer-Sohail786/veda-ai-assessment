import {
  DOMMatrix,
  ImageData,
  Path2D,
} from "@napi-rs/canvas";
import path from "node:path";
import { pathToFileURL } from "node:url";

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  image: string;
}

// PDF.js requires these browser APIs when rendering PDFs in Node.
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix =
    DOMMatrix as unknown as typeof globalThis.DOMMatrix;
}

if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData =
    ImageData as unknown as typeof globalThis.ImageData;
}

if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D =
    Path2D as unknown as typeof globalThis.Path2D;
}

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

  /*
   * The worker is copied into our application so that it has a stable
   * location in both local development and the Vercel deployment.
   *
   * process.cwd() is apps/web when Next.js runs the application.
   */
  const workerPath = path.resolve(
    process.cwd(),
    "public",
    "pdfjs",
    "pdf.worker.mjs"
  );

  const workerUrl = pathToFileURL(workerPath).href;

  // Import after the canvas globals have been initialized.
  const { PDFParse } = await import("pdf-parse");

  // Explicitly tell pdf-parse/pdfjs-dist which worker to use.
  PDFParse.setWorker(workerUrl);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getScreenshot({
      scale: 2,
      imageDataUrl: true,
    });

    return result.pages.map((page) => ({
      pageNumber: page.pageNumber,
      width: page.width,
      height: page.height,
      image: page.dataUrl,
    }));
  } finally {
    await parser.destroy();
  }
}