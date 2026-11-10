"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeftToLine, ImagePlus, X } from "lucide-react";
import { CropUploadDialog, readImageFile } from "./ImageUploader";

export interface TreatPhoto {
  url: string;
  publicId: string | null;
}

/**
 * The treat's photo list — first photo is the cover that cards, shares and
 * the treat page lead with. Uploads reuse the shared crop flow; removing
 * here only edits the list, the server cleans stored bytes on save.
 */
export default function TreatPhotos({
  photos,
  onChange,
  max = 8,
}: {
  photos: TreatPhoto[];
  onChange: (next: TreatPhoto[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  const addPhoto = (url: string, publicId?: string | null) => {
    onChange([...photos, { url, publicId: publicId ?? null }]);
  };

  const removeAt = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const makeCover = (index: number) => {
    const next = [...photos];
    const [photo] = next.splice(index, 1);
    onChange([photo, ...next]);
  };

  const full = photos.length >= max;

  return (
    <div>
      <label className="field-label" htmlFor="treat-photos-trigger">
        Photos
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          readImageFile(e.target.files?.[0], (dataUrl) => setSrc(dataUrl));
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2.5">
        {photos.map((photo, i) => (
          <div
            key={`${photo.url}-${i}`}
            className="group relative h-24 w-24 overflow-hidden rounded-xl ring-1 ring-cream-300"
          >
            <Image
              src={photo.url}
              alt={`Treat photo ${i + 1}`}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized={photo.url.startsWith("/api/images/")}
            />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-berry-deep">
                Cover
              </span>
            )}
            {/* Hover-revealed controls stay visible on touch. */}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-cocoa-3/55 opacity-100 transition-[opacity,transform] sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(i)}
                  aria-label={`Set photo ${i + 1} as cover`}
                  title="Set as cover"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-stone-600 transition-colors hover:text-berry-deep"
                >
                  <ArrowLeftToLine className="h-4 w-4" strokeWidth={1.8} />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label={`Remove photo ${i + 1}`}
                title="Remove"
                className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-stone-600 transition-colors hover:bg-danger-soft hover:text-danger"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}

        {!full && (
          <button
            type="button"
            id="treat-photos-trigger"
            onClick={() => inputRef.current?.click()}
            aria-label="Add photo"
            className={
              photos.length === 0
                ? "flex w-full items-center rounded-xl border-2 border-dashed border-cream-400 bg-white/60 text-stone-400 transition-colors hover:border-berry/50 hover:bg-white"
                : "grid h-24 w-24 place-items-center rounded-xl border-2 border-dashed border-cream-400 bg-white/60 text-stone-400 transition-colors hover:border-berry/50 hover:text-berry-deep"
            }
          >
            {photos.length === 0 ? (
              <span className="flex items-center gap-4 px-5 py-6 text-left">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-berry-soft text-berry-deep">
                  <ImagePlus className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold text-stone-700">
                    Add a photo
                  </span>
                  <span className="mt-0.5 block text-[12px] text-stone-500">
                    JPG, PNG or WebP · cropped before upload
                  </span>
                </span>
              </span>
            ) : (
              <ImagePlus className="h-5 w-5" strokeWidth={1.8} />
            )}
          </button>
        )}
      </div>

      <p className="field-hint">
        {full
          ? `Up to ${max} photos.`
          : photos.length === 0
            ? "The first photo is the cover — shown on cards and shares."
            : `First photo is the cover · up to ${max} photos`}
      </p>

      {src && (
        <CropUploadDialog
          src={src}
          aspect={4 / 3}
          onCancel={() => setSrc(null)}
          onUploaded={(url, publicId) => addPhoto(url, publicId)}
        />
      )}
    </div>
  );
}
