import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconCupcake } from "./icons";
import type { TreatData } from "@/lib/site-data";

export default function Treats({
  treats,
}: {
  treats: TreatData[];
}) {
  return (
    <section id="treats" className="px-5 pt-10 pb-24 sm:px-10 lg:px-[8.5rem]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[28px] font-bold leading-none text-ink md:text-[40px]">
            Our Treats
            <span className="ml-5 -mt-2 inline-block h-px w-20 bg-cream-400 align-middle md:w-24"></span>
          </h2>
          <p className="mt-4 text-[15px] text-stone-600">
            From classic flavours to custom creations, there&rsquo;s something for every occasion.
          </p>
        </div>
        <Link
          href="/treats"
          className="group flex items-center gap-2 text-[15px] font-medium text-berry-deep"
        >
          View All
          <IconArrowRight className="transition-[opacity,transform] duration-200 group-hover:translate-x-1" />
        </Link>
      </div>

      {treats.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-white px-6 py-12 text-center ring-1 ring-cream-300">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <IconCupcake className="h-6 w-6" />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">
            The oven is warming up
          </p>
          <p className="mt-1 max-w-xs text-[13px] text-stone-500">
            Fresh treats land here as soon as they&rsquo;re ready
          </p>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
          {treats.map((t, i) => (
            <Link
              key={t._id}
              href={`/treats/${t.slug}`}
              className="group rounded-2xl bg-white p-2.5 shadow-xs ring-1 ring-cream-300 transition-shadow duration-200 hover:shadow-md"
            >
              <div className="relative aspect-[1/1.04] overflow-hidden rounded-xl">
                {t.image ? (
                  <Image
                    src={t.image}
                    alt={t.name}
                    fill
                    sizes="(min-width:1280px) 205px, (min-width:768px) 30vw, 46vw"
                    className="object-cover"
                    priority={i < 2}
                  />
                ) : (
                  <div className="grid h-full place-items-center bg-berry-soft font-display text-[40px] font-bold text-berry-deep">
                    {t.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between px-1.5 pb-1.5 pt-3.5">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold text-ink">{t.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-stone-500">{t.tagline}</p>
                </div>
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-berry/35 text-berry-deep transition-colors group-hover:border-berry group-hover:bg-berry group-hover:text-white"
                >
                  <IconArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
