"use server";

import { db } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";

export async function getMessages() {
  try {
    const list = await db
      .select()
      .from(messages)
      .orderBy(desc(messages.receivedAt));
    
    // Convert Dates to ISO strings to make them safe for client component serialization
    return (list as any[]).map((m: any) => ({
      ...m,
      receivedAt: (m.receivedAt as Date).toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return [];
  }
}

export async function deleteMessage(id: number) {
  try {
    await db.delete(messages).where(eq(messages.id, id));
    revalidatePath("/admin/inbox");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete message with id ${id}:`, error);
    return { success: false, error: "Database error. Failed to delete message." };
  }
}

export async function toggleMessageRead(id: number, currentReadStatus: boolean) {
  try {
    await db
      .update(messages)
      .set({ read: !currentReadStatus })
      .where(eq(messages.id, id));
    revalidatePath("/admin/inbox");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error(`Failed to toggle read status for message ${id}:`, error);
    return { success: false, error: "Database error. Failed to update message." };
  }
}
