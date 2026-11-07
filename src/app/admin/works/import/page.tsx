import { headers } from "next/headers";
import ImportClient from "./ImportClient";
import { behanceBookmarklet } from "@/lib/behanceBookmarklet";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.hassancreates.design";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return <ImportClient bookmarklet={behanceBookmarklet(`${proto}://${host}`)} />;
}
