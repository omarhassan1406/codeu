import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CodeU Academy",
    template: "%s | CodeU Academy",
  },
  description:
    "Learn from industry experts. CodeU Academy offers professional courses in programming, design, and technology.",
  keywords: ["online academy", "programming courses", "CodeU", "tech education"],
  openGraph: {
    title: "CodeU Academy",
    description:
      "Learn from industry experts. CodeU Academy offers professional courses in programming, design, and technology.",
    type: "website",
    locale: "en_US",
    siteName: "CodeU Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeU Academy",
    description:
      "Learn from industry experts. CodeU Academy offers professional courses in programming, design, and technology.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-neutral-50 font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
