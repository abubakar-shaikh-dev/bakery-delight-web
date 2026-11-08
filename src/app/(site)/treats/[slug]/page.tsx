import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconChevronRight } from "@/components/icons";
import TreatCard from "@/components/site/TreatCard";
import TreatDetail from "@/components/site/TreatDetail";
import {
  getRelatedTreats,
  getSettings,
  getTreatBySlug,
} from "@/lib/site-data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const treat = await getTreatBySlug(slug);
  if (!treat) return { title: "Treat not found" };
  return {
    title: treat.name,
    description: treat.tagline || treat.description.slice(0, 150),
  };
}

export default async function TreatPage({ params }: Props) {
  const { slug } = await params;
  const [treat, settings] = await Promise.all([
    getTreatBySlug(slug),
    getSettings(),
  ]);
  if (!treat) notFound();

  const related = await getRelatedTreats(treat, 4);

  return (
    <main className="bg-cream-50">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 px-5 pt-6 text-[12px] font-medium text-stone-500 sm:px-10 lg:px-[8.5rem]"
      >
        <Link href="/" className="transition-colors hover:text-berry-deep">
          Home
        </Link>
        <IconChevronRight className="h-3 w-3 text-cream-400" />
        <Link href="/treats" className="transition-colors hover:text-berry-deep">
          Treats
        </Link>
        <IconChevronRight className="h-3 w-3 text-cream-400" />
        <span className="text-berry-deep">{treat.name}</span>
      </nav>

      <section className="px-5 pt-8 pb-16 sm:px-10 lg:px-[8.5rem]">
        <TreatDetail treat={treat} whatsappDigits={settings.whatsappDigits} />
      </section>

      {related.length > 0 && (
        <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
          <h2 className="font-display text-3xl font-bold leading-none text-ink md:text-4xl">
            More from the oven
            <span className="ml-5 -mt-2 inline-block h-px w-20 bg-cream-400 align-middle md:w-24"></span>
          </h2>
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
