import Image from "next/image";
import { IconArrowRight, IconHeart, IconInstagram } from "./icons";
import type { GalleryData } from "@/lib/site-data";

export default function Gallery({
  images,
  instagramUrl,
}: {
  images: GalleryData[];
  instagramUrl: string;
}) {
  return (
    <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-[28px] font-bold leading-none text-ink md:text-[40px]">
          A Glimpse of Our Sweet World
          <span className="ml-5 -mt-2 inline-block h-px w-20 bg-cream-400 align-middle md:w-24"></span>
        </h2>
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 text-[15px] font-medium text-berry-deep"
          >
            <IconInstagram className="h-[18px] w-[18px]" />
            Follow us on Instagram
            <IconArrowRight className="transition-[opacity,transform] duration-200 group-hover:translate-x-1" />
          </a>
        )}
      </div>

      {images.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-cream-300">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <IconInstagram className="h-6 w-6" />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">
            Photos are still in the kitchen
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-stone-500">
            Snapshots of new bakes land here soon
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {images.map((g, i) => {
            const showOverlay = g.caption.toLowerCase().includes("good food");
            return (
              <div
                key={g._id}
                className="group relative block aspect-square overflow-hidden rounded-xl"
              >
                {g.url ? (
                  <Image
                    src={g.url}
                    alt={g.caption || "From our gallery"}
                    fill
                    sizes="(min-width:1280px) 205px, (min-width:768px) 30vw, 46vw"
                    className="object-cover"
                  />
                ) : null}
                {showOverlay && (
                  <span className="absolute inset-0 grid -rotate-3 place-items-center text-center font-hand text-2xl font-semibold leading-[1.1] text-berry-ink [text-shadow:0_1px_2px_rgba(255,255,255,0.65)]">
                    Good Food
                    <br />
                    Happier
                    <br />
                    People{" "}
                    <IconHeart className="inline-block h-4 w-4 align-[-2px]" strokeWidth={2} />
                  </span>
                )}
                {!showOverlay && g.caption && (
                  <span className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-cocoa-3/70 to-transparent px-3 pb-3 pt-8 text-[12px] font-medium text-white transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0 max-sm:translate-y-0">
                    {g.caption}
                  </span>
                )}
                {i === 0 && <span className="sr-only">{images.length} photos</span>}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
