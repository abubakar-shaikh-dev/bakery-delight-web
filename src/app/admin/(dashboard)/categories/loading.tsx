export default function LoadingAdminCategories() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-40 rounded-2xl" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-16 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
