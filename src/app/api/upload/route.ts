import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import fs from "fs";
import path from "path";

// ── Security Constants ───────────────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// Allowlist of MIME types by security — block any executable or script type
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
]);

// Map MIME → safe extension (avoid trusting client extension)
const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

// Magic byte signatures for image validation
const MAGIC_BYTES: Array<{ type: string; bytes: number[]; offset?: number }> = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "image/gif", bytes: [0x47, 0x49, 0x46] },
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // RIFF
  { type: "image/avif", bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }, // ftyp
];

function validateMagicBytes(buffer: Buffer, declaredMime: string): boolean {
  // SVG: text-based, validate it has XML-like structure and is not an executable
  if (declaredMime === "image/svg+xml") {
    const text = buffer.slice(0, 500).toString("utf-8").toLowerCase();
    // Must start with <?xml or <svg and must NOT contain script tags
    const hasSvgMarker = text.includes("<svg") || text.includes("<?xml");
    const hasScript = text.includes("<script");
    return hasSvgMarker && !hasScript;
  }

  for (const sig of MAGIC_BYTES) {
    if (sig.type !== declaredMime && !(declaredMime === "image/jpg" && sig.type === "image/jpeg")) continue;
    const offset = sig.offset ?? 0;
    const match = sig.bytes.every((b, i) => buffer[offset + i] === b);
    if (match) return true;
  }
  return false;
}

// Sanitize filename: remove path traversal, control chars, limit length
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-") // Allow only safe chars
    .replace(/\.{2,}/g, ".") // Prevent path traversal (..)
    .replace(/^[-_.]+/, "") // Strip leading special chars
    .slice(0, 100); // Max length
}

// Helper to manually load .env.local if not present in process.env
function loadEnvLocal() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const envFile = fs.readFileSync(envPath, "utf-8");
      envFile.split("\n").forEach((line) => {
        const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
        if (match) {
          const key = match[1].trim();
          let value = match[2].trim();
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          process.env[key] = value;
        }
      });
    }
  } catch (e) {
    console.error("Failed to load .env.local in upload API:", e);
  }
}

export async function POST(request: Request) {
  try {
    // Load env dynamically for this request
    loadEnvLocal();

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const isCloudinaryConfigured = !!(cloudName && apiKey && apiSecret);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file payload received" },
        { status: 400 }
      );
    }

    // ── Security Check 1: File size ─────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum allowed size is 10 MB." },
        { status: 413 }
      );
    }

    // ── Security Check 2: MIME type allowlist ────────────────────────────────
    const declaredMime = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(declaredMime)) {
      console.warn(`Blocked upload attempt — disallowed MIME type: ${declaredMime}`);
      return NextResponse.json(
        { success: false, error: "File type not allowed. Only image files are accepted." },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ── Security Check 3: Magic byte validation ──────────────────────────────
    if (!validateMagicBytes(buffer, declaredMime)) {
      console.warn(`Blocked upload — magic bytes do not match declared MIME: ${declaredMime}`);
      return NextResponse.json(
        { success: false, error: "File content does not match its declared type." },
        { status: 415 }
      );
    }

    if (isCloudinaryConfigured) {
      console.log("Using Cloudinary for file upload...");
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const uploadToCloudinary = (): Promise<any> => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "hassancreates",
              resource_type: "auto",
              // Cloudinary also validates on their end — defense in depth
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary upload stream error:", error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          );
          uploadStream.end(buffer);
        });
      };

      try {
        const result = await uploadToCloudinary();
        return NextResponse.json({ success: true, url: result.secure_url });
      } catch (cloudinaryError) {
        console.warn("Cloudinary upload failed, falling back to local filesystem:", cloudinaryError);
      }
    }

    // ── Local Filesystem Fallback ──────────────────────────────────────────
    console.log("Using local filesystem storage for upload.");

    const safeExtension = MIME_TO_EXTENSION[declaredMime] || "bin";
    const rawBaseName = file.name
      ? file.name.replace(/\.[^.]+$/, "") // Strip original extension
      : "upload";
    const cleanBaseName = sanitizeFilename(rawBaseName.toLowerCase()).replace(/\./g, "-");
    const uniqueFileName = `${cleanBaseName}-${Date.now()}.${safeExtension}`;
    const uploadsDir = join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDir, { recursive: true });
    const filePath = join(uploadsDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    // Never leak internal error details to the client
    console.error("File upload endpoint failure:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
