import { MessageRowSkeleton } from "@/components/admin/Skeletons";

export default function LoadingAdminMessages() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-10 w-44 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <MessageRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
