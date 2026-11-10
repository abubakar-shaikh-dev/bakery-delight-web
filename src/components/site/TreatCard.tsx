import Image from "next/image";
import Link from "next/link";
import { IconArrowRight, IconWhatsApp } from "../icons";
import { treatFromPrice, waOrderLink } from "@/lib/utils";

export default function TreatCard({
  treat,
  whatsappDigits,
  priority = false,
}: {
  treat: {
    _id: string;
    name: string;
    slug: string;
    category: string;
    tagline: string;
    description: string;
    price: number | null;
    image: string;
    variants?: Array<{ price: number }>;
  };
  whatsappDigits: string;
  priority?: boolean;
}) {
  const detailHref = `/treats/${treat.slug}`;
  const fromPrice = treatFromPrice(treat.price, treat.variants);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-cream-300 transition-shadow duration-200 hover:shadow-md">
      <Link
        href={detailHref}
        aria-label={`View ${treat.name}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        {treat.image ? (
          <Image
            src={treat.image}
            alt={treat.name}
            fill
            sizes="(min-width:1280px) 300px, (min-width:640px) 45vw, 92vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div className="grid h-full place-items-center bg-berry-soft text-berry-deep">
            <span className="font-display text-[44px]">{treat.name.charAt(0)}</span>
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-berry-deep shadow-xs">
          {treat.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[22px] font-bold leading-tight text-ink">
              <Link
                href={detailHref}
                className="transition-colors duration-150 hover:text-berry-deep"
              >
                {treat.name}
              </Link>
            </h3>
            <p className="mt-0.5 text-[13px] text-stone-500">{treat.tagline}</p>
          </div>
          {fromPrice !== null && (
            <p className="shrink-0 rounded-full bg-berry-soft px-3 py-1 text-[13px] font-semibold text-berry-deep tabular-nums">
              ₹{fromPrice}
              <span className="text-[11px] font-medium text-berry-deep/70">+</span>
            </p>
          )}
        </div>

        {treat.description && (
          <p className="mt-3 line-clamp-2 text-[13px] leading-relaxed text-stone-600">
            {treat.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          {whatsappDigits ? (
            <a
              href={waOrderLink(whatsappDigits, treat.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-wa"
            >
              <IconWhatsApp className="h-4 w-4" />
              Order on WhatsApp
            </a>
          ) : (
            <span className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-stone-500">
              <IconWhatsApp className="h-4 w-4" />
              Ask us on WhatsApp
            </span>
          )}
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-full border border-berry/30 text-berry-deep transition-colors group-hover:border-berry group-hover:bg-berry group-hover:text-white"
          >
            <IconArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </article>
  );
}
