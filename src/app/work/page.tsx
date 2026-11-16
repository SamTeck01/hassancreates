import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import WorkIndex from "./WorkIndex";
import { getProjects } from "@/lib/projects";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Work",
  description: "Brand identity, visual and motion design by Hassan Okesanjo — for Fhenix, Morph, Zama, Arcium, Drosera, Palmy and more.",
  alternates: { canonical: "/work" },
};

export default async function WorkPage() {
  const projects = await getProjects();
  return (
    <SiteChrome>
      <WorkIndex projects={projects} />
    </SiteChrome>
  );
}
