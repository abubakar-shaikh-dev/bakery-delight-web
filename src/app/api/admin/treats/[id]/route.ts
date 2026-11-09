import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { isObjectId, safeJson } from "@/lib/api";
import { deleteStoredImage } from "@/lib/storage";
import { connectDB } from "@/lib/db";
import Treat, { normalizeImages, normalizeVariants } from "@/models/Treat";

type Params = { params: Promise<{ id: string }> };

/** Best-effort delete of stored bytes for every photo a save removed. */
async function cleanupRemovedPhotos(
  before: { image?: string; cloudinaryPublicId?: string | null; images?: Array<{ url?: string; publicId?: string | null }> } | null,
  nextCover: string,
  nextImages: Array<{ url: string; publicId: string | null }>,
) {
  if (!before) return;
  const kept = new Set(nextImages.map((i) => i.url));
  if (nextCover) kept.add(nextCover);

  const removed = new Set<string>();
  for (const img of before.images ?? []) {
    if (img?.url && !kept.has(img.url)) removed.add(img.url);
  }
  if (before.image && !kept.has(before.image)) removed.add(before.image);

  for (const url of removed) {
    const inList = (before.images ?? []).find((i) => i?.url === url);
    const publicId =
      url === before.image
        ? (inList?.publicId ?? before.cloudinaryPublicId ?? null)
        : (inList?.publicId ?? null);
    await deleteStoredImage(url, publicId);
  }
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

    const before = await Treat.findById(id).lean();
    if (!before) return NextResponse.json({ error: "Treat not found" }, { status: 404 });

    const update: Record<string, unknown> = {};
    if (typeof body?.name === "string" && body.name.trim()) update.name = body.name.trim().slice(0, 80);
    if (typeof body?.category === "string" && body.category.trim()) update.category = body.category.trim().slice(0, 40);
    if (typeof body?.tagline === "string") update.tagline = body.tagline.trim().slice(0, 80);
    if (typeof body?.description === "string") update.description = body.description.trim().slice(0, 1200);
    if ("price" in (body ?? {})) {
      const n = Number(body.price);
      update.price =
        body.price === null || body.price === "" || !Number.isFinite(n) ? null : Math.max(0, n);
    }
    if (typeof body?.image === "string")
      update.image = /^(https?:\/\/|\/)/.test(body.image) ? body.image.slice(0, 500) : "";
    if (typeof body?.cloudinaryPublicId === "string" && body.cloudinaryPublicId)
      update.cloudinaryPublicId = body.cloudinaryPublicId.slice(0, 200);
    if (typeof body?.featured === "boolean") update.featured = body.featured;
    if (typeof body?.weight === "string") update.weight = body.weight.trim().slice(0, 40);
    if (typeof body?.serves === "string") update.serves = body.serves.trim().slice(0, 40);
    if ("variants" in (body ?? {})) update.variants = normalizeVariants(body?.variants);
    if ("images" in (body ?? {})) update.images = normalizeImages(body?.images);

    const treat = await Treat.findByIdAndUpdate(id, update, { returnDocument: "after" }).lean();
    if (!treat) return NextResponse.json({ error: "Treat not found" }, { status: 404 });

    // Only when the save actually touched the photo fields — partial
    // updates (e.g. a name-only PUT) must not orphan anything.
    if ("images" in (body ?? {}) || "image" in (body ?? {})) {
      await cleanupRemovedPhotos(
        before,
        typeof update.image === "string" ? update.image : (before.image ?? ""),
        (update.images as Array<{ url: string; publicId: string | null }> | undefined) ??
          (before.images as Array<{ url: string; publicId: string | null }> | undefined) ??
          [],
      );
    }

    return NextResponse.json({ treat });
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

    const treat = await Treat.findByIdAndDelete(id).lean();
    if (!treat) return NextResponse.json({ error: "Treat not found" }, { status: 404 });

    // The cover plus every gallery photo lose their stored bytes.
    const storedImages: Array<{ url?: string; publicId?: string | null }> =
      Array.isArray(treat.images) ? treat.images : [];
    const urls = new Set<string>();
    if (treat.image) urls.add(treat.image);
    for (const img of storedImages) if (img?.url) urls.add(img.url);
    for (const url of urls) {
      const inList = storedImages.find((i) => i?.url === url);
      const publicId =
        url === treat.image
          ? (inList?.publicId ?? treat.cloudinaryPublicId ?? null)
          : (inList?.publicId ?? null);
      await deleteStoredImage(url, publicId);
    }

    return NextResponse.json({ ok: true });
  });
}
