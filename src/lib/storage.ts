import UploadedImage from "@/models/UploadedImage";
import { connectDB } from "./db";
import { cloudinaryConfigured, uploadBuffer as cloudinaryUpload } from "./cloudinary";

export interface StoredImage {
  url: string;
  publicId: string | null;
  storage: "cloudinary" | "db";
}

/**
 * Stores an uploaded image.
 * Prefers Cloudinary; if Cloudinary is unconfigured or refuses the upload
 * (e.g. key missing upload permission), falls back to MongoDB storage and
 * serves the file from /api/images/<id>. The admin never sees a dead feature.
 */
export async function storeImage(
  buffer: Buffer,
  filename = "upload",
  mime = "image/jpeg",
): Promise<StoredImage> {
  if (cloudinaryConfigured()) {
    try {
      const r = await cloudinaryUpload(buffer, filename);
      return { url: r.url, publicId: r.publicId, storage: "cloudinary" };
    } catch (err) {
      console.warn(
        "[storage] Cloudinary upload failed, storing in MongoDB instead:",
        (err as Error).message,
      );
    }
  }

  const conn = await connectDB();
  if (!conn) throw new Error("No storage backend available");
  const doc = await UploadedImage.create({ data: buffer, mime });
  return { url: `/api/images/${String(doc._id)}`, publicId: null, storage: "db" };
}

/** Removes a stored image: Cloudinary by public id, MongoDB by url. */
export async function deleteStoredImage(url: string, publicId: string | null) {
  if (publicId) {
    const { destroyImage } = await import("./cloudinary");
    await destroyImage(publicId);
    return;
  }
  const match = url.match(/^\/api\/images\/([a-f0-9]{24})$/i);
  if (match) {
    try {
      await connectDB();
      await UploadedImage.findByIdAndDelete(match[1]);
    } catch {
      /* best-effort */
    }
  }
}
