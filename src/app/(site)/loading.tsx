import {
  GalleryGridSkeleton,
  TestimonialsLandingSkeleton,
  TreatsLandingSkeleton,
} from "@/components/site/Skeletons";

/**
 * Home's loading skeleton — mirrors the page's exact section order
 * (hero, features, treats, about story, custom-cakes band, testimonials,
 * gallery, cocoa CTA). The hero renders as a quiet cream stage since its
 * content arrives with the shell.
 */
export default function HomeLoading() {
  return (
    <main>
      {/* hero */}
      <div className="relative min-h-[70vh] bg-cream-100">
        <div className="px-5 pt-[132px] pb-28 sm:px-10 sm:pt-[112px] md:pt-[144px] lg:px-[8.5rem] lg:pt-[120px] lg:pb-0">
          <div className="max-w-xl space-y-5">
            <div className="skeleton h-24 w-80 max-w-full sm:h-40" />
            <div className="skeleton h-4 w-72 max-w-full" />
            <div className="flex gap-4 pt-2">
              <div className="skeleton h-12 w-40 rounded-full" />
              <div className="skeleton h-12 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* features */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-10 px-5 py-16 sm:px-10 lg:grid-cols-4 lg:px-[8.5rem]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="skeleton mt-3 h-4 w-28" />
            <div className="skeleton mt-2 h-3 w-36" />
          </div>
        ))}
      </div>

      <TreatsLandingSkeleton />

      {/* about story */}
      <div className="grid items-center gap-16 px-5 py-16 sm:px-10 lg:grid-cols-2 lg:gap-20 lg:px-[8.5rem] lg:py-24">
        <div className="skeleton aspect-[680/760] w-full max-w-[460px] rounded-2xl" />
        <div className="space-y-4">
          <div className="skeleton h-10 w-72 max-w-full" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-5/6" />
          <div className="skeleton h-4 w-2/3" />
        </div>
      </div>

      {/* custom cakes band */}
      <div className="h-64 bg-blush-200" />

      <TestimonialsLandingSkeleton />
      <GalleryGridSkeleton />

      {/* cocoa CTA band */}
      <div className="h-72 bg-cocoa" />
    </main>
  );
}
