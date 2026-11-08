/**
 * Best-effort email alerts so new leads never sit unread. Uses Resend's
 * REST API via fetch — no SDK, no dependency. Everything is optional:
 * with RESEND_API_KEY / NOTIFY_EMAIL unset (or the send failing) the site
 * behaves exactly as before, like the Cloudinary fallback in storage.ts.
 *
 * To enable: set RESEND_API_KEY + NOTIFY_EMAIL (the owner's inbox) in
 * .env.local. NOTIFY_FROM is optional and defaults to Resend's sandbox
 * sender; verify a domain in Resend and set it to send from the bakery.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;
const NOTIFY_FROM = process.env.NOTIFY_FROM || "Bakery Delight <onboarding@resend.dev>";

export function notifyConfigured(): boolean {
  return Boolean(RESEND_API_KEY && NOTIFY_EMAIL);
}

export async function notifyOwner(
  subject: string,
  lines: string[],
): Promise<void> {
  if (!notifyConfigured()) return;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: NOTIFY_EMAIL,
        subject,
        text: lines.join("\n"),
      }),
    });
    if (!res.ok) {
      console.warn("[notify] owner email failed:", res.status);
    }
  } catch (err) {
    // Notifications must never break the request that triggered them.
    console.warn("[notify] owner email failed:", (err as Error).message);
  }
}
