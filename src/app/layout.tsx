import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { PT_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const ptMono = PT_Mono({
  weight: "400",
  variable: "--font-pt-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://insequence.so";

export const metadata: Metadata = {
  title: {
    default: "Sequence — Own Your Future",
    template: "%s — Sequence",
  },
  description:
    "Transform your portfolio of projects into a portfolio of assets.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "Sequence",
    title: "Sequence — Own Your Future",
    description:
      "Transform your portfolio of projects into a portfolio of assets.",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Sequence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sequence — Own Your Future",
    description:
      "Transform your portfolio of projects into a portfolio of assets.",
    images: ["/images/og-default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${ptMono.variable}`}>
      <body className="antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
