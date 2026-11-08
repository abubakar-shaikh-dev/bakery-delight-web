import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";
import { notifyOwner } from "@/lib/notify";
import { isOptionalPhone } from "@/lib/utils";

async function POST_(req: NextRequest) {
  // Spam guard: 5 messages per IP per hour, per instance.
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json(
      { error: "Too many messages sent. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || name.length > 80)
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120)
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (phone.length > 24 || !isOptionalPhone(phone))
    return NextResponse.json({ error: "Phone number looks off — digits, spaces and + - ( ) only." }, { status: 400 });
  if (!message || message.length < 5 || message.length > 2000)
    return NextResponse.json(
      { error: "Your message should be between 5 and 2000 characters." },
      { status: 400 },
    );

  const conn = await connectDB();
  if (!conn)
    return NextResponse.json(
      { error: "We couldn't reach the kitchen right now. Please try WhatsApp instead." },
      { status: 503 },
    );

  await Message.create({ name, email, phone, message });
  // Best-effort alert so the owner hears about the lead without opening the
  // admin panel. Never blocks or fails the submission.
  await notifyOwner(`New message from ${name}`, [
    `From: ${name} <${email}>${phone ? ` · ${phone}` : ""}`,
    "",
    message,
    "",
    "Reply in the admin panel: /admin/messages",
  ]);
  return NextResponse.json({ ok: true });
}

export function POST(req: NextRequest) {
  return safeJson(() => POST_(req));
}
