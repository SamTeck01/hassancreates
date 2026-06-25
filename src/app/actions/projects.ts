"use server";

import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// ── Input Sanitization ────────────────────────────────────────────────────────
function sanitizeText(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return "";
  return input.trim().slice(0, maxLength);
}

function sanitizeUrl(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  // Only allow relative paths or http/https URLs — block javascript: and data: URIs
  if (
    trimmed.startsWith("./") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed.slice(0, 500);
  }
  return "";
}

function sanitizeImageUrl(input: unknown): string {
  if (typeof input !== "string") return "";
  const trimmed = input.trim();
  // Allow relative paths or https Cloudinary/external image URLs
  if (trimmed.startsWith("/") || trimmed.startsWith("https://")) {
    return trimmed.slice(0, 500);
  }
  return "";
}

function validateProjectPayload(data: Record<string, unknown>): string | null {
  if (!sanitizeText(data.clientName, 200)) return "Client name is required.";
  if (!sanitizeText(data.year, 10)) return "Year is required.";
  if (!sanitizeText(data.role, 200)) return "Role is required.";
  if (!sanitizeText(data.description, 2000)) return "Description is required.";
  if (!sanitizeText(data.tagline, 2000)) return "Tagline is required.";
  if (!sanitizeUrl(data.href)) return "Valid project URL is required.";
  if (!sanitizeImageUrl(data.coverImage)) return "Valid cover image URL is required.";
  return null;
}

// ── Add Project ───────────────────────────────────────────────────────────────
export async function addProject(data: {
  id: string;
  number: string;
  clientName: string;
  year: string;
  role: string;
  services: string[];
  description: string;
  tagline: string;
  href: string;
  coverImage: string;
  coverSrcSet?: string;
  swiperImages?: string[];
  imageCaptions?: string[];
  bgImage?: string;
  bgSrcSet?: string;
}) {
  const validationError = validateProjectPayload(data as Record<string, unknown>);
  if (validationError) return { success: false, error: validationError };

  const safeServices = Array.isArray(data.services)
    ? data.services.map(s => sanitizeText(s, 100)).filter(Boolean).slice(0, 20)
    : [];

  const safeCoverImage = sanitizeImageUrl(data.coverImage);
  const safeBgImage = sanitizeImageUrl(data.bgImage) || safeCoverImage;

  try {
    await db.insert(projects).values({
      id: sanitizeText(data.id, 100),
      number: sanitizeText(data.number, 10),
      clientName: sanitizeText(data.clientName, 200),
      year: sanitizeText(data.year, 10),
      role: sanitizeText(data.role, 200),
      services: safeServices,
      description: sanitizeText(data.description, 2000),
      tagline: sanitizeText(data.tagline, 2000),
      href: sanitizeUrl(data.href),
      coverImage: safeCoverImage,
      coverSrcSet: sanitizeText(data.coverSrcSet, 1000) || `${safeCoverImage} 1024w`,
      swiperImages: Array.isArray(data.swiperImages)
        ? data.swiperImages.map(u => sanitizeImageUrl(u)).filter(Boolean).slice(0, 20)
        : [safeCoverImage],
      imageCaptions: Array.isArray(data.imageCaptions)
        ? data.imageCaptions.map(c => sanitizeText(c, 300)).slice(0, 20)
        : ["Project showcase image."],
      bgImage: safeBgImage,
      bgSrcSet: sanitizeText(data.bgSrcSet, 1000) || `${safeBgImage} 2048w`,
    });

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to insert project into database:", error);
    return { success: false, error: "Database error. Failed to save project." };
  }
}

// ── Update Project ────────────────────────────────────────────────────────────
export async function updateProject(id: string, data: {
  clientName: string;
  year: string;
  role: string;
  services: string[];
  description: string;
  tagline: string;
  href: string;
  coverImage: string;
  coverSrcSet?: string;
  swiperImages?: string[];
  imageCaptions?: string[];
  bgImage?: string;
  bgSrcSet?: string;
}) {
  const validationError = validateProjectPayload(data as Record<string, unknown>);
  if (validationError) return { success: false, error: validationError };

  const safeServices = Array.isArray(data.services)
    ? data.services.map(s => sanitizeText(s, 100)).filter(Boolean).slice(0, 20)
    : [];

  const safeCoverImage = sanitizeImageUrl(data.coverImage);
  const safeBgImage = sanitizeImageUrl(data.bgImage) || safeCoverImage;

  try {
    await db.update(projects).set({
      clientName: sanitizeText(data.clientName, 200),
      year: sanitizeText(data.year, 10),
      role: sanitizeText(data.role, 200),
      services: safeServices,
      description: sanitizeText(data.description, 2000),
      tagline: sanitizeText(data.tagline, 2000),
      href: sanitizeUrl(data.href),
      coverImage: safeCoverImage,
      coverSrcSet: sanitizeText(data.coverSrcSet, 1000) || `${safeCoverImage} 1024w`,
      swiperImages: Array.isArray(data.swiperImages)
        ? data.swiperImages.map(u => sanitizeImageUrl(u)).filter(Boolean).slice(0, 20)
        : [safeCoverImage],
      imageCaptions: Array.isArray(data.imageCaptions)
        ? data.imageCaptions.map(c => sanitizeText(c, 300)).slice(0, 20)
        : ["Project showcase image."],
      bgImage: safeBgImage,
      bgSrcSet: sanitizeText(data.bgSrcSet, 1000) || `${safeBgImage} 2048w`,
    }).where(eq(projects.id, sanitizeText(id, 100)));

    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update project in database:", error);
    return { success: false, error: "Database error. Failed to update project." };
  }
}

// ── Delete Project ────────────────────────────────────────────────────────────
export async function deleteProject(id: string) {
  try {
    await db.delete(projects).where(eq(projects.id, sanitizeText(id, 100)));
    
    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project from database:", error);
    return { success: false, error: "Database error. Failed to delete project." };
  }
}
