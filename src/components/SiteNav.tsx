"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FullscreenMenu, { NAV_LINKS } from "./site/FullscreenMenu";
import { IconArrowRight, IconSearch } from "./icons";

/**
 * Site navigation.
 * variant "overlay": floats over the hero photo (homepage) — solid strip on phones.
 * variant "solid":   cream bar for inner pages.
 *
 * Breakpoints (DESIGN.md → Responsive rules):
 *   mobile (≤ 640)    logo · search · menu button → full-screen menu
 *   tablet (641–1023) logo · search · "Order Now" · menu button → full-screen menu
 *   desktop (≥ 1024)  logo · frosted pill nav
 */
export default function SiteNav({ variant = "overlay" }: { variant?: "overlay" | "solid" }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={
        variant === "solid"
          ? "relative z-30 flex items-center justify-between gap-4 border-b border-cream-300 bg-cream-100 px-5 py-4 sm:px-10 lg:px-[8.5rem]"
          : "relative z-30 flex items-center justify-between gap-4 px-5 pt-6 max-sm:pb-5 sm:bg-transparent md:px-10 lg:px-[8.5rem] max-sm:bg-cream-100"
      }
    >
      <Link href="/" aria-label="Bakery Delight — home" className="shrink-0">
        <Image
          src="/navbar-logo.webp"
          alt="Bakery Delight"
          width={465}
          height={160}
          sizes="(min-width: 768px) 224px, 160px"
          className="h-10 w-auto md:h-14"
          priority
        />
      </Link>

      {/* Desktop pill nav (≥ lg) */}
      <nav
        aria-label="Primary"
        className="hidden items-center gap-8 rounded-full bg-white/55 py-3.5 px-8 text-[15px] font-medium text-ink shadow-xs backdrop-blur-md lg:flex"
      >
        {NAV_LINKS.map((l) => {
          const active = isActive(l.href);
          return (
            <Link
              key={l.label}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`group relative transition-colors duration-150 ${
                active ? "font-semibold text-berry-deep" : "hover:text-berry-deep"
              }`}
            >
              {l.label}
              {/* underline dot — rises in on hover, stays for the active page */}
              <span
                aria-hidden="true"
                className={`absolute -bottom-3.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-berry transition-[opacity,transform] duration-200 ${
                  active
                    ? "scale-100 opacity-100"
                    : "scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100"
                }`}
              />
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2.5 md:gap-3">
        <Link
          href="/treats"
          aria-label="Search treats"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[background-color,color,transform] hover:text-berry-deep active:scale-95 sm:bg-white/70 sm:shadow-xs sm:backdrop-blur-md sm:hover:bg-white"
        >
          <IconSearch />
        </Link>

        <Link
          href="/contact"
          className="group hidden items-center gap-2 rounded-full bg-berry py-3.5 pr-5 pl-6 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep sm:flex"
        >
          Order Now
          <IconArrowRight className="h-4 w-4 transition-[opacity,transform] duration-200 group-hover:translate-x-1" />
        </Link>

        {/* Phones + tablets: full-screen menu */}
        <FullscreenMenu />
      </div>
    </header>
  );
}
