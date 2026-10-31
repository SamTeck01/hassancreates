import HomeClient from "./HomeClient";
import { getProjects } from "@/lib/projects";

// Re-render at most once a minute so admin edits show up without a redeploy.
export const revalidate = 60;

export default async function Home() {
  const projects = await getProjects();
  return <HomeClient projects={projects} />;
}
