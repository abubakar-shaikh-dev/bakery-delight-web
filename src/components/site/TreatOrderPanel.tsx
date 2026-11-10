"use client";

import { useState } from "react";
import { IconHeart, IconWhatsApp } from "../icons";
import { treatFromPrice, waOrderLink } from "@/lib/utils";
import type { TreatVariantData } from "@/lib/site-data";

/**
 * Price, sizes and the order CTA — the three things a buyer acts on.
 * Picking a size pins the price line and names the size in the WhatsApp
 * message. Sizes are optional: the panel renders whatever the owner filled.
 */
export default function TreatOrderPanel({
  name,
  price,
  variants,
  whatsappDigits,
}: {
  name: string;
  price: number | null;
  variants: TreatVariantData[];
  whatsappDigits: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const chosen = selected !== null ? variants[selected] : null;
  const fromPrice = treatFromPrice(price, variants);
  const showPrice = chosen !== null || fromPrice !== null;

  return (
    <div>
      {chosen ? (
        <p className="mt-6 font-display text-[28px] font-bold text-berry tabular-nums md:text-[40px]">
          ₹{chosen.price}
        </p>
      ) : fromPrice !== null ? (
        <p className="mt-6 font-display text-[28px] font-bold text-berry tabular-nums md:text-[40px]">
          ₹{fromPrice}
          <span className="ml-2 align-baseline font-sans text-sm font-medium text-stone-500">
            onwards
          </span>
        </p>
      ) : null}

      {variants.length > 0 && (
        <div
          role="group"
          aria-label="Sizes"
          className={`max-w-md rounded-2xl bg-cream-100 p-5 ring-1 ring-cream-300 ${
            showPrice ? "mt-5" : "mt-6"
          }`}
        >
          <p className="text-[12px] font-medium text-stone-500">Sizes</p>
          <div className="mt-2.5 space-y-1.5">
            {variants.map((v, i) => (
              <button
                key={`${v.label}-${i}`}
                type="button"
                aria-pressed={i === selected}
                onClick={() => setSelected(i)}
                className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-left transition-colors ${
                  i === selected
                    ? "bg-white ring-1 ring-berry/40"
                    : "hover:bg-white/70"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    i === selected ? "bg-berry" : "ring-1 ring-cream-400"
                  }`}
                />
                <span className="flex-1 text-[14px] font-medium text-ink">
                  {v.label}
                </span>
                <span className="text-[14px] font-semibold text-ink tabular-nums">
                  ₹{v.price}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {whatsappDigits && (
        <div className="mt-7 flex flex-wrap items-center gap-6">
          <a
            href={waOrderLink(whatsappDigits, name, chosen?.label)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-wa px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-wa-deep"
          >
            <IconWhatsApp className="h-5 w-5" />
            Order on WhatsApp
          </a>
          <p className="-rotate-2 select-none font-hand text-[22px] font-semibold leading-[1.15] text-berry-ink">
            baked to order
            <br />
            with love
            <IconHeart className="ml-1.5 inline h-4 w-4 align-baseline" />
          </p>
        </div>
      )}
    </div>
  );
}
