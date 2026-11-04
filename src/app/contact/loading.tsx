export default function LoadingContact() {
  return (
    <div className="bg-cream-50">
      <div className="border-b border-cream-300 bg-cream-100 px-5 py-5 sm:px-10 lg:px-[8.5rem]">
        <div className="skeleton h-10 w-40" />
      </div>
      <div className="px-5 pb-16 pt-14 sm:px-10 lg:px-[8.5rem]">
        <div className="mx-auto max-w-xl space-y-3 text-center">
          <div className="skeleton mx-auto h-4 w-56" />
          <div className="skeleton mx-auto h-14 w-80" />
          <div className="skeleton mx-auto h-4 w-full max-w-md" />
        </div>
        <div className="mt-14 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
          <div className="space-y-5">
            <div className="skeleton h-32 rounded-2xl" />
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="skeleton h-24 rounded-2xl" />
              <div className="skeleton h-24 rounded-2xl" />
            </div>
            <div className="skeleton h-28 rounded-2xl" />
          </div>
          <div className="skeleton h-[520px] rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
