"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Star } from "lucide-react";
import { showToast } from "@/components/admin/AdminShell";

export default function RecentReviews({
  reviews,
}: {
  reviews: { _id: string; name: string; rating: number; text: string; approved: boolean }[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function approve(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: true }),
      });
      if (!res.ok) throw new Error();
      showToast("Review approved — it's live on the site.");
      router.refresh();
    } catch {
      showToast("Couldn't approve the review.", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (reviews.length === 0) {
    return (
      <p className="flex items-center gap-3 py-6 text-[13px] text-stone-500">
        <Clock className="h-4 w-4" strokeWidth={1.8} />
        No reviews yet — happy customers will fill this space.
      </p>
    );
  }

  return (
    <ul className="mt-4 divide-y divide-cream-300">
      {reviews.map((r) => (
        <li key={r._id} className="flex items-start gap-3 py-3.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-berry-soft font-display text-[15px] font-bold text-berry-deep">
            {r.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              {r.name}
              <span className="flex items-center gap-px text-gold" aria-label={`${r.rating} stars`}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-gold" />
                ))}
              </span>
              {r.approved ? (
                <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] font-semibold text-success">
                  Live
                </span>
              ) : (
                <span className="rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold-ink">
                  Pending
                </span>
              )}
            </p>
            <p className="mt-0.5 line-clamp-1 text-[13px] text-stone-600">{r.text}</p>
          </div>
          {!r.approved && (
            <button
              onClick={() => approve(r._id)}
              disabled={busyId === r._id}
              aria-label={`Approve review by ${r.name}`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-success-soft text-success transition-colors hover:bg-success hover:text-white disabled:opacity-50"
            >
              <Check className="h-4 w-4" strokeWidth={2.2} />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
