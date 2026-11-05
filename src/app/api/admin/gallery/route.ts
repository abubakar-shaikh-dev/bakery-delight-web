import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import GalleryImage from "@/models/GalleryImage";

async function GET_() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const images = await GalleryImage.find().sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ images });
}

const GALLERY_RATIOS = ["1:1", "16:9", "9:16"];

async function POST_(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  if (typeof body?.url !== "string" || !/^(https?:\/\/|\/)/.test(body.url) || body.url.length > 500)
    return NextResponse.json({ error: "An uploaded image is required." }, { status: 400 });

  const image = await GalleryImage.create({
    url: body.url,
    caption: typeof body?.caption === "string" ? body.caption.trim().slice(0, 120) : "",
    ratio: GALLERY_RATIOS.includes(body?.ratio) ? body.ratio : "1:1",
    cloudinaryPublicId: typeof body?.cloudinaryPublicId === "string" ? body.cloudinaryPublicId : null,
  });

  return NextResponse.json({ image }, { status: 201 });
}

export function GET() {
  return safeJson(() => GET_());
}

export function POST(req: NextRequest) {
  return safeJson(() => POST_(req));
}
