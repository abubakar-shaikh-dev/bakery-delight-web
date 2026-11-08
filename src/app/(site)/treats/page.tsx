import PageHeader from "@/components/site/PageHeader";
import { SITE_PAGES, pageMetadata } from "@/lib/site-pages";
import TreatsBrowser from "@/components/site/TreatsBrowser";
import { getSettings, getTreatsPage } from "@/lib/site-data";

export const metadata = pageMetadata(SITE_PAGES.treats);

export const dynamic = "force-dynamic";

export default async function TreatsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const [settings, page] = await Promise.all([
    getSettings(),
    getTreatsPage(q, category, 8, 0),
  ]);

  return (
    <>
      <main className="bg-cream-50">
        <PageHeader
          eyebrow="Fresh from the oven"
          title="Our"
          accent="Treats"
          subtitle="From classic flavours to custom creations, there's something for every occasion. Search the menu or pick a category."
          crumb="Our Treats"
        />

        <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
          <TreatsBrowser
            initial={page}
            whatsappDigits={settings.whatsappDigits}
            initialQ={q}
            initialCategory={category}
          />
        </section>
      </main>
    </>
  );
}
