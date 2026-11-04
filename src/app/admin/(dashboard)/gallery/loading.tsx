export default function LoadingAdminGallery() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-44 rounded-2xl" />
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
