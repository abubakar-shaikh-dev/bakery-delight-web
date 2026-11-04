import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { slugify } from "@/models/Treat";

async function GET_() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const categories = await Category.find().sort({ order: 1, name: 1 }).limit(200).lean();
  return NextResponse.json({ categories });
}

async function POST_(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  if (name.length > 40)
    return NextResponse.json({ error: "Name is too long (max 40)." }, { status: 400 });

  const slug = slugify(name);
  if (!slug) return NextResponse.json({ error: "Name must contain letters or numbers." }, { status: 400 });

  const dupe = await Category.findOne({ $or: [{ name }, { slug }] }).lean();
  if (dupe)
    return NextResponse.json({ error: `"${dupe.name}" already exists.` }, { status: 409 });

  const last = await Category.findOne().sort({ order: -1 }).lean();
  const category = await Category.create({
    name,
    slug,
    icon: typeof body?.icon === "string" && body.icon ? body.icon : "sparkles",
    order: (last?.order ?? 0) + 1,
  });

  return NextResponse.json({ category }, { status: 201 });
}

export function GET() {
  return safeJson(() => GET_());
}

export function POST(req: NextRequest) {
  return safeJson(() => POST_(req));
}
