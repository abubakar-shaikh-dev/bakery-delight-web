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
        <ReviewGridSkeleton count={6} />
      </section>
    </>
  );
}
