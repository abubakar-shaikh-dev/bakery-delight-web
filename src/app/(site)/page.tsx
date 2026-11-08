import { Suspense } from "react";
import About from "@/components/About";
import CtaBand from "@/components/CtaBand";
import CustomCakes from "@/components/CustomCakes";
import Features from "@/components/Features";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Treats from "@/components/Treats";
import {
  getFeaturedReviews,
  getFeaturedTreats,
  getGallery,
  getReviewsSummary,
  getSettings,
} from "@/lib/site-data";
import {
  GalleryGridSkeleton,
  TestimonialsLandingSkeleton,
  TreatsLandingSkeleton,
} from "@/components/site/Skeletons";
import { SITE_PAGES, pageMetadata } from "@/lib/site-pages";
import { bakerySchema, jsonLd } from "@/lib/schema";

export const metadata = pageMetadata(SITE_PAGES.home);
export const dynamic = "force-dynamic";

/* Streamed, DB-backed sections — each renders behind its own exact-layout skeleton. */
async function TreatsSection() {
  const treats = await getFeaturedTreats(5);
  return <Treats treats={treats} />;
}

async function TestimonialsSection() {
  const reviews = await getFeaturedReviews(3);
  return <Testimonials reviews={reviews} />;
}

async function GallerySection({ instagramUrl }: { instagramUrl: string }) {
  const images = await getGallery(5);
  return <Gallery images={images} instagramUrl={instagramUrl} />;
}

export default async function Home() {
  const [settings, reviewStats] = await Promise.all([
    getSettings(),
    getReviewsSummary(),
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(bakerySchema(settings)) }}
      />
      <Hero reviewStats={reviewStats} />
      <Features />

      <Suspense fallback={<TreatsLandingSkeleton />}>
        <TreatsSection />
      </Suspense>

      <About />
      <CustomCakes />

      <Suspense fallback={<TestimonialsLandingSkeleton />}>
        <TestimonialsSection />
      </Suspense>

      <Suspense fallback={<GalleryGridSkeleton />}>
        <GallerySection instagramUrl={settings.socials.instagram} />
      </Suspense>

      <CtaBand />
    </>
  );
}
