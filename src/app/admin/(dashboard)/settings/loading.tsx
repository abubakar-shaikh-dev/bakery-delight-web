export default function LoadingAdminSettings() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl bg-white p-6 ring-1 ring-cream-300">
          <div className="skeleton h-5 w-40" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="skeleton h-11" />
            <div className="skeleton h-11" />
          </div>
        </div>
      ))}
    </div>
  );
}
