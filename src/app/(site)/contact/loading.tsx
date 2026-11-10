import PageHeader from "@/components/site/PageHeader";

export default function LoadingContact() {
  return (
    <>
      <PageHeader
        eyebrow="We'd love to hear from you"
        title="Get in"
        accent="Touch"
        subtitle="Order a cake, plan a celebration or just say hello — pick whichever way feels easiest."
        crumb="Contact"
      />
      <section className="bg-cream-50 px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="space-y-5">
            <div className="skeleton h-[122px] rounded-2xl" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="skeleton h-[86px] rounded-2xl" />
              <div className="skeleton h-[86px] rounded-2xl" />
            </div>
            <div className="skeleton h-[110px] rounded-2xl" />
            <div className="skeleton h-[92px] rounded-2xl" />
          </div>
          <div className="skeleton h-[560px] rounded-2xl" />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream-50 px-5 pb-24 sm:px-10 lg:px-[8.5rem]">
        <div className="text-center">
          <div className="skeleton mx-auto h-5 w-40" />
          <div className="skeleton mx-auto mt-2 h-9 w-56" />
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      </section>
    </>
  );
}
