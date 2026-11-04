"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center bg-cream-50 px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
        Something crumbled
      </h1>
      <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-stone-600">
        An unexpected error stopped this page. Trying again usually fixes it.
      </p>
      <button
        onClick={reset}
        className="mt-8 rounded-full bg-berry px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep"
      >
        Try again
      </button>
      {error.digest && (
        <p className="mt-6 text-[12px] text-stone-400">Reference: {error.digest}</p>
      )}
    </main>
  );
}
