import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Global motion components
import CustomCursor from "@/components/CustomCursor";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollProgress from "@/components/ScrollProgress";
import JsonLd from "@/components/JsonLd";

export const viewport: Viewport = {
  themeColor: "#6B21D9",
  width: "device-width",
  initialScale: 1,
};

const SITE_URL = "https://hassancreates.design";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Hassan Okesanjo — Visual & Brand Designer",
    template: "%s | hassancreates",
  },
  description:
    "Hassan Okesanjo is a visual and brand designer in Lagos, Nigeria. Brand identity, visual and motion design for Web3 teams like Fhenix, Zama, Arcium and Drosera. Available for freelance and full-time work.",

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
    "Freelance Designer Lagos",
    "Brand Designer Nigeria",
    "Web3 Brand Designer",
    "Motion Designer for Hire",
    "Brand Designer Portfolio",
    
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
    title: "Hassan Okesanjo | Visual & Brand Designer",
    description:
      "I turn ideas into visuals that stick. Portfolio of Hassan Okesanjo — Visual & Brand Designer based in Lagos, Nigeria. Brand identity, motion graphics, UI/UX.",
    url: SITE_URL,
    siteName: "hassancreates",
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Hassan Okesanjo | Visual & Brand Designer",
    description:
      "I turn ideas into visuals that stick. Portfolio of Hassan — Visual & Brand Designer based in Lagos, Nigeria.",
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
      className="h-full antialiased"
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
