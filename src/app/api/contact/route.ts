import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { messages } from "@/lib/db/schema"
import { CONTACT_LIMITS, oneLine } from "@/lib/contactEmail"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.description) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    )
  }

  if (typeof body.name !== "string" || typeof body.email !== "string" || typeof body.description !== "string") {
    return NextResponse.json({ success: false, error: "Invalid fields" }, { status: 400 })
  }
  const name = oneLine(body.name)
  const email = body.email.trim()
  const description = body.description.trim()
  if (
    !name || !description ||
    name.length > CONTACT_LIMITS.name ||
    email.length > CONTACT_LIMITS.email ||
    description.length > CONTACT_LIMITS.description
  ) {
    return NextResponse.json({ success: false, error: "Field missing or too long" }, { status: 400 })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: "Invalid email address" },
      { status: 400 }
    )
  }

  const subjectLine = `New project inquiry from ${name}`

  // Messages go to the admin inbox (/admin/inbox). No email service needed.
  try {
    await db.insert(messages).values({
      name,
      email,
      subject: subjectLine,
      message: description,
      read: false,
    })
  } catch (dbErr) {
    console.error("Failed to save contact message:", dbErr)
    return NextResponse.json(
      { success: false, error: "Failed to submit form. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
