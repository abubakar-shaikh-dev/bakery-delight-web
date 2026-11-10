import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { IconArrowRight, IconQuote } from "./icons";
import StarRating from "./site/StarRating";
import type { ReviewData } from "@/lib/site-data";

export default function Testimonials({ reviews }: { reviews: ReviewData[] }) {
  return (
    <section id="reviews" className="px-5 pt-8 pb-20 sm:px-10 lg:px-[8.5rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-[28px] font-bold leading-none text-ink md:text-[40px]">
          What Our Customers Say
          <span className="ml-5 -mt-2 inline-block h-px w-20 bg-cream-400 align-middle md:w-24"></span>
        </h2>
        <Link
          href="/reviews"
          className="group flex items-center gap-2 text-[15px] font-medium text-berry-deep"
        >
          View All Reviews
          <IconArrowRight className="transition-[opacity,transform] duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-cream-300">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <Star className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">
            No reviews yet
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-stone-500">
            Be the first to tell everyone how it tasted
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl bg-white p-7 shadow-xs ring-1 ring-cream-300 transition-shadow duration-200 hover:shadow-md"
            >
              <IconQuote className="mb-4 h-8 w-8 rotate-180 text-berry/40" />
              <p className="text-[14px] leading-relaxed text-stone-600">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3.5">
                {r.avatar ? (
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    width={128}
                    height={128}
                    sizes="44px"
                    className="h-11 w-11 rounded-full object-cover ring-2 ring-berry-soft"
                  />
                ) : (
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-berry-soft text-[15px] font-semibold text-berry-deep">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div>
                  <p className="text-[14px] font-semibold text-ink">{r.name}</p>
                  <div className="mt-1">
                    <StarRating rating={r.rating} className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
