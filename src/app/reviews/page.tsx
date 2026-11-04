import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import ReviewsBrowser from "@/components/site/ReviewsBrowser";
import ReviewForm from "@/components/site/ReviewForm";
import SiteNav from "@/components/SiteNav";
import Footer from "@/components/Footer";
import { getReviewsPage, getSettings } from "@/lib/site-data";

export const metadata: Metadata = {
  title: "Customer Reviews",
  description: "What our customers say about Bakery Delight's homemade cakes and treats.",
};

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const [settings, page] = await Promise.all([getSettings(), getReviewsPage(9, 0)]);

  return (
    <>
      <SiteNav variant="solid" />
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
              <h2 className="mt-1 font-display text-3xl font-bold text-ink md:text-4xl">
                Spread a little happiness
              </h2>
            </div>
            <ReviewForm />
          </div>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
