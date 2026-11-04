import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isObjectId, safeJson } from "@/lib/api";
import { deleteStoredImage } from "@/lib/storage";
import { connectDB } from "@/lib/db";
import Treat from "@/models/Treat";

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
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
    if (typeof body?.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 80);
    if (typeof body?.category === "string" && body.category.trim()) update.category = body.category.trim().slice(0, 40);
    if (typeof body?.tagline === "string") update.tagline = body.tagline.trim().slice(0, 80);
    if (typeof body?.description === "string") update.description = body.description.trim().slice(0, 1200);
    if ("price" in (body ?? {})) {
      const n = Number(body.price);
      update.price =
        body.price === null || body.price === "" || !Number.isFinite(n) ? null : Math.max(0, n);
    }
    if (typeof body?.image === "string")
      update.image = /^(https?:\/\/|\/)/.test(body.image) ? body.image.slice(0, 500) : "";
    if (typeof body?.cloudinaryPublicId === "string" && body.cloudinaryPublicId)
      update.cloudinaryPublicId = body.cloudinaryPublicId.slice(0, 200);
    if (typeof body?.featured === "boolean") update.featured = body.featured;

    const treat = await Treat.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    if (!treat) return NextResponse.json({ error: "Treat not found" }, { status: 404 });

    return NextResponse.json({ treat });
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

    const treat = await Treat.findByIdAndDelete(id).lean();
    if (!treat) return NextResponse.json({ error: "Treat not found" }, { status: 404 });
    if (treat.image) await deleteStoredImage(treat.image, treat.cloudinaryPublicId ?? null);

    return NextResponse.json({ ok: true });
  });
}
