import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Global motion components
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#6B21D9",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "hassancreates | Visual & Motion Designer Portfolio",
  description:
    "I turn ideas into visuals that stick. Welcome to the portfolio of Hassan, a Visual and Motion Designer working at the intersection of strategy and aesthetics.",
  keywords: [
    "Hassan",
    "hassancreates",
    "Visual Designer",
    "Motion Designer",
    "Graphic Designer",
    "Creative Director",
    "Branding",
    "Web Design",
    "UI/UX Design",
    "Kyiv Type Titling",
    "Design Portfolio",
    "Digital Art",
  ],
  authors: [{ name: "Hassan", url: "https://hassancreates.com" }],
  creator: "Hassan",
  openGraph: {
    title: "hassancreates | Visual & Motion Designer Portfolio",
    description:
      "I turn ideas into visuals that stick. Welcome to the portfolio of Hassan, a Visual and Motion Designer.",
    url: "https://hassancreates.com",
    siteName: "hassancreates",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "hassancreates | Visual & Motion Designer Portfolio",
    description:
      "I turn ideas into visuals that stick. Welcome to the portfolio of Hassan, a Visual and Motion Designer.",
    creator: "@hassancreates",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <CustomCursor />
        <SmoothScroll />
        <ScrollProgress />
        {children}
      </body>
    </html>
  );
}
