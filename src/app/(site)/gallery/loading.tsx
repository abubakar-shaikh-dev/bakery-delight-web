import PageHeader from "@/components/site/PageHeader";
import { GalleryBentoSkeleton } from "@/components/site/Skeletons";

export default function LoadingGallery() {
  return (
    <>
      <PageHeader
        eyebrow="Behind the kitchen door"
        title="Our"
        accent="Gallery"
        subtitle="The cakes, the crumbs and the celebrations — snapshots from our home kitchen."
        crumb="Gallery"
      />
      <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <GalleryBentoSkeleton />
      </section>
    </>
  );
}
