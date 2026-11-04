import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconQuote } from "./icons";
import StarRating from "./site/StarRating";
import type { ReviewData } from "@/lib/site-data";

export default function Testimonials({ reviews }: { reviews: ReviewData[] }) {
  return (
    <section id="reviews" className="px-5 pt-8 pb-20 md:px-10 lg:px-[8.5rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-4xl font-bold leading-none text-ink md:text-[40px]">
          What Our Customers Say
          <span className="ml-5 -mt-2 inline-block h-px w-20 bg-cream-400 align-middle md:w-24"></span>
        </h2>
        <Link
          href="/reviews"
          className="group flex items-center gap-2 text-[15px] font-medium text-berry-deep"
        >
          View All Reviews
          <IconArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

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
                  className="h-11 w-11 rounded-full object-cover ring-2 ring-berry-soft"
                />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-full bg-berry-soft font-display text-lg font-bold text-berry-deep">
                  {r.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-[14px] font-semibold text-ink">{r.name}</p>
                <div className="mt-1">
                  <StarRating rating={r.rating} className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
