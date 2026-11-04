import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Treat, { slugify } from "@/models/Treat";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const update: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) {
    const name = body.name.trim().slice(0, 40);
    const clash = await Category.findOne({ name, _id: { $ne: id } }).lean();
    if (clash) return NextResponse.json({ error: `"${name}" already exists.` }, { status: 409 });
    update.name = name;
    update.slug = slugify(name) || undefined;
  }
  if (typeof body?.icon === "string" && body.icon) update.icon = body.icon;
  if (Number.isFinite(Number(body?.order))) update.order = Number(body.order);

  const category = await Category.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  return NextResponse.json({ category });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const category = await Category.findById(id).lean();
  if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

  const treatsInCategory = await Treat.countDocuments({ category: category.name });
  if (treatsInCategory > 0)
    return NextResponse.json(
      {
        error: `"${category.name}" still has ${treatsInCategory} treat${treatsInCategory === 1 ? "" : "s"}. Move or delete them first.`,
      },
      { status: 409 },
    );

  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
