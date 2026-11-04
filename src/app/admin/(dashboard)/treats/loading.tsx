import { TreatRowSkeleton } from "@/components/admin/Skeletons";

export default function LoadingAdminTreats() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-11 w-full max-w-xs rounded-full" />
        <div className="skeleton h-11 w-32 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <TreatRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
