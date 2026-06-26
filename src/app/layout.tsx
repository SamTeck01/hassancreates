import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Global motion components
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import JsonLd from "@/components/JsonLd";

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

const SITE_URL = "https://hassancreates.design";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Hassan Okesanjo | Visual & Motion Designer — hassancreates.design",
    template: "%s | hassancreates",
  },
  description:
    "Hassan is a Visual and Motion Designer based in London, UK. Specialising in brand identity, motion graphics, UI/UX design, and creative direction. Available for freelance projects worldwide.",

  keywords: [
    // Brand
    "hassancreates",
    "Hassan Okesanjo",
    "hassancreates.design",
    // Core disciplines
    "Visual Designer",
    "Motion Designer",
    "Graphic Designer",
    "Creative Director",
    "Brand Identity Designer",
    // Services
    "Logo Design",
    "Motion Graphics",
    "UI/UX Design",
    "Web Design",
    "Social Media Design",
    "Branding",
    "Rebranding",
    "Design Portfolio",
    // Location & intent
    "Freelance Designer London",
    "Freelance Graphic Designer UK",
    "Motion Designer for Hire",
    "Brand Designer Portfolio",
    "Creative Portfolio 2025",
    // Long-tail
    "Visual designer for startups",
    "Motion design for brands",
    "I turn ideas into visuals that stick",
    "Design that converts",
  ],

  authors: [{ name: "Hassan Okesanjo", url: SITE_URL }],
  creator: "Hassan Okesanjo",
  publisher: "hassancreates",

  alternates: {
    canonical: SITE_URL,
  },

  openGraph: {
    title: "Hassan Okesanjo | Visual & Motion Designer",
    description:
      "I turn ideas into visuals that stick. Portfolio of Hassan Okesanjo — Visual & Motion Designer based in London, UK. Brand identity, motion graphics, UI/UX.",
    url: SITE_URL,
    siteName: "hassancreates",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "hassancreates — Visual & Motion Designer Portfolio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Hassan Okesanjo | Visual & Motion Designer",
    description:
      "I turn ideas into visuals that stick. Portfolio of Hassan — Visual & Motion Designer based in London.",
    creator: "@hassancreates",
    images: ["/og-image.png"],
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

  verification: {
    // Add your Google Search Console verification token here once you set up GSC
    // google: "your-verification-token",
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased" suppressHydrationWarning>
        <JsonLd />
        <CustomCursor />
        <SmoothScroll />
        <ScrollProgress />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
