import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormReady — Govt Portal Photo & Document Formatter",
  description:
    "Automatically resize, compress, and convert photos, signatures, and documents to exact government exam portal specifications for SSC, IBPS, RRB, UPSC, and more.",
  keywords: ["government exam photo", "SSC photo resize", "IBPS photo format", "passport photo compressor", "signature resize", "govt portal photo", "document compress"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
