import Image from "next/image";
import Link from "next/link";
import { IconHeart } from "./icons";

export default function About() {
  return (
    <>
      <div className="bg-cream-100">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block h-[60px] w-full text-blush-100 md:h-[80px]">
          <path fill="currentColor" d="M0,58 C200,14 420,86 700,52 C960,22 1180,74 1440,34 L1440,90 L0,90 Z" />
        </svg>
      </div>

      <section id="about" className="relative overflow-hidden bg-blush-100">
        <svg
          className="absolute -left-6 top-24 hidden h-auto w-16 -scale-x-100 text-berry/50 opacity-70 lg:block"
          aria-hidden="true"
        >
          <use href="#branch" />
        </svg>

        <div className="grid items-center gap-16 px-5 py-16 md:px-10 lg:grid-cols-2 lg:gap-20 lg:px-[8.5rem] lg:py-24">
          {/* Photo collage — the taped polaroids, the section's moment */}
          <div className="relative mx-auto w-full max-w-[460px] lg:mx-0">
            <div className="-rotate-3 bg-white p-3 pb-12 shadow-[0_24px_50px_-12px_rgba(90,30,30,0.28)]">
              <div className="relative aspect-[680/760] w-full">
                <Image
                  src="/images/about-main.jpg"
                  alt="Baking in our home kitchen"
                  fill
                  sizes="(min-width:1024px) 460px, 92vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-8 -right-3 w-36 rotate-6 bg-white p-2 pb-7 shadow-[0_16px_35px_-10px_rgba(90,30,30,0.3)] md:-right-8 md:w-44">
              <div className="relative aspect-square w-full">
                <Image
                  src="/images/about-small.jpg"
                  alt="Fresh cupcake"
                  fill
                  sizes="(min-width:1024px) 176px, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute -bottom-6 -left-2 -rotate-6 bg-paper px-5 py-3 font-hand text-xl font-semibold leading-tight text-berry-ink shadow-md md:-left-6 md:text-2xl">
              Happiness
              <br />
              is Homemade{" "}
              <IconHeart className="mt-[-0.25rem] inline-block h-4 w-4 text-berry-ink" />
            </div>
          </div>

          {/* Copy */}
          <div>
            <h2 className="font-display text-4xl font-bold leading-[1.12] text-ink md:text-[44px]">
              A Home Kitchen,
              <br />
              With <span className="text-berry">Big Dreams</span>{" "}
              <IconHeart className="mt-[-0.25rem] inline-block h-8 w-8 align-middle" />
            </h2>

            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-stone-600">
              Bakery Delight started from a simple idea — to spread happiness through homemade
              cakes. Every cake is made in my home kitchen using fresh, high-quality ingredients,
              and a personal touch.
            </p>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-stone-600">
              What began as a passion is now a growing community of cake lovers.
            </p>

            <Link
              href="/about"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-berry px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep"
            >
              Our Story
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Handwritten note (right margin) */}
        <div className="absolute right-7 top-[42%] hidden rotate-6 text-right font-hand text-[24px] font-semibold leading-[1.2] text-berry-ink select-none xl:block">
          <p className="pr-5">Same</p>
          <p className="pr-1">Ingredients</p>
          <p className="pr-4">Bigger</p>
          <p className="pr-0">Happiness</p>
          <IconHeart className="mt-1 ml-auto mr-2 h-4 w-4 text-berry-ink" />
        </div>
      </section>
    </>
  );
}
