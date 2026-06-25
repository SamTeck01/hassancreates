import { NextResponse } from "next/server"

// ── Security Constants ──────────────────────────────────────────────────────
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/avif",
])

// Magic byte signatures — validates actual file content, not just the declared MIME
const MAGIC_BYTES: Array<{ type: string; bytes: number[]; offset?: number }> = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png",  bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "image/gif",  bytes: [0x47, 0x49, 0x46] },
  { type: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF
  { type: "image/avif", bytes: [0x66, 0x74, 0x79, 0x70], offset: 4 }, // ftyp
]

function validateMagicBytes(buffer: Buffer, declaredMime: string): boolean {
  // SVG is text-based — check for XML/SVG markers and block embedded scripts
  if (declaredMime === "image/svg+xml") {
    const text = buffer.slice(0, 500).toString("utf-8").toLowerCase()
    const hasSvgMarker = text.includes("<svg") || text.includes("<?xml")
    const hasScript    = text.includes("<script")
    return hasSvgMarker && !hasScript
  }

  for (const sig of MAGIC_BYTES) {
    const mimeMatch =
      sig.type === declaredMime ||
      (declaredMime === "image/jpg" && sig.type === "image/jpeg")
    if (!mimeMatch) continue
    const offset = sig.offset ?? 0
    if (sig.bytes.every((b, i) => buffer[offset + i] === b)) return true
  }
  return false
}

export async function POST(request: Request) {
  const cloudName    = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    console.error("Missing Cloudinary env vars — CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET not set")
    return NextResponse.json(
      { success: false, error: "Server misconfiguration" },
      { status: 500 }
    )
  }

  const formData = await request.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json(
      { success: false, error: "No file received" },
      { status: 400 }
    )
  }

  // ── Check 1: File size ────────────────────────────────────────────────────
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { success: false, error: "File too large. Maximum allowed size is 10 MB." },
      { status: 413 }
    )
  }

  // ── Check 2: MIME type allowlist ──────────────────────────────────────────
  const declaredMime = file.type.toLowerCase()
  if (!ALLOWED_TYPES.has(declaredMime)) {
    console.warn(`Blocked upload — disallowed MIME type: ${declaredMime}`)
    return NextResponse.json(
      { success: false, error: "File type not allowed. Only image files are accepted." },
      { status: 415 }
    )
  }

  // ── Check 3: Magic byte validation ────────────────────────────────────────
  const bytes  = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  if (!validateMagicBytes(buffer, declaredMime)) {
    console.warn(`Blocked upload — magic bytes do not match declared MIME: ${declaredMime}`)
    return NextResponse.json(
      { success: false, error: "File content does not match its declared type." },
      { status: 415 }
    )
  }

  // ── Forward directly to Cloudinary (unsigned preset) ─────────────────────
  const cloud = new FormData()
  cloud.append("file", file)
  cloud.append("upload_preset", uploadPreset)
  cloud.append("folder", "hassancreates")

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: cloud }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error("Cloudinary upload error:", err)
    return NextResponse.json(
      { success: false, error: "Upload to Cloudinary failed." },
      { status: 502 }
    )
  }

  const data = await res.json()
  return NextResponse.json({ success: true, url: data.secure_url })
}
