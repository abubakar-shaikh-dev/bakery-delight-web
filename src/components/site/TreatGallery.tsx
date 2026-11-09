"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * The treat photo with its thumbnail strip. One photo (or none) renders
 * exactly like the old single-image hero; the strip only appears once the
 * owner has added extra photos.
 */
export default function TreatGallery({
  photos,
  name,
}: {
  photos: string[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const current = photos[Math.min(selected, photos.length - 1)] ?? "";

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-berry-soft ring-1 ring-cream-300 sm:aspect-[4/5]">
        {current ? (
          <Image
            key={current}
            src={current}
            alt={name}
            fill
            priority={selected === 0}
            sizes="(min-width:1024px) 40vw, 92vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="font-display text-8xl text-berry-deep/70">
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {photos.length > 1 && (
        <div
          role="group"
          aria-label={`${name} photos`}
          className="mt-3 flex flex-wrap gap-2.5"
        >
          {photos.map((url, i) => (
            <button
              key={`${url}-${i}`}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={i === selected}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              className={`relative h-16 w-16 overflow-hidden rounded-xl bg-berry-soft ring-1 transition-[border-color,box-shadow] ${
                i === selected
                  ? "ring-berry"
                  : "ring-cream-300 hover:ring-cream-400"
              }`}
            >
              <Image src={url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
