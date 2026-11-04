"use client";

/** Shared "couldn't load" state with a retry button for admin managers. */
export default function LoadError({
  label,
  onRetry,
}: {
  label: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white py-14 text-center ring-1 ring-cream-300">
      <p className="text-[14px] text-stone-600">{label}</p>
      <button type="button" onClick={onRetry} className="btn-ghost mt-4">
        Try again
      </button>
    </div>
  );
}
