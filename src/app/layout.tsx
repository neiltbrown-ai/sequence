import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { PT_Mono } from "next/font/google";
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
    default: "In Sequence — Creative Deal Structures for Creative Professionals",
    template: "%s — In Sequence",
  },
  description:
    "Learn creative deal structures used by top producers, managers, and executives. Membership includes frameworks, case studies, and strategic guides.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: "website",
    siteName: "In Sequence",
    title: "In Sequence — Creative Deal Structures for Creative Professionals",
    description:
      "Learn creative deal structures used by top producers, managers, and executives.",
    images: [
      {
        url: "/images/hero-portrait.png",
        width: 1200,
        height: 630,
        alt: "In Sequence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "In Sequence — Creative Deal Structures for Creative Professionals",
    description:
      "Learn creative deal structures used by top producers, managers, and executives.",
    images: ["/images/hero-portrait.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${ptMono.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
