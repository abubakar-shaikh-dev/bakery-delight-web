import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UploadedImage from "@/models/UploadedImage";

type Params = { params: Promise<{ id: string }> };

/** Serves images stored in MongoDB (fallback when Cloudinary is unavailable). */
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id))
    return NextResponse.json({ error: "Invalid image id" }, { status: 400 });

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const doc = await UploadedImage.findById(id);
  if (!doc) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  return new NextResponse(new Uint8Array(doc.data), {
    headers: {
      "Content-Type": doc.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
