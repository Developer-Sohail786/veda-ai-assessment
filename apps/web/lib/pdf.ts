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

// PDF.js requires these browser-like APIs when rendering PDFs in Node.
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
  // Handle image uploads directly.
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
   * PDF.js worker:
   *
   * apps/web/lib/pdfjs/pdf.worker.mjs
   */
  const workerPath = path.resolve(
    process.cwd(),
    "lib",
    "pdfjs",
    "pdf.worker.mjs"
  );

  const workerUrl = pathToFileURL(workerPath).href;

  /*
   * PDF.js standard fonts:
   *
   * apps/web/public/pdfjs/standard_fonts/
   */
  const standardFontPath =
    path.resolve(
      process.cwd(),
      "public",
      "pdfjs",
      "standard_fonts"
    ) + path.sep;

  const standardFontUrl =
    pathToFileURL(standardFontPath).href;

  // Import after the canvas globals have been initialized.
  const { PDFParse } = await import("pdf-parse");

  // Explicitly configure the PDF.js worker.
  PDFParse.setWorker(workerUrl);

  const parser = new PDFParse({
    data: buffer,

    // Explicitly provide the standard PDF font files.
    standardFontDataUrl: standardFontUrl,
  });

  try {
    /*
     * Diagnostic text extraction.
     *
     * This tells us whether PDF.js can read the question paper's
     * underlying text even though its rasterized screenshot may
     * appear blank.
     */
    const textResult = await parser.getText();

    console.log(
      "PDF TEXT LENGTH:",
      textResult.text?.length ?? 0
    );

    console.log(
      "PDF TEXT:",
      textResult.text ?? ""
    );

    /*
     * Render PDF pages to PNG screenshots.
     */
    const result = await parser.getScreenshot({
      scale: 2,
      imageDataUrl: true,
    });

    console.log(
      "PDF SCREENSHOT PAGES:",
      result.pages.length
    );

    if (result.pages.length > 0) {
      console.log(
        "PDF FIRST PAGE:",
        {
          pageNumber: result.pages[0].pageNumber,
          width: result.pages[0].width,
          height: result.pages[0].height,
          imageLength: result.pages[0].dataUrl?.length ?? 0,
        }
      );
    }

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