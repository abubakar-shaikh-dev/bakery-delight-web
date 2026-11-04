import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Message from "@/models/Message";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!name || name.length > 80)
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120)
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (phone.length > 24)
    return NextResponse.json({ error: "Phone number looks too long." }, { status: 400 });
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
  return NextResponse.json({ ok: true });
}
