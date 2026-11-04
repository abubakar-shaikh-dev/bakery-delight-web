import { Suspense } from "react";
import About from "@/components/About";
import BackToTop from "@/components/BackToTop";
import CtaBand from "@/components/CtaBand";
import CustomCakes from "@/components/CustomCakes";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import Gallery from "@/components/Gallery";
import Hero from "@/components/Hero";
import Testimonials from "@/components/Testimonials";
import Treats from "@/components/Treats";
import {
  getFeaturedReviews,
  getFeaturedTreats,
  getGallery,
  getSettings,
} from "@/lib/site-data";
import {
  GalleryGridSkeleton,
  TestimonialsLandingSkeleton,
  TreatsLandingSkeleton,
} from "@/components/site/Skeletons";

export const dynamic = "force-dynamic";

/* Streamed, DB-backed sections — each renders behind its own exact-layout skeleton. */
async function TreatsSection({ whatsappDigits }: { whatsappDigits: string }) {
  const treats = await getFeaturedTreats(5);
  return <Treats treats={treats} whatsappDigits={whatsappDigits} />;
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
  const settings = await getSettings();

  return (
    <>
      <Hero />
      <Features />

      <Suspense fallback={<TreatsLandingSkeleton />}>
        <TreatsSection whatsappDigits={settings.whatsappDigits} />
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
      <Footer settings={settings} />
      <BackToTop />
    </>
  );
}
