export default function LoadingAdminSettings() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="admin-card">
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
