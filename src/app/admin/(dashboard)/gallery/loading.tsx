export default function LoadingAdminGallery() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-11 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl bg-white ring-1 ring-cream-300">
            <div className="skeleton aspect-square rounded-none" />
            <div className="p-3">
              <div className="skeleton h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
