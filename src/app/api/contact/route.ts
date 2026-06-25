import { NextResponse } from "next/server"
import { Resend } from "resend"
import { db } from "@/lib/db"
import { messages } from "@/lib/db/schema"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  if (!body || !body.name || !body.email || !body.description) {
    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    )
  }

  const { name, email, description } = body

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      { success: false, error: "Invalid email address" },
      { status: 400 }
    )
  }

  const subjectLine = `New project inquiry from ${name}`

  // 1. Try to save to database first so we don't lose the contact info
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
    console.error("Failed to save message to Neon database:", dbErr)
  }

  // 2. Try to send email notification via Resend
  let emailSent = false
  const apiKey = process.env.RESEND_API_KEY
  if (apiKey) {
    try {
      const resend = new Resend(apiKey)
      const { error } = await resend.emails.send({
        from: "HassanCreates Contact <onboarding@resend.dev>", // swap for verified domain later
        to:   "hassancreatess@gmail.com",
        replyTo: email,
        subject: subjectLine,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0c0c0c;color:#fff;border-radius:16px">
            <h2 style="margin:0 0 24px;font-size:24px;font-weight:600">New project inquiry</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px;width:120px">Name</td>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:15px">${name}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px">Email</td>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:15px"><a href="mailto:${email}" style="color:#a78bfa">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:12px 0;color:rgba(255,255,255,0.5);font-size:13px;vertical-align:top">Description</td>
                <td style="padding:12px 0;font-size:15px;line-height:1.6;white-space:pre-wrap">${description}</td>
              </tr>
            </table>
            <p style="margin:32px 0 0;font-size:12px;color:rgba(255,255,255,0.3)">Sent from hassancreates.com contact form</p>
          </div>
        `,
      })

      if (error) {
        console.error("Resend send error:", error)
      } else {
        emailSent = true
      }
    } catch (emailErr) {
      console.error("Resend connection/API error:", emailErr)
    }
  } else {
    console.warn("RESEND_API_KEY is not set. Skipping email notification.")
  }

  // If we couldn't save to the DB AND couldn't send the email, report failure
  if (!dbSaved && !emailSent) {
    return NextResponse.json(
      { success: false, error: "Failed to submit form. Please try again." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, emailSent, dbSaved })
}
