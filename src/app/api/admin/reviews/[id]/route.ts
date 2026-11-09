import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isObjectId, safeJson } from "@/lib/api";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  return safeJson(async () => {
    const denied = await requireAdmin();
    if (denied) return denied;

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const { id } = await params;
    if (!isObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json().catch(() => null);

    const update: Record<string, unknown> = {};
    if (typeof body?.approved === "boolean") update.approved = body.approved;
    if (typeof body?.featured === "boolean") update.featured = body.featured;

    const review = await Review.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    return NextResponse.json({ review });
  });
}

export async function PUT(req: NextRequest, { params }: Params) {
  return safeJson(async () => {
    const denied = await requireAdmin();
    if (denied) return denied;

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const { id } = await params;
    if (!isObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json().catch(() => null);

    const update: Record<string, unknown> = {};
    if (typeof body?.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 60);
    if (typeof body?.rating === "number")
      update.rating = Math.min(5, Math.max(1, Math.round(body.rating)));
    if (typeof body?.text === "string" && body.text.trim().length >= 10)
      update.text = body.text.trim().slice(0, 600);
    if ("socialPlatform" in (body ?? {})) {
      update.socialPlatform =
        typeof body.socialPlatform === "string" && body.socialPlatform.trim()
          ? body.socialPlatform.trim().slice(0, 40)
          : null;
    }
    if ("socialUrl" in (body ?? {})) {
      update.socialUrl =
        typeof body.socialUrl === "string" && /^https?:\/\/.+/i.test(body.socialUrl.trim())
          ? body.socialUrl.trim().slice(0, 300)
          : null;
    }
    if (typeof body?.approved === "boolean") update.approved = body.approved;
    if (typeof body?.featured === "boolean") update.featured = body.featured;
    if ("treatSlug" in (body ?? {})) {
      update.treatSlug =
        typeof body.treatSlug === "string" && body.treatSlug.trim()
          ? body.treatSlug.trim().slice(0, 80)
          : null;
    }

    const review = await Review.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    return NextResponse.json({ review });
  });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  return safeJson(async () => {
    const denied = await requireAdmin();
    if (denied) return denied;

    const conn = await connectDB();
    if (!conn) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

    const { id } = await params;
    if (!isObjectId(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const review = await Review.findByIdAndDelete(id).lean();
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  });
}
