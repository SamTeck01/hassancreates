// Server component — no "use client" needed.
// Injects JSON-LD structured data on every page for rich search results.

const SITE_URL = "https://hassancreates.design";

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Hassan Okesanjo",
  url: SITE_URL,
  jobTitle: "Visual & Motion Designer",
  description:
    "Hassan Okesanjo is a Visual and Motion Designer based in London, UK, specialising in brand identity, motion graphics, UI/UX design, and creative direction.",
  image: `${SITE_URL}/avatar.png`,
  sameAs: [
    "https://linkedin.com/in/hassan-okesanjo-46a948353",
    "https://behance.net/hassanokesanjo1",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "London",
    addressCountry: "GB",
  },
  knowsAbout: [
    "Brand Identity Design",
    "Motion Graphics",
    "UI/UX Design",
    "Visual Design",
    "Creative Direction",
    "Logo Design",
    "Web Design",
    "Social Media Design",
  ],
};

const professionalServiceSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "hassancreates",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  image: `${SITE_URL}/og-image.png`,
  description:
    "Visual & Motion Design studio by Hassan Okesanjo. Services include brand identity, motion graphics, UI/UX, web design, and social media design.",
  founder: {
    "@type": "Person",
    name: "Hassan Okesanjo",
  },
  areaServed: "Worldwide",
  serviceType: [
    "Brand Identity Design",
    "Motion Graphics",
    "UI/UX Design",
    "Logo Design",
    "Web Design",
    "Social Media Design",
  ],
  priceRange: "££",
  address: {
    "@type": "PostalAddress",
    addressLocality: "London",
    addressCountry: "GB",
  },
  sameAs: [
    "https://linkedin.com/in/hassan-okesanjo-46a948353",
    "https://behance.net/hassanokesanjo1",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "hassancreates",
  url: SITE_URL,
  description:
    "Portfolio of Hassan Okesanjo — Visual & Motion Designer based in London.",
  author: {
    "@type": "Person",
    name: "Hassan Okesanjo",
  },
};

export default function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
