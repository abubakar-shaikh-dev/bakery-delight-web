"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FullscreenMenu, { NAV_LINKS } from "./site/FullscreenMenu";
import { IconArrowRight, IconSearch } from "./icons";

/**
 * Site navigation — rendered once in the (site) layout and kept mounted
 * across every route change, so navigating never makes it disappear.
 *
 * Behaviour:
 * - homepage: floats over the hero photo (the hero slides underneath via
 *   its negative top margin); transparent on desktop until the page
 *   scrolls, then settles into the cream strip with a soft shadow.
 * - inner pages: cream strip with hairline border; gains a shadow once
 *   scrolled.
 *
 * Only background-color/box-shadow/border-color transition (DESIGN.md
 * named transitions); min-height is fixed so the sticky bar never shifts
 * layout. Breakpoints (DESIGN.md → Responsive rules):
 *   mobile (≤ 640)    logo · search · menu button → full-screen menu
 *   tablet (641–1023) logo · search · "Order Now" · menu button → full-screen menu
 *   desktop (≥ 1024)  logo · frosted pill nav
 */
export default function SiteNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // rAF-throttled scroll state; re-evaluated per navigation since Next
  // resets scroll to the top. State changes are never synchronous here.
  useEffect(() => {
    let raf = requestAnimationFrame(() => setScrolled(window.scrollY > 12));
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 12));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const surface = isHome
    ? scrolled
      ? "bg-cream-100 shadow-sm border-b border-cream-300"
      : "max-sm:bg-cream-100 border-b border-transparent"
    : `bg-cream-100 border-b border-cream-300${scrolled ? " shadow-sm" : ""}`;

  return (
    <header
      className={`sticky top-0 z-40 flex min-h-[72px] w-full items-center justify-between gap-4 px-5 md:min-h-[88px] sm:px-10 lg:px-[8.5rem] transition-[background-color,box-shadow,border-color] duration-300 ${surface}`}
    >
      <Link
        href="/"
        aria-label="Bakery Delight — home"
        className="shrink-0 py-2"
      >
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
        className="hidden items-center gap-8 rounded-full bg-cream-50 py-3.5 px-8 text-[15px] font-medium text-ink shadow-xs ring-1 ring-cream-300 lg:flex"
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
              {/* underline dot — fades in on hover, stays for the active page */}
              <span
                aria-hidden="true"
                className={`absolute -bottom-3.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-berry transition-[opacity,transform] duration-200 ${
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-[opacity,transform] hover:text-berry-deep active:scale-95 sm:bg-white sm:shadow-xs sm:hover:shadow-md"
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
