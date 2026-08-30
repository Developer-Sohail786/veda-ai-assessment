import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { AssessmentProvider } from "@/lib/assessment-context";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "VedaAI",
  description: "AI-assisted exam question and answer mapping",
  icons: {
    icon: "/images/Veda_logo.svg",
  },
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className={`${bricolage.variable} min-h-full antialiased`}>
        <AssessmentProvider>{children}</AssessmentProvider>
      </body>
    </html>
  );
}



