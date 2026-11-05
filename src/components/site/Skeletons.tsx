/**
 * Skeletons that mirror the exact layout of the content they replace,
 * so nothing jumps while data loads.
 */

export function TreatCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-cream-300">
      <div className="skeleton aspect-[4/3] rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-3.5 w-1/2" />
          </div>
          <div className="skeleton h-7 w-14 rounded-full" />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="skeleton h-3.5 w-full" />
          <div className="skeleton h-3.5 w-5/6" />
        </div>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="skeleton h-3.5 w-28" />
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TreatGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="skeleton h-12 w-full max-w-sm rounded-full" />
        <div className="skeleton hidden h-4 w-28 sm:block" />
      </div>
      <div className="mt-6 flex gap-2">
        {[64, 90, 74, 96, 82].map((w, i) => (
          <div key={i} className="skeleton h-9 rounded-full" style={{ width: w }} />
        ))}
      </div>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <TreatCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ReviewCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-white p-7 ring-1 ring-cream-300">
      <div className="skeleton h-8 w-8" />
      <div className="mt-5 space-y-2.5">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-2/3" />
      </div>
      <div className="mt-6 flex items-center gap-3.5">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-24" />
          <div className="skeleton h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ReviewGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div>
      <div className="mx-auto max-w-xl">
        <div className="skeleton h-[104px] rounded-2xl" />
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function GalleryGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <div className="skeleton h-10 w-80" />
        <div className="skeleton hidden h-4 w-44 sm:block" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function GalleryCardSkeleton({ feature = false }: { feature?: boolean }) {
  return (
    <div
      className={`skeleton aspect-square rounded-2xl ${feature ? "col-span-2 row-span-2" : ""}`}
    />
  );
}

export function GalleryBentoSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div>
      <div className="skeleton h-4 w-24" />
      <div className="mt-6 grid grid-flow-dense grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <GalleryCardSkeleton key={i} feature={i % 7 === 0} />
        ))}
      </div>
    </div>
  );
}

export function TreatsLandingSkeleton() {
  return (
    <section className="px-5 pt-10 pb-24 md:px-10 lg:px-[8.5rem]">
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <div className="skeleton h-10 w-44" />
          <div className="skeleton h-4 w-96 max-w-full" />
        </div>
        <div className="skeleton hidden h-4 w-20 sm:block" />
      </div>
      <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-2.5 ring-1 ring-cream-300">
            <div className="skeleton aspect-[1/1.04] rounded-xl" />
            <div className="space-y-2 px-1.5 pt-3.5 pb-1.5">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function TestimonialsLandingSkeleton() {
  return (
    <section className="px-5 pt-8 pb-20 md:px-10 lg:px-[8.5rem]">
      <div className="flex items-end justify-between">
        <div className="skeleton h-10 w-96 max-w-full" />
        <div className="skeleton hidden h-4 w-32 sm:block" />
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <ReviewCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

/* Admin row skeletons live in components/admin/Skeletons.tsx — the single
   source the managers and admin loading pages import from. */
