import { NextRequest, NextResponse } from "next/server";
import { getGalleryPage } from "@/lib/site-data";

/** Public, read-only, paginated gallery for the gallery browser. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit")) || 12));
  const offset = Math.min(10000, Math.max(0, Number(searchParams.get("offset")) || 0));

  const page = await getGalleryPage(limit, offset);
  return NextResponse.json(page);
}
