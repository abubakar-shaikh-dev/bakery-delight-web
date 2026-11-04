import { ReviewRowSkeleton } from "@/components/admin/Skeletons";

export default function LoadingAdminReviews() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-10 w-52 rounded-full" />
        <div className="skeleton h-11 w-32 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <ReviewRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
