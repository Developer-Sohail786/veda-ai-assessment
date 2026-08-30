import {
  DOMMatrix,
  ImageData,
  Path2D,
} from "@napi-rs/canvas";

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  image: string;
}

// Make the canvas APIs available globally before pdf-parse/pdfjs-dist loads.
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

  // Load pdf-parse after the canvas globals are initialized.
  const { PDFParse } = await import("pdf-parse");

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