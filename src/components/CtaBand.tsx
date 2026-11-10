import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconHeart, IconMail } from "./icons";

export default function CtaBand() {
  return (
    <section id="order" className="relative overflow-hidden bg-cocoa">
      <div className="absolute right-0 top-0 h-full w-[50%]" aria-hidden="true">
        <Image
          src="/images/cta-cake.jpg"
          alt=""
          fill
          sizes="50vw"
          className="object-cover object-center opacity-90"
        />
      </div>
      <div className="absolute inset-0 bg-linear-to-r from-cocoa via-cocoa/55 to-transparent"></div>
      <div className="absolute inset-0 bg-linear-to-t from-cocoa-3/60 via-transparent to-cocoa-3/30"></div>

      {/* Handwritten note (left) */}
      <div className="absolute left-12 top-1/2 hidden -translate-y-1/2 -rotate-[8deg] font-hand text-[28px] font-semibold leading-[1.2] text-cocoa-cream/90 select-none lg:block">
        <p className="pr-6">Life is</p>
        <p className="pr-1">Sweeter</p>
        <p className="pr-7">with Cake</p>
        <IconHeart className="ml-1 h-4 w-4 text-cocoa-cream" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-5 py-24 text-center lg:py-28">
        <h2 className="font-display text-[28px] font-bold leading-tight text-cream-50 md:text-[40px]">
          Ready to Add Sweetness to Your Day?
        </h2>
        <p className="mt-4 text-[15px] text-cocoa-muted">
          Place your order or get in touch &mdash; I&rsquo;d love to bake for you
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/contact"
            className="flex items-center gap-2 rounded-full bg-berry px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep"
          >
            Order Now
            <IconArrowRight />
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-2.5 rounded-full border border-cream-50/55 px-7 py-3.5 text-[15px] font-medium text-cream-50 transition-colors hover:bg-cream-50/10"
          >
            <IconMail />
            Contact Me
          </Link>
        </div>
      </div>

      {/* Thank-you tag (right, over photo) */}
      <div className="absolute right-14 bottom-8 hidden rotate-6 md:block lg:right-24">
        <div className="relative w-44 bg-paper px-4 pt-6 pb-4 text-center font-hand text-lg font-semibold leading-snug text-berry-ink shadow-md">
          <span className="absolute top-2.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cocoa/20 ring-1 ring-berry-ink/30"></span>
          Thank You
          <br />
          for supporting
          <br />
          a small home
          <br />
          bakery{" "}
          <IconHeart className="inline-block h-4 w-4 align-[-2px]" strokeWidth={2} />
        </div>
      </div>
    </section>
  );
}
