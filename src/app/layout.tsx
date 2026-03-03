import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FormReady — Govt Portal Photo Auto-Formatter",
  description:
    "Automatically resize, compress, and convert your photo and signature to exact government exam portal specifications for SSC, IBPS, RRB, UPSC, and more — in seconds.",
  keywords: [
    "government exam photo",
    "SSC photo resize",
    "IBPS photo format",
    "passport photo compressor",
    "signature resize",
    "govt portal photo",
  ],
  openGraph: {
    title: "FormReady — Govt Portal Photo Auto-Formatter",
    description:
      "Format your photo & signature for SSC, IBPS, UPSC & more in seconds",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
