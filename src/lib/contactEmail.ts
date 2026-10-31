/** Limits for contact-form fields (stop huge payloads reaching the DB). */
export const CONTACT_LIMITS = { name: 200, email: 320, description: 5000 } as const;

/** Collapse line breaks so a name stays on one line (e.g. in the subject). */
export function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}
