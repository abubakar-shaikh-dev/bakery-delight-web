import { SITE_PAGES, pageMetadata } from "@/lib/site-pages";
import PageHeader from "@/components/site/PageHeader";
import ReviewsBrowser from "@/components/site/ReviewsBrowser";
import ReviewForm from "@/components/site/ReviewForm";
import { getReviewsPage } from "@/lib/site-data";
import { jsonLd, reviewsSchemaGraph } from "@/lib/schema";

export const metadata = pageMetadata(SITE_PAGES.reviews);

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const page = await getReviewsPage(9, 0);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(reviewsSchemaGraph()) }}
      />
      <main className="bg-cream-50">
        <PageHeader
          eyebrow="Straight from the heart"
          title="What Our"
          accent="Customers Say"
          subtitle="Every review here is from a real order — words that keep our little home kitchen baking."
          crumb="Reviews"
        />

        <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
          <ReviewsBrowser initial={page} />

          {/* submit */}
          <div className="mx-auto mt-20 max-w-2xl">
            <div className="mb-6 text-center">
              <p className="eyebrow-hand">Your turn</p>
              <h2 className="mt-1 font-display text-[28px] font-bold text-ink md:text-[40px]">
                Spread a little happiness
              </h2>
            </div>
            <ReviewForm />
          </div>
        </section>
      </main>
    </>
  );
}
