import { NextRequest, NextResponse } from "next/server";
import { isObjectId, safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import UploadedImage from "@/models/UploadedImage";

type Params = { params: Promise<{ id: string }> };

/** Serves images stored in MongoDB (fallback when Cloudinary is unavailable). */
async function GET_(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!isObjectId(id))
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

export function GET(req: NextRequest, ctx: Params) {
  return safeJson(() => GET_(req, ctx));
}
