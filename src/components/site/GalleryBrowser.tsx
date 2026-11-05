"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images, SearchX, X } from "lucide-react";
import { GalleryCardSkeleton } from "./Skeletons";
import type { GalleryData } from "@/lib/site-data";

const PAGE = 12;

/**
 * Bento gallery: each photo's stored crop shape (square / wide / tall) drives
 * its cell — 1×1, 2×1 or 1×2 — and dense flow keeps the wall hole-free in any
 * mix. Photos open in a quiet lightbox (Esc, arrow keys and buttons; no
 * zoom-pan theatrics). Older pages stream in on scroll.
 */
export default function GalleryBrowser({
  initial,
}: {
  initial: { images: GalleryData[]; total: number };
}) {
  const [images, setImages] = useState<GalleryData[]>(initial.images);
  const [total, setTotal] = useState(initial.total);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(initial.images.length >= initial.total);
  const [loadError, setLoadError] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/gallery?offset=${images.length}&limit=${PAGE}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setLoadError(false);
      const existing = new Set(images.map((g) => g._id));
      setImages((list) => [...list, ...data.images.filter((g: GalleryData) => !existing.has(g._id))]);
      setTotal(data.total);
      setReachedEnd(images.length + data.images.length >= data.total);
    } catch {
      setLoadError(true); // retried on the next intersection
    } finally {
      setLoadingMore(false);
    }
  }, [images]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !reachedEnd) {
          loadMore();
        }
      },
      { rootMargin: "500px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadingMore, reachedEnd, loadMore]);

  /* lightbox: keyboard + scroll lock (same pattern as the site menu) */
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (viewing === null) return;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = document.body.style.overflow;
    const prevPadding = document.body.style.paddingRight;
    document.body.style.overflow = "hidden";
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewing(null);
      if (e.key === "ArrowRight") setViewing((v) => (v === null ? v : (v + 1) % images.length));
      if (e.key === "ArrowLeft")
        setViewing((v) => (v === null ? v : (v - 1 + images.length) % images.length));
      if (e.key === "Tab" && contentRef.current) {
        // getClientRects, not offsetParent — offsetParent is null for
        // position:fixed buttons (the corner close, mobile arrows).
        const items = Array.from(
          contentRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"),
        ).filter((el) => el.getClientRects().length > 0);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPadding;
      document.removeEventListener("keydown", onKey);
    };
  }, [viewing, images.length]);

  /* Bento vocabulary: the row height IS the column width, so "16:9" → 2×1,
     "9:16" → 1×2 and squares stay square in any mix. Rows are explicit
     (viewport minus page gutters and gaps) so cells never fight for height:
     mobile 2 cols (px-5, gap-3), sm 2 cols (px-10, gap-4),
     md/lg 4 cols (px-10 / px-[8.5rem], gap-4). */
  const spanFor = (ratio: string) =>
    ratio === "16:9" ? "col-span-2" : ratio === "9:16" ? "row-span-2" : "";
  const sizesFor = (ratio: string) =>
    ratio === "16:9"
      ? "(min-width:768px) 55vw, 100vw"
      : "(min-width:768px) 28vw, 46vw";

  if (images.length === 0 && loadError) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
          <SearchX className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold text-ink">
          The gallery didn&rsquo;t load
        </h3>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-stone-600">
          Something interrupted the connection. Try again in a moment.
        </p>
        <button
          onClick={() => {
            setLoadError(false);
            loadMore();
          }}
          className="mt-5 rounded-full bg-berry px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
        >
          Try again
        </button>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
          <Images className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h3 className="mt-4 font-display text-2xl font-bold text-ink">
          The album is empty
        </h3>
        <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-stone-600">
          Photos from the kitchen land here — check back soon.
        </p>
      </div>
    );
  }

  const current = viewing !== null ? images[viewing] : null;

  return (
    <div>
      <p className="text-[13px] text-stone-500 tabular-nums" aria-live="polite">
        {total} photo{total === 1 ? "" : "s"}
      </p>

      {/* bento wall */}
      <div className="mt-6 grid auto-rows-[calc((100vw-52px)/2)] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[calc((100vw-96px)/2)] sm:gap-4 md:auto-rows-[calc((100vw-128px)/4)] md:grid-cols-4 lg:auto-rows-[calc((100vw-320px)/4)]">
        {images.map((g, i) => (
          <button
            key={g._id}
            type="button"
            onClick={() => setViewing(i)}
            aria-label={g.caption ? `View photo: ${g.caption}` : "View photo"}
            className={`group relative cursor-zoom-in overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-cream-300 transition-shadow duration-200 hover:shadow-md ${spanFor(g.ratio)}`}
          >
            {g.url && (
              <Image
                src={g.url}
                alt={g.caption || "From our gallery"}
                fill
                sizes={sizesFor(g.ratio)}
                className="object-cover"
                priority={i < 4}
              />
            )}
            {g.caption && (
              <span className="absolute inset-x-0 bottom-0 translate-y-full bg-linear-to-t from-black/60 to-transparent px-4 pb-3.5 pt-10 text-left text-[12px] font-medium text-white transition-transform duration-200 group-hover:translate-y-0 group-focus-within:translate-y-0 max-sm:translate-y-0">
                {g.caption}
              </span>
            )}
          </button>
        ))}
        {loadingMore && (
          <>
            <GalleryCardSkeleton shape="wide" />
            <GalleryCardSkeleton shape="tall" />
            {[1, 2].map((i) => (
              <GalleryCardSkeleton key={`m${i}`} />
            ))}
          </>
        )}
      </div>

      <div ref={sentinel} className="h-px" />

      {loadError && images.length > 0 && (
        <p role="alert" className="mt-8 text-center text-[13px] font-medium text-stone-500">
          Some photos couldn&rsquo;t load — scroll down to retry.
        </p>
      )}

      {reachedEnd && images.length > PAGE && (
        <p className="mt-12 text-center font-hand text-2xl text-berry-deep">
          That&rsquo;s the whole album — for now &hearts;
        </p>
      )}

      {/* lightbox */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setViewing(null)}
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-cocoa-3/90 p-4 pt-16 backdrop-blur-sm sm:p-10 sm:pt-14"
        >
          <div
            ref={contentRef}
            className="relative flex max-h-full w-full max-w-4xl flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <figure
              key={current._id}
              className="flex min-h-0 flex-col items-center animate-[menu-in_180ms_ease-out]"
            >
              <div className="relative min-h-0 w-full shrink overflow-hidden rounded-2xl">
                <Image
                  src={current.url}
                  alt={current.caption || "From our gallery"}
                  width={1600}
                  height={1600}
                  sizes="(min-width:896px) 896px, 92vw"
                  className="mx-auto max-h-[72vh] w-auto max-w-full object-contain"
                  priority
                />
              </div>
              {current.caption && (
                <figcaption className="mt-4 text-center text-[14px] font-medium text-cocoa-muted">
                  {current.caption}
                </figcaption>
              )}
              <p className="mt-1 text-[12px] text-white/50 tabular-nums">
                {(viewing ?? 0) + 1} / {images.length}
              </p>
            </figure>

            {/* chrome */}
            <button
              ref={closeRef}
              type="button"
              onClick={() => setViewing(null)}
              aria-label="Close photo viewer"
              className="fixed right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setViewing((v) => (v === null ? v : (v - 1 + images.length) % images.length))
                  }
                  aria-label="Previous photo"
                  className="fixed left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:absolute sm:left-0 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setViewing((v) => (v === null ? v : (v + 1) % images.length))
                  }
                  aria-label="Next photo"
                  className="fixed right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:absolute sm:right-0 sm:top-1/2 sm:translate-x-1/2 sm:-translate-y-1/2"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
