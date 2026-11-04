import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Treat, { slugify } from "@/models/Treat";
import { escapeRegex } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 60);
  const category = (searchParams.get("category") ?? "").trim().slice(0, 40);
  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit")) || 12));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);

  const rx = new RegExp(escapeRegex(q), "i");
  const filter: Record<string, unknown> = {};
  if (q) filter.$or = [{ name: rx }, { tagline: rx }, { description: rx }, { category: rx }];
  if (category) filter.category = category;

  const [treats, total] = await Promise.all([
    Treat.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
    Treat.countDocuments(filter),
  ]);

  return NextResponse.json({ treats, total });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });

  let slug = slugify(name);
  if (!slug) slug = `treat-${Date.now()}`;
  const exists = await Treat.findOne({ slug }).lean();
  if (exists) slug = `${slug}-${Date.now().toString(36)}`;

  const price =
    body?.price === null || body?.price === undefined || body?.price === ""
      ? null
      : Math.max(0, Number(body.price)) || null;

  const treat = await Treat.create({
    name: name.slice(0, 80),
    slug,
    category: typeof body?.category === "string" && body.category.trim() ? body.category.trim().slice(0, 40) : "Cakes",
    tagline: typeof body?.tagline === "string" ? body.tagline.trim().slice(0, 80) : "",
    description: typeof body?.description === "string" ? body.description.trim().slice(0, 1200) : "",
    price,
    image: typeof body?.image === "string" ? body.image : "",
    featured: Boolean(body?.featured),
  });

  return NextResponse.json({ treat }, { status: 201 });
}
