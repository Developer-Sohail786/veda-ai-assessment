import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  serverExternalPackages: [
    "pdf-parse",
    "@napi-rs/canvas",
  ],

  outputFileTracingIncludes: {
    "/api/process/**": [
      "./lib/pdfjs/pdf.worker.mjs",
      "./public/pdfjs/standard_fonts/**",

      "./node_modules/pdf-parse/**",
      "./node_modules/pdf-parse/node_modules/pdfjs-dist/**",
      "./node_modules/pdf-parse/node_modules/@napi-rs/canvas/**",
      "./node_modules/pdf-parse/node_modules/@napi-rs/canvas-linux-x64-gnu/**",
    ],
  },
};

export default nextConfig;