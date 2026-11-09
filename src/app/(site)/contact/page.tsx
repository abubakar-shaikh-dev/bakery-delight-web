import { SITE_PAGES, pageMetadata } from "@/lib/site-pages";
import PageHeader from "@/components/site/PageHeader";
import ContactForm from "@/components/site/ContactForm";
import Faq, { contactFaqs } from "@/components/site/Faq";
import {
  IconFacebook,
  IconInstagram,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPinterest,
  IconWhatsApp,
  IconYoutube,
} from "@/components/icons";
import { getSettings, SettingsData } from "@/lib/site-data";
import { contactSchemaGraph, jsonLd } from "@/lib/schema";
import { IconClock } from "@/components/icons";

export const metadata = pageMetadata(SITE_PAGES.contact);

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings: SettingsData = await getSettings();
  const waText = encodeURIComponent(
    "Hi Bakery Delight, I'd like to ask about ordering a cake.",
  );
  const waLink = settings.whatsappDigits
    ? `https://wa.me/${settings.whatsappDigits}?text=${waText}`
    : "";

  const socials = [
    { label: "Instagram", href: settings.socials.instagram, icon: <IconInstagram /> },
    { label: "WhatsApp", href: settings.socials.whatsapp, icon: <IconWhatsApp /> },
    { label: "Pinterest", href: settings.socials.pinterest, icon: <IconPinterest /> },
    { label: "Facebook", href: settings.socials.facebook, icon: <IconFacebook /> },
    { label: "YouTube", href: settings.socials.youtube, icon: <IconYoutube className="h-[19px] w-[19px]" /> },
  ].filter((s) => s.href);
  const faqs = contactFaqs(settings);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(contactSchemaGraph(settings, faqs)) }}
      />
      <main className="bg-cream-50">
        <PageHeader
          eyebrow="We'd love to hear from you"
          title="Get in"
          accent="Touch"
          subtitle="Order a cake, plan a celebration or just say hello — pick whichever way feels easiest."
          crumb="Contact"
        />

        <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
            {/* info cards */}
            <div className="flex flex-col gap-5">
              {/* WhatsApp — hero card (only when configured) */}
              {waLink && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-5 rounded-2xl bg-wa p-6 text-white shadow-md transition-colors hover:bg-wa-deep"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white/15">
                    <IconWhatsApp className="h-7 w-7" />
                  </span>
                  <span>
                    <span className="block font-display text-2xl font-bold">
                      Chat on WhatsApp
                    </span>
                    <span className="block text-[13px] text-white/80">
                      Fastest way to order
                    </span>
                    <span className="mt-1 block text-[14px] font-semibold tabular-nums">
                      {settings.whatsappNumber}
                    </span>
                  </span>
                </a>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream-300 transition-shadow hover:shadow-md"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-berry-soft text-berry-deep">
                    <IconPhone className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold text-ink">Call us</span>
                    <span className="mt-0.5 block text-[13px] text-stone-600 tabular-nums">
                      {settings.phone}
                    </span>
                  </span>
                </a>

                <a
                  href={`mailto:${settings.email}`}
                  className="group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream-300 transition-shadow hover:shadow-md"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-berry-soft text-berry-deep">
                    <IconMail className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-ink">Email</span>
                    <span className="mt-0.5 block truncate text-[13px] text-stone-600">
                      {settings.email}
                    </span>
                  </span>
                </a>
              </div>

              <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream-300">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-berry-soft text-berry-deep">
                  <IconMapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">Find us</p>
                  <p className="mt-0.5 text-[13px] text-stone-600">{settings.address}</p>
                  <p className="mt-3 flex items-center gap-2 text-[13px] text-stone-600">
                    <IconClock className="h-4 w-4 text-berry-deep" strokeWidth={1.8} />
                    Message us any day — we reply as soon as we&rsquo;re out of the kitchen
                  </p>
                </div>
              </div>

              {socials.length > 0 && (
                <div className="rounded-2xl bg-blush-200 p-5">
                  <p className="text-[13px] font-semibold text-cocoa-2">
                    Follow along
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        title={s.label}
                        className="grid h-10 w-10 place-items-center rounded-full bg-white text-berry-deep shadow-sm transition-colors hover:bg-berry hover:text-white"
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* form */}
            <ContactForm whatsappDigits={settings.whatsappDigits} />
          </div>
        </section>

        {/* answers mirrored into the FAQPage schema above */}
        <Faq faqs={faqs} />
      </main>
    </>
  );
}
