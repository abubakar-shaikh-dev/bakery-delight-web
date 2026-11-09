import { SITE_PAGES, pageMetadata } from "@/lib/site-pages";
import PageHeader from "@/components/site/PageHeader";
import GalleryBrowser from "@/components/site/GalleryBrowser";
import { getGalleryPage } from "@/lib/site-data";
import { gallerySchemaGraph, jsonLd } from "@/lib/schema";

export const metadata = pageMetadata(SITE_PAGES.gallery);

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const page = await getGalleryPage(12, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(gallerySchemaGraph(page.images)) }}
      />
      <main className="bg-cream-50">
      <PageHeader
        eyebrow="Behind the kitchen door"
        title="Our"
        accent="Gallery"
        subtitle="The cakes, the crumbs and the celebrations — snapshots from our home kitchen."
        crumb="Gallery"
      />

      <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <GalleryBrowser initial={page} />
      </section>
    </main>
    </>
  );
}
