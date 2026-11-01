import { NextResponse } from "next/server"
import { Resend } from "resend"
import { isAdminRequest } from "@/lib/adminAuth"

/**
 * Admin-only: send a test email exactly like the contact form does and
 * report Resend's answer, so email problems can be diagnosed from the
 * dashboard. Never returns the API key.
 */
export async function POST() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.CONTACT_FROM_EMAIL || "HassanCreates Contact <onboarding@resend.dev>"
  const to = process.env.CONTACT_TO_EMAIL || "hassancreatess@gmail.com"
  const config = {
    keyPresent: !!apiKey,
    keyPrefix: apiKey ? apiKey.slice(0, 3) : null,
    from,
    to,
    fromIsDefault: !process.env.CONTACT_FROM_EMAIL,
  }

  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY is not set on this deployment.", config })
  }

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject: "HassanCreates: test email from the dashboard",
      html: "<p>If you can read this, contact-form emails are working. ✅</p>",
    })
    if (error) return NextResponse.json({ ok: false, error: `${error.name}: ${error.message}`, config })
    return NextResponse.json({ ok: true, id: data?.id, config })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message, config })
  }
}
