import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowRight, IconChevronRight } from "@/components/icons";
import TreatCard from "@/components/site/TreatCard";
import TreatDetail from "@/components/site/TreatDetail";
import TreatReviews from "@/components/site/TreatReviews";
import {
  getFeaturedReviews,
  getRelatedTreats,
  getSettings,
  getTreatBySlug,
  getTreatReviews,
} from "@/lib/site-data";
import { absoluteUrl } from "@/lib/site-url";
import { jsonLd, treatSchemaGraph } from "@/lib/schema";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const treat = await getTreatBySlug(slug);
  if (!treat) return { title: "Treat not found", robots: { index: false, follow: false } };
  const description =
    treat.tagline || treat.description.slice(0, 150);
  const toAbsolute = (url: string) =>
    url.startsWith("http") ? url : absoluteUrl(url);
  const images = [treat.image, ...treat.images]
    .filter(Boolean)
    .map(toAbsolute);
  return {
    title: treat.name,
    description,
    alternates: { canonical: absoluteUrl(`/treats/${treat.slug}`) },
    openGraph: {
      title: `${treat.name} — Bakery Delight`,
      description,
      url: absoluteUrl(`/treats/${treat.slug}`),
      siteName: "Bakery Delight",
      type: "website",
      // Real photo dimensions, not a fake 1200×630 — scrapers fetch and
      // measure the image either way.
      images: images.map((url) => ({ url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${treat.name} — Bakery Delight`,
      description,
      images,
    },
  };
}

export default async function TreatPage({ params }: Props) {
  const { slug } = await params;
  const [treat, settings] = await Promise.all([
    getTreatBySlug(slug),
    getSettings(),
  ]);
  if (!treat) notFound();

  const [related, treatReviews] = await Promise.all([
    getRelatedTreats(treat, 4),
    getTreatReviews(treat.slug),
  ]);

  // The star summary describes this treat only. When it has no reviews of
  // its own, featured bakery-wide reviews still fill the section — without
  // the summary and without reaching the Product schema.
  const own = treatReviews.reviews.length > 0;
  const shown = own
    ? treatReviews
    : { reviews: await getFeaturedReviews(3), total: 0, avg: 0 };

  return (
    <main className="bg-cream-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(treatSchemaGraph(treat, settings, treatReviews)),
        }}
      />
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 px-5 pt-6 text-[12px] font-medium text-stone-500 sm:px-10 lg:px-[8.5rem]"
      >
        <Link href="/" className="-my-2 inline-flex items-center py-2 transition-colors hover:text-berry-deep">
          Home
        </Link>
        <IconChevronRight className="h-4 w-4 text-cream-400" />
        <Link href="/treats" className="-my-2 inline-flex items-center py-2 transition-colors hover:text-berry-deep">
          Treats
        </Link>
        <IconChevronRight className="h-4 w-4 text-cream-400" />
        <span className="text-berry-deep">{treat.name}</span>
      </nav>

      <section className="px-5 pt-8 pb-16 sm:px-10 lg:px-[8.5rem]">
        <TreatDetail treat={treat} whatsappDigits={settings.whatsappDigits} />
      </section>

      <TreatReviews
        reviews={shown.reviews}
        total={shown.total}
        avg={shown.avg}
        own={own}
      />

      {related.length > 0 && (
        <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-[28px] font-bold leading-none text-ink md:text-[40px]">
              More from the oven
              <span className="ml-5 -mt-2 inline-block h-px w-20 bg-cream-400 align-middle md:w-24"></span>
            </h2>
            <Link
              href="/treats"
              className="group flex items-center gap-2 text-[15px] font-medium text-berry-deep"
            >
              All treats
              <IconArrowRight className="transition-[opacity,transform] duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((t) => (
              <TreatCard
                key={t._id}
                treat={t}
                whatsappDigits={settings.whatsappDigits}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
