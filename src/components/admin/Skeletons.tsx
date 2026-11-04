/**
 * Admin row skeletons — mirror the exact layout of manager list rows.
 */

export function TreatRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-3.5 ring-1 ring-cream-300">
      <div className="skeleton h-16 w-16 shrink-0 rounded-xl sm:h-[72px] sm:w-[72px]" />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-4 w-16 rounded-full" />
        </div>
        <div className="skeleton h-3 w-48" />
      </div>
      <div className="flex gap-2">
        <div className="skeleton h-9 w-9 rounded-full" />
        <div className="skeleton h-9 w-9 rounded-full" />
      </div>
    </div>
  );
}

export function ReviewRowSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-cream-300">
      <div className="flex items-start gap-3">
        <div className="skeleton h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="skeleton h-4 w-28" />
            <div className="skeleton h-3.5 w-20" />
          </div>
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-2/3" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="skeleton h-9 w-9 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function MessageRowSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-cream-300">
      <div className="flex items-start gap-4">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-12 rounded-full" />
          </div>
          <div className="skeleton h-3 w-3/4" />
        </div>
        <div className="skeleton h-3 w-10" />
      </div>
    </div>
  );
}
