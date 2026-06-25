import { getVisitors } from "@/app/actions/analytics";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const visitors = await getVisitors().catch(() => []);
  return <HomeClient visitors={visitors} />;
}
