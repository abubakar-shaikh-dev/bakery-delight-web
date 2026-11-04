import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const settings = await Setting.findOne({ key: "site" }).lean();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const str = (v: unknown, max = 160) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

  const update: Record<string, unknown> = {};
  const simple = ["bakeryName", "tagline", "phone", "whatsappNumber", "whatsappDigits", "email", "address"] as const;
  for (const field of simple) {
    const value = str(body?.[field]);
    if (value !== undefined) update[field] = value;
  }
  if (body?.socials && typeof body.socials === "object") {
    const socials: Record<string, string> = {};
    for (const key of ["instagram", "whatsapp", "pinterest", "facebook", "youtube"]) {
      socials[key] = typeof body.socials[key] === "string" ? body.socials[key].trim().slice(0, 300) : "";
    }
    update.socials = socials;
  }

  const settings = await Setting.findOneAndUpdate(
    { key: "site" },
    { $set: update },
    { new: true, upsert: true },
  ).lean();

  return NextResponse.json({ settings });
}
