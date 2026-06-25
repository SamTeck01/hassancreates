"use server";

import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// ── Input Validation Helpers ────────────────────────────────────────────────
function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLength);
}

function validateServicePayload(data: Record<string, unknown>): string | null {
  const title = sanitizeText(data.title, 200);
  const description = sanitizeText(data.description, 1000);
  const count = sanitizeText(data.count, 20);
  const num = sanitizeText(data.num, 10);

  if (!title) return "Service title is required.";
  if (!description) return "Service description is required.";
  if (!num) return "Service number is required.";
  if (!count) return "Service count is required.";
  return null;
}

// ── Add Service ─────────────────────────────────────────────────────────────
export async function addService(data: {
  id: string;
  num: string;
  title: string;
  count: string;
  description: string;
  image1: string;
  image2: string;
}) {
  const validationError = validateServicePayload(data as Record<string, unknown>);
  if (validationError) return { success: false, error: validationError };

  try {
    await db.insert(services).values({
      id: sanitizeText(data.id, 100),
      num: sanitizeText(data.num, 10),
      title: sanitizeText(data.title, 200),
      count: sanitizeText(data.count, 20),
      description: sanitizeText(data.description, 1000),
      image1: sanitizeText(data.image1, 500),
      image2: sanitizeText(data.image2, 500),
    });

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to insert service:", error);
    return { success: false, error: "Database error. Failed to save service." };
  }
}

// ── Update Service ───────────────────────────────────────────────────────────
export async function updateService(id: string, data: {
  title: string;
  count: string;
  description: string;
  image1: string;
  image2: string;
}) {
  const validationError = validateServicePayload(data as Record<string, unknown>);
  if (validationError) return { success: false, error: validationError };

  try {
    await db.update(services).set({
      title: sanitizeText(data.title, 200),
      count: sanitizeText(data.count, 20),
      description: sanitizeText(data.description, 1000),
      image1: sanitizeText(data.image1, 500),
      image2: sanitizeText(data.image2, 500),
    }).where(eq(services.id, sanitizeText(id, 100)));

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to update service:", error);
    return { success: false, error: "Database error. Failed to update service." };
  }
}

// ── Delete Service ───────────────────────────────────────────────────────────
export async function deleteService(id: string) {
  try {
    await db.delete(services).where(eq(services.id, sanitizeText(id, 100)));

    revalidatePath("/admin");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Failed to delete service:", error);
    return { success: false, error: "Database error. Failed to delete service." };
  }
}

// ── Get All Services ─────────────────────────────────────────────────────────
export async function getServices() {
  try {
    return await db.select().from(services);
  } catch (error) {
    console.error("Failed to retrieve services:", error);
    return [];
  }
}
