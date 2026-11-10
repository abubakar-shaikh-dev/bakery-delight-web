import type { SettingsData } from "@/lib/site-data";

/**
 * The contact page's FAQ — a quiet grid following the About values pattern.
 * The same Q&A is mirrored word-for-word into FAQPage JSON-LD by
 * contactSchemaGraph, so the two must never drift apart.
 */
export interface FaqItem {
  q: string;
  a: string;
}

/** Answers state only what the site already claims elsewhere. */
export function contactFaqs(settings: SettingsData): FaqItem[] {
  return [
    {
      q: "How do I order a treat?",
      a: "Message us on WhatsApp with what you have in mind, or send the contact form below. We confirm the details and get back to you within a day.",
    },
    {
      q: "Where are you based?",
      a: `We're a one-person home kitchen in ${settings.address}. Every treat is baked to order here — no factory lines, just careful hands.`,
    },
    {
      q: "What can I order?",
      a: "Cakes, cupcakes, cookies, brownies and seasonal specials — from a single serving to full celebration cakes. The treats page carries the current menu and prices.",
    },
    {
      q: "Can I customise a cake?",
      a: "Yes — flavours, colours and messages are made to order. Tell us the occasion and we'll suggest sizes and designs that fit it.",
    },
  ];
}

export default function Faq({ faqs }: { faqs: FaqItem[] }) {
  return (
    <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
      <div className="text-center">
        <p className="eyebrow-hand">Common questions</p>
        <h2 className="mt-1 font-display text-[28px] font-bold text-ink md:text-[40px]">
          Before you ask
        </h2>
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {faqs.map((f) => (
          <div
            key={f.q}
            className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream-300"
          >
            <h3 className="text-[15px] font-semibold text-ink">{f.q}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-stone-600">
              {f.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
