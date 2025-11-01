import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Test Generator – Create and Print Your Workbook Tests",
  description:
    "A simple website that lets students upload question photos, organize them, and instantly download clean A4 PDF tests.",
  openGraph: {
    title: "Test Generator",
    description:
      "Upload workbook questions and turn them into printable A4 tests in seconds.",
    url: "https://test-generqtor.vercel.app",
    siteName: "Test Generator",
    images: [
      {
        url: "/og-preview.png",
        width: 1200,
        height: 630,
        alt: "Test Generator App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Test Generator",
    description:
      "Upload workbook questions and download printable A4 PDF tests instantly.",
    images: ["/og-preview.png"],
  },
};

// ✅ New block — Next.js 16+ requires this separately
export const viewport: Viewport = {
  themeColor: "#00a387",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
