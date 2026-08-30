import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  serverExternalPackages: [
    "@napi-rs/canvas",
  ],

  outputFileTracingIncludes: {
    "/api/process/**": [
      "./public/pdfjs/standard_fonts/**",
      "./lib/pdf.worker.mjs",
    ],
  },
};

export default nextConfig;