import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { safeJson } from "@/lib/api";
import { storeImage } from "@/lib/storage";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Magic-byte signatures so a spoofed content-type can't smuggle non-images. */
function sniffImage(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return "image/png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  if (buffer.toString("ascii", 4, 8) === "ftyp" && buffer.toString("ascii", 8, 12) === "avif")
    return "image/avif";
  return null;
}

async function POST_(req: NextRequest) {
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
  const sniffed = sniffImage(buffer);
  if (!sniffed || !ALLOWED.includes(sniffed))
    return NextResponse.json({ error: "That file doesn't look like a supported image." }, { status: 400 });

  try {
    const result = await storeImage(buffer, file.name || "upload", sniffed);
    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      storage: result.storage,
    });
  } catch (err) {
    console.error("[upload]", (err as Error).message);
    return NextResponse.json({ error: "Upload failed." }, { status: 502 });
  }
}

export function POST(req: NextRequest) {
  return safeJson(() => POST_(req));
}
