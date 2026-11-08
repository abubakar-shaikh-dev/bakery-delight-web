import Image from "next/image";
import { Scale, Users } from "lucide-react";
import { IconHeart, IconWhatsApp } from "../icons";
import { waOrderLink } from "@/lib/utils";
import type { TreatData } from "@/lib/site-data";

/**
 * The treat detail hero — photo beside a recipe-card style info column.
 * Weight/serves are the owner's optional fields: empty means the spec card
 * doesn't render at all, never an empty row.
 */
export default function TreatDetail({
  treat,
  whatsappDigits,
}: {
  treat: TreatData;
  whatsappDigits: string;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-14">
      {/* photo */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-berry-soft ring-1 ring-cream-300 sm:aspect-[4/5]">
        {treat.image ? (
          <Image
            src={treat.image}
            alt={treat.name}
            fill
            priority
            sizes="(min-width:1024px) 40vw, 92vw"
            className="object-cover"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <span className="font-display text-8xl text-berry-deep/70">
              {treat.name.charAt(0)}
            </span>
          </div>
        )}
      </div>

      {/* info */}
      <div>
        <p className="eyebrow-hand">{treat.category}</p>
        <h1 className="mt-1 font-display text-4xl font-bold leading-[1.05] text-ink md:text-5xl">
          {treat.name}
        </h1>
        {treat.tagline && (
          <p className="mt-3 text-[15px] text-stone-600">{treat.tagline}</p>
        )}

        {treat.price !== null && (
          <p className="mt-6 font-display text-3xl font-bold text-berry tabular-nums md:text-4xl">
            ₹{treat.price}
            <span className="ml-2 align-baseline font-sans text-sm font-medium text-stone-500">
              onwards
            </span>
          </p>
        )}

        {whatsappDigits && (
          <div className="mt-7 flex flex-wrap items-center gap-6">
            <a
              href={waOrderLink(whatsappDigits, treat.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-wa px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-wa-deep"
            >
              <IconWhatsApp className="h-5 w-5" />
              Order on WhatsApp
            </a>
            <p className="-rotate-2 select-none font-hand text-xl font-semibold leading-[1.15] text-berry-ink">
              baked to order
              <br />
              with love
              <IconHeart className="ml-1.5 inline h-4 w-4 align-baseline" />
            </p>
          </div>
        )}

        {treat.description && (
          <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-stone-600">
            {treat.description}
          </p>
        )}

        {(treat.weight || treat.serves) && (
          <dl className="mt-8 grid max-w-md grid-cols-1 gap-4 rounded-2xl bg-cream-100 p-5 ring-1 ring-cream-300 sm:grid-cols-2">
            {treat.weight && (
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-berry-deep ring-1 ring-cream-300">
                  <Scale className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <div>
                  <dt className="text-[12px] font-medium text-stone-500">Weight</dt>
                  <dd className="mt-0.5 text-[14px] font-semibold text-ink">
                    {treat.weight}
                  </dd>
                </div>
              </div>
            )}
            {treat.serves && (
              <div className="flex items-start gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-berry-deep ring-1 ring-cream-300">
                  <Users className="h-[18px] w-[18px]" strokeWidth={1.8} />
                </span>
                <div>
                  <dt className="text-[12px] font-medium text-stone-500">Serves</dt>
                  <dd className="mt-0.5 text-[14px] font-semibold text-ink">
                    {treat.serves}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}
