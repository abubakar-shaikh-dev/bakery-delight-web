import Image from "next/image";
import Link from "next/link";
import {
  IconFacebook,
  IconInstagram,
  IconMail,
  IconMapPin,
  IconPhone,
  IconPinterest,
  IconWhatsApp,
  IconYoutube,
} from "./icons";
import type { SettingsData } from "@/lib/site-data";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Our Treats", href: "/treats" },
  { label: "About", href: "/about" },
  { label: "Reviews", href: "/reviews" },
  { label: "Contact", href: "/contact" },
];

export default function Footer({ settings }: { settings: SettingsData }) {
  const socials = [
    { label: "Instagram", href: settings.socials.instagram, icon: <IconInstagram /> },
    { label: "WhatsApp", href: settings.socials.whatsapp, icon: <IconWhatsApp /> },
    { label: "Pinterest", href: settings.socials.pinterest, icon: <IconPinterest /> },
    { label: "Facebook", href: settings.socials.facebook, icon: <IconFacebook /> },
    { label: "YouTube", href: settings.socials.youtube, icon: <IconYoutube /> },
  ].filter((s) => s.href);

  return (
    <footer id="contact" className="relative overflow-hidden bg-cream-100">
      <svg
        className="absolute right-8 bottom-20 hidden h-auto w-16 rotate-12 -scale-x-100 text-berry/50 opacity-80 xl:block"
        aria-hidden="true"
      >
        <use href="#branch" />
      </svg>

      <div className="px-5 pt-16 pb-8 md:px-10 lg:px-[8.5rem]">
        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-[1.3fr_0.7fr_1fr_auto] xl:gap-16">
          {/* Brand */}
          <div>
            <Image
              src="/navbar-logo.webp"
              alt="Bakery Delight"
              width={465}
              height={160}
              sizes="192px"
              className="h-12 w-auto"
            />
            <p className="mt-2 pl-1 text-[12px] font-medium text-berry-deep">
              {settings.tagline}
            </p>
            <p className="mt-6 max-w-[280px] text-[14px] leading-relaxed text-stone-600">
              From our home to yours &mdash; thank you for being part of our sweet journey. &hearts;
            </p>
            <div className="mt-6 flex items-center gap-5 text-berry-deep">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="transition-colors hover:text-berry"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[15px] font-semibold text-ink">Quick Links</h4>
            <ul className="mt-5 space-y-3 text-[14px] text-stone-600">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-berry">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get in touch */}
          <div>
            <h4 className="text-[15px] font-semibold text-ink">Get in Touch</h4>
            <ul className="mt-5 space-y-4 text-[14px] text-stone-600">
              <li className="flex items-center gap-3">
                <span className="text-berry-deep">
                  <IconMail />
                </span>
                <a
                  href={`mailto:${settings.email}`}
                  className="transition-colors hover:text-berry"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-berry-deep">
                  <IconPhone />
                </span>
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="transition-colors hover:text-berry"
                >
                  {settings.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-berry-deep">
                  <IconMapPin />
                </span>
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          {/* Handwritten */}
          <div className="hidden select-none flex-col items-center justify-start pt-2 pr-6 xl:flex">
            <p className="rotate-6 text-center font-hand text-[22px] font-semibold leading-[1.25] text-berry-ink">
              Made with &hearts;
              <br />
              Love
              <br />
              In a Home Kitchen
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-cream-300 pt-6 text-[13px] text-stone-500">
          <p>&copy; {new Date().getFullYear()} {settings.bakeryName}. All rights reserved.</p>
          <p>Sweet moments, always</p>
        </div>
      </div>
    </footer>
  );
}
