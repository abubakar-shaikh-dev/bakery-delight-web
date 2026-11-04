import Image from "next/image";
import { IconArrowRight, IconWhatsApp } from "../icons";

export default function TreatCard({
  treat,
  whatsappDigits,
  priority = false,
}: {
  treat: {
    _id: string;
    name: string;
    category: string;
    tagline: string;
    description: string;
    price: number | null;
    image: string;
  };
  whatsappDigits: string;
  priority?: boolean;
}) {
  const waText = encodeURIComponent(
    `Hi Bakery Delight! I'd like to order ${treat.name}.`,
  );

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-cream-300 transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
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
            <span className="font-display text-5xl">{treat.name.charAt(0)}</span>
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-berry-deep backdrop-blur-sm">
          {treat.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-[22px] font-bold leading-tight text-ink">
              {treat.name}
            </h3>
            <p className="mt-0.5 text-[13px] text-stone-500">{treat.tagline}</p>
          </div>
          {treat.price !== null && (
            <p className="shrink-0 rounded-full bg-berry-soft px-3 py-1 text-[13px] font-semibold text-berry-deep tabular-nums">
              ₹{treat.price}
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
          <a
            href={`https://wa.me/${whatsappDigits}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-wa"
          >
            <IconWhatsApp className="h-4 w-4" />
            Order on WhatsApp
          </a>
          <span
            aria-hidden="true"
            className="grid h-8 w-8 place-items-center rounded-full border border-berry/30 text-berry transition-colors group-hover:bg-berry group-hover:text-white"
          >
            <IconArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
