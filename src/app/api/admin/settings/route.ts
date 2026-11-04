import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Setting from "@/models/Setting";

async function GET_() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const settings = await Setting.findOne({ key: "site" }).lean();
  return NextResponse.json({ settings });
}

async function PUT_(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const str = (v: unknown, max = 160) => (typeof v === "string" ? v.trim().slice(0, max) : undefined);

  const update: Record<string, unknown> = {};
  const simple = ["bakeryName", "tagline", "phone", "whatsappNumber", "email", "address"] as const;
  for (const field of simple) {
    const value = str(body?.[field]);
    if (value !== undefined) update[field] = value;
  }
  // WhatsApp deep links are built from this — digits only.
  const digits = str(body?.whatsappDigits);
  if (digits !== undefined) update.whatsappDigits = digits.replace(/\D/g, "").slice(0, 20);
  if (body?.socials && typeof body.socials === "object") {
    const socials: Record<string, string> = {};
    for (const key of ["instagram", "whatsapp", "pinterest", "facebook", "youtube"]) {
      const value = typeof body.socials[key] === "string" ? body.socials[key].trim() : "";
      // Rendered as hrefs in the footer — only http(s) links are accepted.
      socials[key] = /^https?:\/\/.+/i.test(value) ? value.slice(0, 300) : "";
    }
    update.socials = socials;
  }

  const settings = await Setting.findOneAndUpdate(
    { key: "site" },
    { $set: update },
    { returnDocument: "after", upsert: true },
  ).lean();

  return NextResponse.json({ settings });
}

export function GET() {
  return safeJson(() => GET_());
}

export function PUT(req: NextRequest) {
  return safeJson(() => PUT_(req));
}
