import PageHeader from "@/components/site/PageHeader";
import { ReviewGridSkeleton } from "@/components/site/Skeletons";

export default function LoadingReviews() {
  return (
    <>
      <PageHeader
        eyebrow="Straight from the heart"
        title="What Our"
        accent="Customers Say"
        subtitle="Every review here is from a real order — words that keep our little home kitchen baking."
        crumb="Reviews"
      />
      <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <ReviewGridSkeleton count={9} />

        {/* submit block */}
        <div className="mx-auto mt-20 max-w-2xl">
          <div className="mb-6 text-center">
            <div className="skeleton mx-auto h-5 w-24" />
            <div className="skeleton mx-auto mt-2 h-9 w-64" />
          </div>
          <div className="skeleton h-[560px] rounded-2xl" />
        </div>
      </section>
    </>
  );
}
