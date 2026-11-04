import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { storeImage } from "@/lib/storage";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File))
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  if (!ALLOWED.includes(file.type))
    return NextResponse.json({ error: "Only JPG, PNG, WebP or AVIF images are allowed." }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "Image is larger than 8 MB." }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const result = await storeImage(buffer, file.name || "upload", file.type);
    return NextResponse.json({ url: result.url, storage: result.storage });
  } catch (err) {
    console.error("[upload]", (err as Error).message);
    return NextResponse.json({ error: "Upload failed." }, { status: 502 });
  }
}
