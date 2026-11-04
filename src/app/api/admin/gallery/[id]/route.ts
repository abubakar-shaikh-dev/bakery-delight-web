import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteStoredImage } from "@/lib/storage";
import { connectDB } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (typeof body?.caption !== "string")
    return NextResponse.json({ error: "`caption` string is required" }, { status: 400 });

  const image = await GalleryImage.findByIdAndUpdate(
    id,
    { caption: body.caption.trim().slice(0, 120) },
    { new: true },
  ).lean();
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  return NextResponse.json({ image });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const image = await GalleryImage.findByIdAndDelete(id).lean();
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });


  return NextResponse.json({ ok: true });
}
