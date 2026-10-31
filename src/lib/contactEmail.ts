/** Limits for contact-form fields (also stop huge payloads hitting DB/email). */
export const CONTACT_LIMITS = { name: 200, email: 320, description: 5000 } as const;

/** Escape text for safe insertion into HTML (visitor input goes into Hassan's inbox). */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip CR/LF so visitor input can't break email headers like Subject. */
export function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

export function renderContactEmail({ name, email, description }: { name: string; email: string; description: string }) {
  const n = escapeHtml(name);
  const e = escapeHtml(email);
  const d = escapeHtml(description);
  return `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0c0c0c;color:#fff;border-radius:16px">
            <h2 style="margin:0 0 24px;font-size:24px;font-weight:600">New project inquiry</h2>
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px;width:120px">Name</td>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:15px">${n}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);font-size:13px">Email</td>
                <td style="padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.1);font-size:15px"><a href="mailto:${e}" style="color:#a78bfa">${e}</a></td>
              </tr>
              <tr>
                <td style="padding:12px 0;color:rgba(255,255,255,0.5);font-size:13px;vertical-align:top">Description</td>
                <td style="padding:12px 0;font-size:15px;line-height:1.6;white-space:pre-wrap">${d}</td>
              </tr>
            </table>
            <p style="margin:32px 0 0;font-size:12px;color:rgba(255,255,255,0.3)">Sent from hassancreates.design contact form</p>
          </div>
        `;
}
