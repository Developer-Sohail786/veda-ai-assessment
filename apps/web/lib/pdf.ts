import { PDFParse } from "pdf-parse";

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  image: string;
}

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