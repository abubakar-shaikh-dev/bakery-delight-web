import { NextRequest, NextResponse } from "next/server";
import { getTreatsPage } from "@/lib/site-data";

/** Public, read-only, paginated treats for the treats browser. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim().slice(0, 60);
  const category = (searchParams.get("category") ?? "").trim().slice(0, 40);
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit")) || 8));
  const offset = Math.min(10000, Math.max(0, Number(searchParams.get("offset")) || 0));

  const page = await getTreatsPage(q, category, limit, offset);
  return NextResponse.json(page);
}
