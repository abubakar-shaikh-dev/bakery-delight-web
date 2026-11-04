import Link from "next/link";
import { IconChevronRight } from "../icons";

/**
 * Shared inner-page header: cream band, handwritten eyebrow (the site's
 * signature), big display title, subtitle and a breadcrumb. Decorative
 * branch SVG reused from the site symbol.
 */
export default function PageHeader({
  eyebrow,
  title,
  accent,
  subtitle,
  crumb,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle: string;
  crumb: string;
}) {
  return (
    <div className="relative overflow-hidden bg-cream-100">
      {/* decorative branch (from the site-wide symbol) */}
      <svg
        className="absolute -left-4 top-10 hidden h-auto w-14 -scale-x-100 text-berry/50 opacity-60 lg:block"
        aria-hidden="true"
      >
        <use href="#branch" />
      </svg>
      <svg
        className="absolute -right-6 bottom-0 hidden h-auto w-16 rotate-[160deg] text-berry/50 opacity-50 lg:block"
        aria-hidden="true"
      >
        <use href="#branch" />
      </svg>

      <div className="px-5 pt-10 pb-14 text-center sm:px-10 md:pt-14 lg:px-[8.5rem] lg:pb-20">
        <nav className="mb-5 flex items-center justify-center gap-2 text-[12px] font-medium text-stone-500">
          <Link href="/" className="transition-colors hover:text-berry">
            Home
          </Link>
          <IconChevronRight className="h-3 w-3" />
          <span className="text-berry-deep">{crumb}</span>
        </nav>

        <p className="eyebrow-hand mb-3">{eyebrow}</p>
        <h1 className="font-display text-4xl font-bold leading-[1.1] text-ink sm:text-5xl md:text-[56px]">
          {title}
          {accent && <span className="text-berry"> {accent}</span>}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-stone-600">
          {subtitle}
        </p>
      </div>

      {/* wave into the page body */}
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="block h-[46px] w-full text-cream-50 md:h-[60px]">
        <path fill="currentColor" d="M0,48 C220,10 460,66 740,40 C1000,16 1220,60 1440,28 L1440,70 L0,70 Z" />
      </svg>
    </div>
  );
}
