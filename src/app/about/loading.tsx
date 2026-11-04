import PageHeader from "@/components/site/PageHeader";

export default function LoadingAbout() {
  return (
    <>
      <PageHeader
        eyebrow="A little about us"
        title="A Home Kitchen,"
        accent="With Big Dreams"
        subtitle="Bakery Delight started from a simple idea — to spread happiness through homemade cakes, baked one order at a time."
        crumb="About"
      />

      <main className="bg-cream-50">
        {/* story */}
        <section className="px-5 pt-14 pb-8 sm:px-10 lg:px-[8.5rem]">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
            <div className="relative mx-auto w-full max-w-[440px]">
              <div className="skeleton aspect-[680/760] w-full" />
            </div>
            <div className="space-y-4">
              <div className="skeleton h-10 w-4/5" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-11/12" />
              <div className="skeleton h-4 w-3/5" />
              <div className="skeleton h-11 w-40 rounded-full" />
            </div>
          </div>
        </section>

        {/* values */}
        <section className="px-5 py-16 sm:px-10 lg:px-[8.5rem]">
          <div className="mx-auto max-w-xs space-y-2 text-center">
            <div className="skeleton mx-auto h-4 w-40" />
            <div className="skeleton mx-auto h-8 w-64" />
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-44 rounded-2xl" />
            ))}
          </div>
        </section>

        {/* stats band */}
        <section className="px-5 pb-8 sm:px-10 lg:px-[8.5rem]">
          <div className="grid gap-5 rounded-2xl bg-blush-200 px-6 py-10 text-center sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mx-auto w-32 space-y-2">
                <div className="skeleton mx-auto h-10 w-20" />
                <div className="skeleton mx-auto h-3.5 w-24" />
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
