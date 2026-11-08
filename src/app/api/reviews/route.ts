import { NextRequest, NextResponse } from "next/server";
import { clientIp, rateLimit, safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import { notifyOwner } from "@/lib/notify";
import { getReviewsPage } from "@/lib/site-data";

/** Public: paginated approved reviews with average. */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit")) || 9));
  const offset = Math.min(10000, Math.max(0, Number(searchParams.get("offset")) || 0));

  const page = await getReviewsPage(limit, offset);
  return NextResponse.json(page);
}

const PLATFORMS = ["Instagram", "WhatsApp", "Facebook", "Google", "Other"];

/** Public: submit a review (lands unapproved for admin moderation). */
async function POST_(req: NextRequest) {
  // Spam guard: 5 submissions per IP per hour, per instance.
  if (!rateLimit(`review:${clientIp(req)}`, 5, 60 * 60_000)) {
    return NextResponse.json(
      { error: "Too many reviews submitted. Please try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const rating = Number(body?.rating);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const socialPlatform =
    typeof body?.socialPlatform === "string" && PLATFORMS.includes(body.socialPlatform)
      ? body.socialPlatform
      : null;
  const socialUrl =
    typeof body?.socialUrl === "string" && /^https?:\/\/.+/i.test(body.socialUrl.trim())
      ? body.socialUrl.trim().slice(0, 300)
      : null;

  if (!name || name.length > 60)
    return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    return NextResponse.json({ error: "Please pick a star rating." }, { status: 400 });
  if (!text || text.length < 10 || text.length > 600)
    return NextResponse.json(
      { error: "Your review should be between 10 and 600 characters." },
      { status: 400 },
    );

  const conn = await connectDB();
  if (!conn)
    return NextResponse.json(
      { error: "We couldn't save your review right now. Please try again shortly." },
      { status: 503 },
    );

  await Review.create({ name, rating, text, socialPlatform, socialUrl, approved: false });
  // Best-effort alert — pending reviews are invisible on the site until
  // approved, so the owner needs to know one arrived.
  await notifyOwner(`New review from ${name} (${rating}★) — awaiting approval`, [
    `${name} rated ${rating}/5:`,
    "",
    text,
    "",
    "Approve in the admin panel: /admin/reviews",
  ]);
  return NextResponse.json({ ok: true });
}

export function POST(req: NextRequest) {
  return safeJson(() => POST_(req));
}
