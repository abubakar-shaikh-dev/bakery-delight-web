"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import ReviewCard from "./ReviewCard";
import { ReviewCardSkeleton } from "./Skeletons";
import StarRating from "./StarRating";
import type { ReviewData } from "@/lib/site-data";

const PAGE = 9;

export default function ReviewsBrowser({
  initial,
}: {
  initial: { reviews: ReviewData[]; total: number; avg: number };
}) {
  const [reviews, setReviews] = useState<ReviewData[]>(initial.reviews);
  const [total, setTotal] = useState(initial.total);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(initial.reviews.length >= initial.total);
  const sentinel = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/reviews?offset=${reviews.length}&limit=${PAGE}`);
      const data = await res.json();
      const existing = new Set(reviews.map((r) => r._id));
      setReviews((list) => [...list, ...data.reviews.filter((r: ReviewData) => !existing.has(r._id))]);
      setTotal(data.total);
      setReachedEnd(reviews.length + data.reviews.length >= data.total);
    } catch {
      /* retry on next intersection */
    } finally {
      setLoadingMore(false);
    }
  }, [reviews]);

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

  return (
    <div>
      {/* summary */}
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl bg-white px-8 py-7 text-center shadow-xs ring-1 ring-cream-300 sm:flex-row sm:justify-center sm:gap-8">
        <div className="flex items-center gap-4">
          <p className="font-display text-5xl font-bold leading-none text-ink tabular-nums">
            {initial.avg || "—"}
          </p>
          <div className="text-left">
            <StarRating rating={Math.round(initial.avg)} />
            <p className="mt-1 text-[12px] text-stone-500 tabular-nums">
              {total} review{total === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="mt-4 hidden h-10 w-px bg-cream-300 sm:mt-0 sm:block" />
        <p className="mt-4 max-w-[220px] text-[13px] leading-relaxed text-stone-600 sm:mt-0">
          Every review here comes from a real order
        </p>
      </div>

      {/* grid */}
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((r) => (
          <ReviewCard key={r._id} review={r} />
        ))}
        {loadingMore &&
          Array.from({ length: 3 }).map((_, i) => <ReviewCardSkeleton key={`s${i}`} />)}
      </div>

      <div ref={sentinel} className="h-px" />

      {reachedEnd && reviews.length > PAGE && (
        <p className="mt-12 flex items-center justify-center gap-2 text-center font-hand text-2xl text-berry-deep">
          Every kind word, proudly displayed <Star className="h-4 w-4 fill-gold text-gold" />
        </p>
      )}
    </div>
  );
}
