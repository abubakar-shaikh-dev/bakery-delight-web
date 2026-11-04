import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isObjectId, safeJson } from "@/lib/api";
import { deleteStoredImage } from "@/lib/storage";
import { connectDB } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";

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
    if (typeof body?.caption !== "string")
      return NextResponse.json({ error: "`caption` string is required" }, { status: 400 });

    const image = await GalleryImage.findByIdAndUpdate(
      id,
      { caption: body.caption.trim().slice(0, 120) },
      { returnDocument: "after" },
    ).lean();
    if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    return NextResponse.json({ image });
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

    const image = await GalleryImage.findByIdAndDelete(id).lean();
    if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    // Clean up the stored asset so deleting a row doesn't orphan it.
    await deleteStoredImage(image.url, image.cloudinaryPublicId ?? null);

    return NextResponse.json({ ok: true });
  });
}
