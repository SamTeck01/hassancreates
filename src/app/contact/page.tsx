import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import Contact from "@/components/Contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Hassan Okesanjo — brand identity, visual and motion design.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <SiteChrome>
      <div className="pt-24 sm:pt-28">
        <Contact />
      </div>
    </SiteChrome>
  );
}
