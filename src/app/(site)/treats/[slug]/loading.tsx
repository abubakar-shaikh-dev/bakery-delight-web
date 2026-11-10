import { ReviewCardSkeleton, TreatCardSkeleton } from "@/components/site/Skeletons";

export default function Loading() {
  return (
    <main className="bg-cream-50">
      <div className="px-5 pt-6 sm:px-10 lg:px-[8.5rem]">
        <div className="skeleton h-3 w-52" />
      </div>

      <section className="px-5 pt-8 pb-16 sm:px-10 lg:px-[8.5rem]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-14">
          <div className="skeleton aspect-[4/3] rounded-2xl sm:aspect-[4/5]" />
          <div className="flex flex-col gap-4">
            <div className="skeleton h-6 w-24" />
            <div className="skeleton h-12 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-10 w-44" />
            <div className="skeleton h-[52px] w-64 rounded-full" />
            <div className="skeleton h-24 w-full max-w-xl" />
            <div className="skeleton h-[104px] w-full max-w-md rounded-2xl" />
          </div>
        </div>
      </section>

      {/* reviews */}
      <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="skeleton h-9 w-56" />
          <div className="skeleton h-4 w-24" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* related treats */}
      <section className="px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="skeleton h-9 w-64" />
          <div className="skeleton h-4 w-20" />
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <TreatCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
