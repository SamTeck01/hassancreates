import { getVercelAnalytics } from "@/app/actions/analytics";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const analytics = await getVercelAnalytics().catch(() => ({
    views: 0, visitors: 0, viewsToday: 0, visitorsToday: 0,
    topPages: [], available: false,
  }));
  return <HomeClient analytics={analytics} />;
}
