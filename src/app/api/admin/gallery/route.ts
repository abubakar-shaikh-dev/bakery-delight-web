import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const images = await GalleryImage.find().sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  if (typeof body?.url !== "string" || !body.url)
    return NextResponse.json({ error: "An uploaded image is required." }, { status: 400 });

  const image = await GalleryImage.create({
    url: body.url,
    caption: typeof body?.caption === "string" ? body.caption.trim().slice(0, 120) : "",
    cloudinaryPublicId: typeof body?.cloudinaryPublicId === "string" ? body.cloudinaryPublicId : null,
  });

  return NextResponse.json({ image }, { status: 201 });
}
