import { getMessages } from "@/app/actions/messages";
import InboxClient from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const initialMessages = await getMessages();
  return <InboxClient initialMessages={initialMessages} />;
}
