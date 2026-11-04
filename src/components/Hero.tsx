import Link from "next/link";
import SiteNav from "./SiteNav";
import StarRating from "./site/StarRating";
import { IconArrowRight, IconHeart } from "./icons";

/* Handwritten note — mobile variant (mockup: 4 staggered lines + heart + swash) */
function MobileNote() {
  return (
    <div className="absolute right-4 top-[31%] z-20 -rotate-[7deg] text-right font-hand text-[22px] font-semibold leading-[1.18] text-berry-ink select-none sm:hidden">
      <p className="pr-2">More</p>
      <p className="pr-1">than</p>
      <p className="pr-2">Cakes</p>
      <p className="pr-0">It&rsquo;s Love</p>
      <IconHeart className="mt-1.5 ml-auto mr-7 h-[18px] w-[18px]" strokeWidth={1.8} />
      <svg className="ml-auto mr-1 mt-1 h-3 w-[86px]" viewBox="0 0 86 12" fill="none">
        <path d="M2 9 C 22 12.5, 52 10, 84 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[calc(100vw*1680/941)] w-full overflow-hidden bg-cream-100 sm:min-h-[calc(100vw*941/1672)]"
    >
      {/* Backgrounds: portrait photo on phones, wave-baked photo on larger screens.
          Preloaded per breakpoint (React hoists these links) since CSS backgrounds
          are discovered late — this makes the LCP image start fetching immediately. */}
      <link
        rel="preload"
        as="image"
        href="/hero-bg-mobile.jpg"
        media="(max-width: 639px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href="/hero-bg.webp"
        media="(min-width: 640px)"
        fetchPriority="high"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center sm:hidden"
        style={{ backgroundImage: "url('/hero-bg-mobile.jpg')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-cover bg-bottom sm:block"
        style={{ backgroundImage: "url('/hero-bg.webp')" }}
      />

      {/* Soft scrim behind hero copy on narrow desktop layouts */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 z-10 hidden w-[78%] bg-linear-to-r from-cream-100/55 via-cream-100/25 to-transparent sm:block lg:hidden"
      ></div>

      <SiteNav variant="overlay" />

      {/* Hero content */}
      <div className="relative z-20 px-5 pt-12 pb-28 sm:px-10 md:pt-16 lg:px-[8.5rem] lg:pt-10 lg:pb-0">
        <div className="max-w-xl">
          <h1 className="font-display text-4xl font-bold leading-[1.08] text-ink sm:text-6xl lg:text-[64px]">
            Happiness
            <br />
            Tastes Better
            <br />
            at <span className="text-berry">Home</span>{" "}
            <IconHeart className="mt-[-0.5rem] inline-block h-9 w-9 align-middle lg:h-11 lg:w-11" />
          </h1>

          <p className="mt-6 max-w-[290px] text-[15px] leading-relaxed text-stone-600 sm:max-w-md md:text-base [text-shadow:0_1px_10px_rgba(253,242,236,0.9)] sm:[text-shadow:none]">
            Delicious homemade cakes, freshly baked in a home kitchen, with love — just for you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full bg-berry px-7 py-3.5 font-medium text-white transition-colors hover:bg-berry-deep"
            >
              Order a Cake
              <IconArrowRight />
            </Link>
            <Link
              href="/treats"
              className="flex items-center gap-2 rounded-full border-2 border-berry px-7 py-3.5 font-medium text-berry transition-colors hover:bg-berry/5"
            >
              Explore Treats
            </Link>
          </div>

          <Link
            href="/reviews"
            className="mt-10 inline-flex items-center gap-3"
          >
            <StarRating rating={5} className="h-4 w-4" />
            <span className="text-sm text-stone-600 [text-shadow:0_1px_10px_rgba(253,242,236,0.9)] sm:[text-shadow:none]">
              Read customer reviews
            </span>
          </Link>
        </div>
      </div>

      {/* Handwritten note — phones */}
      <MobileNote />

      {/* Handwritten note — larger screens */}
      <div className="absolute right-8 top-[30%] z-20 hidden -rotate-6 text-right font-hand text-xl font-semibold leading-[1.15] text-berry-ink select-none [text-shadow:0_1px_10px_rgba(253,242,236,0.85)] sm:block sm:right-10 md:right-14 md:top-[16%] md:text-[28px] xl:right-24">
        <p className="pr-7">More than</p>
        <p className="pr-1">Cakes</p>
        <p className="pr-8">It&rsquo;s Love</p>
      </div>

      {/* Phones: the portrait photo fades into the page background at the bottom */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-10 h-48 bg-linear-to-b from-transparent to-cream-100 to-50% sm:hidden"
      />

      {/* Mobile-only baked note text (rests in the faded cream zone, mirrors the photo's) */}
      <div className="absolute bottom-6 left-6 z-20 select-none text-cocoa sm:hidden">
        <div className="border-l-[1.5px] border-cocoa/50 pl-4">
          <p className="font-hand text-lg font-semibold leading-[1.15]">
            Good food,
            <br />
            happier people
          </p>
          <IconHeart className="mt-2 ml-0.5 h-4 w-4" strokeWidth={1.6} />
        </div>
      </div>
    </section>
  );
}
