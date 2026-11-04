import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteStoredImage } from "@/lib/storage";
import { connectDB } from "@/lib/db";
import Treat from "@/models/Treat";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const update: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) update.name = body.name.trim();
  if (typeof body?.category === "string" && body.category.trim()) update.category = body.category.trim();
  if (typeof body?.tagline === "string") update.tagline = body.tagline.trim().slice(0, 80);
  if (typeof body?.description === "string") update.description = body.description.trim().slice(0, 1200);
  if ("price" in (body ?? {}))
    update.price =
      body.price === null || body.price === "" || !Number.isFinite(Number(body.price))
        ? null
        : Math.max(0, Number(body.price));
  if (typeof body?.image === "string") update.image = body.image;
  if (typeof body?.featured === "boolean") update.featured = body.featured;

  const treat = await Treat.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!treat) return NextResponse.json({ error: "Treat not found" }, { status: 404 });

  return NextResponse.json({ treat });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const treat = await Treat.findByIdAndDelete(id).lean();
  if (!treat) return NextResponse.json({ error: "Treat not found" }, { status: 404 });
  if (treat.image) await deleteStoredImage(treat.image, null);

  return NextResponse.json({ ok: true });
}
