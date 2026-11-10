"use client";

import { TriangleAlert } from "lucide-react";

/** Shared "couldn't load" state with a retry button for admin managers. */
export default function LoadError({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
        <TriangleAlert className="h-7 w-7" strokeWidth={1.8} />
      </span>
      <p className="mt-4 text-[14px] text-stone-600">{label}</p>
      <button type="button" onClick={onRetry} className="btn-ghost mt-4">
        Try again
      </button>
    </div>
  );
}
