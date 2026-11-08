import sharp from "sharp";

/** A real JPEG, generated on the fly — no binary assets in the repo. */
export async function fixtureJpeg(
  width = 800,
  height = 600,
): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 214, g: 122, b: 127 },
    },
  })
    .jpeg({ quality: 90 })
    .toBuffer();
}

export interface UploadFile {
  name: string;
  mimeType: string;
  buffer: Buffer;
}

/** Any 9 MB blob — the uploader checks file.size before decoding pixels. */
export function oversizeFile(): UploadFile {
  return {
    name: "huge.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(9 * 1024 * 1024, 0x7f),
  };
}

export const textFile: UploadFile = {
  name: "note.txt",
  mimeType: "text/plain",
  buffer: Buffer.from("definitely not an image"),
};

export async function jpegFile(name = "crop.jpg"): Promise<UploadFile> {
  return {
    name,
    mimeType: "image/jpeg",
    buffer: await fixtureJpeg(),
  };
}
