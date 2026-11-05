"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  ImagePlus,
  LoaderCircle,
  RefreshCcw,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { showToast } from "./AdminShell";

/** A crop shape the uploader can offer, e.g. { value: "16:9", label: "Wide" }. */
export interface RatioOption {
  value: string;
  label: string;
}

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

const parseRatio = (value: string) => {
  const [w, h] = value.split(":").map(Number);
  return w > 0 && h > 0 ? w / h : 1;
};

/** Tiny outline of the shape a ratio produces — the picker reads at a glance. */
function RatioGlyph({ value }: { value: string }) {
  const [w, h] = value.split(":").map(Number);
  const wide = w > h;
  const tall = h > w;
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <rect
        x={wide ? 1 : tall ? 3.5 : 2}
        y={wide ? 3.5 : tall ? 1 : 2}
        width={wide ? 12 : tall ? 7 : 10}
        height={wide ? 7 : tall ? 12 : 10}
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function ImageUploader({
  aspect = 1,
  label = "Upload photo",
  initialUrl = "",
  onUploaded,
  hint,
  ratios,
}: {
  /** width / height, e.g. 1 for square, 4/3 for cards — ignored when `ratios` is set */
  aspect?: number;
  label?: string;
  initialUrl?: string;
  onUploaded: (url: string, publicId?: string | null, ratio?: string) => void;
  hint?: string;
  /** When set, the crop dialog offers these shapes instead of a fixed one. */
  ratios?: RatioOption[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [url, setUrl] = useState(initialUrl);
  const [src, setSrc] = useState<string | null>(null); // data URL being cropped
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);
  const [ratio, setRatio] = useState(ratios?.[0]?.value ?? "1:1");

  const activeAspect = ratios ? parseRatio(ratio) : aspect;

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

  /* Escape closes the cropper (never mid-upload); focus lands on close. */
  useEffect(() => {
    if (!src) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !working) setSrc(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [src, working]);

  const changeRatio = (value: string) => {
    setRatio(value);
    setCrop({ x: 0, y: 0 });
  };

  const stepZoom = (dir: 1 | -1) =>
    setZoom((z) => Math.min(3, Math.max(1, Math.round((z + dir * 0.25) * 100) / 100)));

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
      onUploaded(data.url, data.publicId ?? null, ratios ? ratio : undefined);
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
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Crop photo"
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl outline-none animate-[menu-in_180ms_ease-out]">
            <div className="flex items-center justify-between border-b border-cream-300 px-5 py-4">
              <p className="font-display text-lg font-bold text-ink">Crop your photo</p>
              <button
                ref={closeRef}
                onClick={() => setSrc(null)}
                aria-label="Close cropper"
                className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {ratios && (
              <div
                role="radiogroup"
                aria-label="Crop shape"
                className="flex flex-wrap gap-1.5 px-5 pt-4"
              >
                {ratios.map((r) => {
                  const active = r.value === ratio;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      disabled={working}
                      onClick={() => changeRatio(r.value)}
                      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition-colors disabled:opacity-60 ${
                        active
                          ? "border-berry/40 bg-berry-soft text-berry-deep"
                          : "border-cream-300 bg-white text-stone-500 hover:border-cream-400 hover:text-stone-700"
                      }`}
                    >
                      <RatioGlyph value={r.value} />
                      {r.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              className={`relative bg-cocoa ${ratios ? "mt-4 h-[300px] sm:h-[380px]" : "h-[340px] sm:h-[400px]"}`}
            >
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={activeAspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_a, px) => setArea(px)}
                showGrid
              />
            </div>

            <div className="flex items-center gap-3 px-5 py-4">
              <button
                type="button"
                onClick={() => stepZoom(-1)}
                aria-label="Zoom out"
                disabled={zoom <= 1 || working}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:text-berry disabled:opacity-40"
              >
                <ZoomOut className="h-4 w-4" strokeWidth={1.8} />
              </button>
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
              <button
                type="button"
                onClick={() => stepZoom(1)}
                aria-label="Zoom in"
                disabled={zoom >= 3 || working}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:text-berry disabled:opacity-40"
              >
                <ZoomIn className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex justify-end gap-3 border-t border-cream-300 px-5 py-4">
              <button
                onClick={() => setSrc(null)}
                disabled={working}
                className="rounded-full px-5 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={upload}
                disabled={working || !area}
                className="inline-flex items-center gap-2 rounded-full bg-berry px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep disabled:opacity-60"
              >
                {working && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {working ? "Uploading…" : "Crop & upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
