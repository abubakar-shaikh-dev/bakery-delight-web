import { Scale, Users } from "lucide-react";
import TreatGallery from "./TreatGallery";
import TreatOrderPanel from "./TreatOrderPanel";
import type { TreatData } from "@/lib/site-data";

/**
 * The treat detail hero — photo beside a recipe-card style info column.
 * Weight/serves, sizes and extra photos are the owner's optional fields:
 * empty means the block doesn't render at all, never an empty row.
 */
export default function TreatDetail({
  treat,
  whatsappDigits,
}: {
  treat: TreatData;
  whatsappDigits: string;
}) {
  const photos = treat.images.length > 0 ? treat.images : treat.image ? [treat.image] : [];

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-14">
      {/* photo + thumbnails */}
      <TreatGallery photos={photos} name={treat.name} />

      {/* info */}
      <div>
        <p className="eyebrow-hand">{treat.category}</p>
        <h1 className="mt-1 font-display text-[28px] font-bold leading-[1.05] text-ink md:text-[44px]">
          {treat.name}
        </h1>
        {treat.tagline && (
          <p className="mt-3 text-[15px] text-stone-600">{treat.tagline}</p>
        )}

        <TreatOrderPanel
          name={treat.name}
          price={treat.price}
          variants={treat.variants}
          whatsappDigits={whatsappDigits}
        />

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
