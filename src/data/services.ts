import { Service } from "@/types";

/** Fallback copy; the live list comes from the admin (Services). Images are
 *  optional — the section pulls real project images that match each service. */
export const SERVICES_DATA: Service[] = [
  { id: "brand-identity", num: "01", title: "Brand Identity", count: "",
    description: "Logos, colour, type and the guidelines that hold them together, so the brand looks the same on a pitch deck as on a billboard.", image1: "", image2: "" },
  { id: "visual-design", num: "02", title: "Visual Design", count: "",
    description: "Campaign graphics, announcements and social visuals for teams that ship every week, consistent from the first post to the hundredth.", image1: "", image2: "" },
  { id: "motion-design", num: "03", title: "Motion Design", count: "",
    description: "Launch videos, animated graphics and UI motion that make an announcement land and a product easier to understand.", image1: "", image2: "" },
  { id: "event-branding", num: "04", title: "Event Branding", count: "",
    description: "Stage screens, badges, merch and signage that make an event feel like the brand behind it.", image1: "", image2: "" },
  { id: "ad-creatives", num: "05", title: "Ad Creatives", count: "",
    description: "Static ads for launches and paid campaigns, built to stop the scroll and say one thing clearly.", image1: "", image2: "" },
  { id: "pitch-decks", num: "06", title: "Pitch Decks", count: "",
    description: "Investor and launch decks with a clear story, clean data and the brand applied properly on every slide.", image1: "", image2: "" },
];
