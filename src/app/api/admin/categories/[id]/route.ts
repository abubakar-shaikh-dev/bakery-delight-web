import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isObjectId, safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Treat, { slugify } from "@/models/Treat";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  return safeJson(async () => {
    const denied = await requireAdmin();
    if (denied) return denied;

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const { id } = await params;
    if (!isObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json().catch(() => null);

    const update: Record<string, unknown> = {};
    if (typeof body?.name === "string" && body.name.trim()) {
      const name = body.name.trim().slice(0, 40);
      const slug = slugify(name);
      if (!slug)
        return NextResponse.json({ error: "Name must contain letters or numbers." }, { status: 400 });
      const clash = await Category.findOne({ name, _id: { $ne: id } }).lean();
      if (clash) return NextResponse.json({ error: `"${name}" already exists.` }, { status: 409 });
      update.name = name;
      update.slug = slug;
    }
    if (typeof body?.icon === "string" && body.icon) update.icon = body.icon;
    if (Number.isInteger(body?.order) && (body.order as number) >= 0 && (body.order as number) <= 999)
      update.order = body.order;

    const category = await Category.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    if (!category) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    return NextResponse.json({ category });
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return safeJson(async () => {
    const denied = await requireAdmin();
    if (denied) return denied;

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const { id } = await params;
    if (!isObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

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
  });
}
