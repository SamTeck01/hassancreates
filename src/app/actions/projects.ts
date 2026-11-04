"use server";

import { isAdminRequest } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";

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
    trimmed === "#" ||
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
  // tagline and link are optional (the form fills sensible defaults)
  if (data.href && data.href !== "#" && !sanitizeUrl(data.href)) return "Project link must start with http(s):// or /.";
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
  if (!(await isAdminRequest())) return { success: false, error: "Unauthorized. Please log in again." };
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
  if (!(await isAdminRequest())) return { success: false, error: "Unauthorized. Please log in again." };
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
  if (!(await isAdminRequest())) return { success: false, error: "Unauthorized. Please log in again." };
  try {
    await db.delete(projects).where(eq(projects.id, sanitizeText(id, 100)));
    // Close the gap so numbers stay 01, 02, 03… in the same order
    const rest = await db.select({ id: projects.id }).from(projects).orderBy(asc(projects.number));
    await renumber(rest.map((r) => r.id));
    
    revalidatePath("/admin");
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to delete project from database:", error);
    return { success: false, error: "Database error. Failed to delete project." };
  }
}

// ── Reorder Projects ──────────────────────────────────────────────────────────
/** Give projects the numbers 01, 02, 03… in the order of `ids`. */
async function renumber(ids: string[]) {
  for (let i = 0; i < ids.length; i++) {
    await db.update(projects).set({ number: String(i + 1).padStart(2, "0") }).where(eq(projects.id, ids[i]));
  }
}

/** Save a new order for the works. `ids` must list every project exactly once. */
export async function reorderProjects(ids: string[]) {
  if (!(await isAdminRequest())) return { success: false, error: "Unauthorized. Please log in again." };
  try {
    if (!Array.isArray(ids) || ids.some((x) => typeof x !== "string")) {
      return { success: false, error: "Invalid order." };
    }
    const clean = ids.map((x) => sanitizeText(x, 100));
    const existing = (await db.select({ id: projects.id }).from(projects)).map((r) => r.id);
    const same = clean.length === existing.length && new Set(clean).size === clean.length && clean.every((x) => existing.includes(x));
    if (!same) return { success: false, error: "The list changed — please refresh and try again." };

    await renumber(clean);
    revalidatePath("/admin");
    revalidatePath("/admin/works");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder projects:", error);
    return { success: false, error: "Database error. Failed to save the new order." };
  }
}
