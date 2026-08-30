import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  serverExternalPackages: [
    "@napi-rs/canvas",
    "pdfjs-dist",
  ],

  outputFileTracingIncludes: {
    "/api/process": [
      "./lib/pdf.worker.mjs",
      "./public/pdfjs/standard_fonts/**/*",
    ],
  },
};

export default nextConfig;