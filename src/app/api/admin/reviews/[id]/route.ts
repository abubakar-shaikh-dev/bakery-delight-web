import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const update: Record<string, unknown> = {};
  if (typeof body?.approved === "boolean") update.approved = body.approved;
  if (typeof body?.featured === "boolean") update.featured = body.featured;

  const review = await Review.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  return NextResponse.json({ review });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const body = await req.json().catch(() => null);

  const update: Record<string, unknown> = {};
  if (typeof body?.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 60);
  if (Number.isInteger(Number(body?.rating))) update.rating = Math.min(5, Math.max(1, Number(body.rating)));
  if (typeof body?.text === "string" && body.text.trim().length >= 10) update.text = body.text.trim().slice(0, 600);
  if ("socialPlatform" in (body ?? {})) update.socialPlatform = body.socialPlatform || null;
  if ("socialUrl" in (body ?? {})) update.socialUrl = body.socialUrl || null;
  if (typeof body?.approved === "boolean") update.approved = body.approved;
  if (typeof body?.featured === "boolean") update.featured = body.featured;

  const review = await Review.findByIdAndUpdate(id, update, { new: true }).lean();
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  return NextResponse.json({ review });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const conn = await connectDB();
  if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const { id } = await params;
  const review = await Review.findByIdAndDelete(id).lean();
  if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
