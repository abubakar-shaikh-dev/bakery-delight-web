import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { searchParams } = new URL(req.url);
  const filter: Record<string, unknown> = {};
  if (searchParams.get("status") === "pending") filter.approved = false;
  if (searchParams.get("status") === "approved") filter.approved = true;

  const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit")) || 12));
  const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
  const [reviews, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
    Review.countDocuments(filter),
  ]);
  return NextResponse.json({ reviews, total });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const rating = Number(body?.rating);
  const text = typeof body?.text === "string" ? body.text.trim() : "";

  if (!name || !Number.isInteger(rating) || rating < 1 || rating > 5 || text.length < 10)
    return NextResponse.json({ error: "Name, a 1–5 rating and a review of 10+ characters are required." }, { status: 400 });

  const review = await Review.create({
    name: name.slice(0, 60),
    rating,
    text: text.slice(0, 600),
    socialPlatform: typeof body?.socialPlatform === "string" ? body.socialPlatform : null,
    socialUrl: typeof body?.socialUrl === "string" ? body.socialUrl : null,
    avatar: typeof body?.avatar === "string" ? body.avatar : "",
    approved: body?.approved !== false,
    featured: Boolean(body?.featured),
  });

  return NextResponse.json({ review }, { status: 201 });
}
