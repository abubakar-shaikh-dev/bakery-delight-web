"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  Crop,
  ImagePlus,
  LoaderCircle,
  RefreshCcw,
  Trash2,
  X,
  ZoomIn,
} from "lucide-react";
import { showToast } from "./AdminShell";

/** Crop an HTML image to the selected area, outputting a JPEG blob. */
async function cropToBlob(src: string, crop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.9,
    );
  });
}

export default function ImageUploader({
  aspect = 1,
  label = "Upload photo",
  initialUrl = "",
  onUploaded,
  hint,
}: {
  /** width / height, e.g. 1 for square, 4/3 for cards */
  aspect?: number;
  label?: string;
  initialUrl?: string;
  onUploaded: (url: string, publicId?: string | null) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [src, setSrc] = useState<string | null>(null); // data URL being cropped
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);

  const pickFile = useCallback((file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("That file isn't an image.", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("Image is larger than 8 MB — pick a smaller one.", "error");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSrc(reader.result as string);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
    };
    reader.onerror = () => showToast("Couldn't read that file.", "error");
    reader.readAsDataURL(file);
  }, []);

  async function upload() {
    if (!src || !area) return;
    setWorking(true);
    try {
      const blob = await cropToBlob(src, area);
      const form = new FormData();
      form.append("file", blob, "crop.jpg");
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setUrl(data.url);
      onUploaded(data.url, data.publicId ?? null);
      setSrc(null);
      showToast(
        data.storage === "cloudinary" ? "Photo uploaded to Cloudinary." : "Photo saved.",
      );
    } catch (err) {
      showToast((err as Error).message || "Upload failed.", "error");
    } finally {
      setWorking(false);
    }
  }

  return (
    <div>
      <p className="mb-1.5 block text-[13px] font-medium text-stone-600">{label}</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          pickFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {url ? (
        <div className="flex items-center gap-4">
          <span className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-cream-300">
            <Image
              src={url}
              alt="Uploaded"
              fill
              sizes="96px"
              className="object-cover"
              unoptimized={url.startsWith("/api/images/")}
            />
          </span>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-stone-600 ring-1 ring-cream-400 transition-colors hover:text-berry hover:ring-berry/40"
            >
              <RefreshCcw className="h-3.5 w-3.5" strokeWidth={2} />
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                setUrl("");
                onUploaded("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[13px] font-medium text-stone-400 ring-1 ring-cream-400 transition-colors hover:text-berry-deep hover:ring-berry-deep/40"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full items-center gap-4 rounded-xl border-2 border-dashed border-cream-400 bg-white/60 px-5 py-6 text-left transition-colors hover:border-berry/50 hover:bg-white"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <ImagePlus className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-[13px] font-semibold text-stone-700">
              {label}
            </span>
            <span className="mt-0.5 block text-[12px] text-stone-500">
              {hint ?? "JPG, PNG or WebP · cropped before upload"}
            </span>
          </span>
        </button>
      )}

      {/* cropper dialog */}
      {src && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
              <p className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                <Crop className="h-4.5 w-4.5 text-berry" strokeWidth={1.8} />
                Crop your photo
              </p>
              <button
                onClick={() => setSrc(null)}
                aria-label="Close cropper"
                className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <div className="relative h-[340px] bg-cocoa sm:h-[400px]">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_a, px) => setArea(px)}
                showGrid={false}
              />
            </div>

            <div className="flex items-center gap-3 px-5 py-4">
              <ZoomIn className="h-4 w-4 shrink-0 text-stone-400" strokeWidth={1.8} />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="h-1 w-full accent-berry"
                aria-label="Zoom"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-cream-300 px-5 py-4">
              <button
                onClick={() => setSrc(null)}
                className="rounded-full px-5 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={upload}
                disabled={working || !area}
                className="inline-flex items-center gap-2 rounded-full bg-berry px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep disabled:opacity-60"
              >
                {working ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Crop className="h-4 w-4" strokeWidth={1.8} />
                )}
                {working ? "Uploading…" : "Crop & upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
