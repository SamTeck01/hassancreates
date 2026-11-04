import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { messages } from "@/lib/db/schema"
import { Resend } from "resend"
import { CONTACT_LIMITS, oneLine, renderContactEmail } from "@/lib/contactEmail"

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

  // Every message goes to BOTH the admin inbox (/admin/inbox) and Hassan's
  // email. If one fails the other still delivers, so nothing is lost.

  // 1. Dashboard inbox
  let dbSaved = false
  try {
    await db.insert(messages).values({
      name,
      email,
      subject: subjectLine,
      message: description,
      read: false,
    })
    dbSaved = true
  } catch (dbErr) {
    console.error("Failed to save contact message:", dbErr)
  }

  // 2. Email to Hassan (Resend). Set in Vercel:
  //    RESEND_API_KEY       — required
  //    CONTACT_TO_EMAIL     — inbox that receives messages (default below)
  //    CONTACT_FROM_EMAIL   — sender on a domain verified in Resend,
  //                           e.g. "HassanCreates <contact@hassancreates.design>"
  let emailSent = false
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      const resend = new Resend(apiKey)
      const { error } = await resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "HassanCreates Contact <onboarding@resend.dev>",
        to: process.env.CONTACT_TO_EMAIL || "hokesanjn@gmail.com",
        replyTo: email,
        subject: subjectLine,
        html: renderContactEmail({ name, email, description }),
      })
      if (error) console.error("Resend send error:", error)
      else emailSent = true
    } catch (emailErr) {
      console.error("Resend connection/API error:", emailErr)
    }
  } else {
    console.warn("RESEND_API_KEY is not set — message saved to inbox, no email sent.")
  }

  if (!dbSaved && !emailSent) {
    return NextResponse.json(
      { success: false, error: "Failed to submit form. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, dbSaved, emailSent })
}
