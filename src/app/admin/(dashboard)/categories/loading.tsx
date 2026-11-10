export default function LoadingAdminCategories() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="skeleton h-4 w-24" />
        <div className="skeleton h-11 w-36 rounded-full" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-[76px] rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
