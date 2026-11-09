import ReviewCard from "./ReviewCard";
import StarRating from "./StarRating";
import type { ReviewData } from "@/lib/site-data";

/**
 * The reviews section on a treat's page. `own` marks reviews written about
 * this treat — only they earn the star summary; bakery-wide fallback
 * reviews render without one so the numbers stay honest.
 */
export default function TreatReviews({
  reviews,
  total,
  avg,
  own,
}: {
  reviews: ReviewData[];
  total: number;
  avg: number;
  own: boolean;
}) {
  if (reviews.length === 0) return null;

  return (
    <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
      <h2 className="font-display text-3xl font-bold leading-none text-ink md:text-4xl">
        What people say
        <span className="ml-5 -mt-2 inline-block h-px w-20 bg-cream-400 align-middle md:w-24"></span>
      </h2>

      {own && total > 0 && (
        <div className="mt-4 flex items-center gap-2.5">
          <StarRating rating={Math.round(avg)} className="h-4 w-4" />
          <p className="text-[13px] text-stone-500">
            {avg} out of 5 · {total} {total === 1 ? "review" : "reviews"} for
            this treat
          </p>
        </div>
      )}

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((r) => (
          <ReviewCard key={r._id} review={r} />
        ))}
      </div>
    </section>
  );
}
