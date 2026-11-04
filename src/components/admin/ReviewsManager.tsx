"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  LoaderCircle,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { showToast } from "./AdminShell";
import { SocialIcon } from "../site/ReviewCard";

interface Review {
  _id: string;
  name: string;
  rating: number;
  text: string;
  socialPlatform: string | null;
  socialUrl: string | null;
  avatar: string;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

interface FormState {
  _id: string | null;
  name: string;
  rating: number;
  text: string;
  socialPlatform: string;
  socialUrl: string;
  approved: boolean;
  featured: boolean;
}

const emptyForm: FormState = {
  _id: null,
  name: "",
  rating: 5,
  text: "",
  socialPlatform: "",
  socialUrl: "",
  approved: true,
  featured: false,
};

const PLATFORMS = ["", "Instagram", "WhatsApp", "Facebook", "Google", "Other"];

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Review | null>(null);

  const load = useCallback(async (f: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews${f !== "all" ? `?status=${f}` : ""}`);
      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch {
      showToast("Couldn't load reviews.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  async function toggleApproved(r: Review) {
    const res = await fetch(`/api/admin/reviews/${r._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approved: !r.approved }),
    });
    if (res.ok) {
      showToast(r.approved ? "Review hidden from the site." : "Review approved — it's live.");
      load(filter);
    } else {
      showToast("Couldn't update the review.", "error");
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim() || form.text.trim().length < 10)
      return showToast("Name and a 10+ character review are required.", "error");

    setSaving(true);
    try {
      const res = await fetch(
        form._id ? `/api/admin/reviews/${form._id}` : "/api/admin/reviews",
        {
          method: form._id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      showToast(form._id ? "Review updated." : "Review added.");
      setForm(null);
      load(filter);
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/reviews/${deleting._id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Review deleted.");
      setDeleting(null);
      load(filter);
    } else {
      showToast("Couldn't delete the review.", "error");
    }
  }

  const inputCls = "field-input";
  const labelCls = "field-label";

  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1.5 rounded-full bg-white p-1 shadow-xs ring-1 ring-cream-300 sm:w-fit">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors ${
                filter === t.key
                  ? "bg-berry text-white"
                  : "text-stone-500 hover:text-berry"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setForm({ ...emptyForm })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add review
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <Star className="h-7 w-7" strokeWidth={1.6} />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">
            No reviews here yet
          </h3>
          <p className="mt-1 max-w-xs text-[13px] text-stone-500">
            {filter === "pending"
              ? "Customer reviews land here first for approval."
              : "Reviews from the site and ones you add appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <article
              key={r._id}
              className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream-300"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-berry-soft font-display text-[16px] font-bold text-berry-deep">
                    {r.name.charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-ink">
                      {r.name}
                      <span className="flex items-center gap-px">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${
                              i < r.rating ? "fill-gold text-gold" : "text-cream-400"
                            }`}
                          />
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
                    <p className="mt-1 text-[13px] leading-relaxed text-stone-600">
                      {r.text}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-stone-500">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <SocialIcon platform={r.socialPlatform} url={r.socialUrl} />
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {!r.approved && (
                    <button
                      onClick={() => toggleApproved(r)}
                      aria-label="Approve review"
                      className="grid h-9 w-9 place-items-center rounded-full bg-success-soft text-success transition-colors hover:bg-success hover:text-white"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.2} />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      setForm({
                        _id: r._id,
                        name: r.name,
                        rating: r.rating,
                        text: r.text,
                        socialPlatform: r.socialPlatform ?? "",
                        socialUrl: r.socialUrl ?? "",
                        approved: r.approved,
                        featured: r.featured,
                      })
                    }
                    aria-label="Edit review"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry hover:text-white hover:ring-berry"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => setDeleting(r)}
                    aria-label="Delete review"
                    className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry-deep hover:text-white hover:ring-berry-deep"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* modal */}
      {form && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-ink">
                {form._id ? "Edit review" : "Add review"}
              </h3>
              <button
                onClick={() => setForm(null)}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={save} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
                <div>
                  <label className={labelCls}>Customer name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    maxLength={60}
                  />
                </div>
                <div>
                  <label className={labelCls}>Rating</label>
                  <div className="flex h-[42px] items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i} stars`}
                        onClick={() => setForm({ ...form, rating: i })}
                      >
                        <Star
                          className={`h-6 w-6 transition-colors ${
                            i <= form.rating
                              ? "fill-gold text-gold"
                              : "text-cream-400"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className={labelCls}>Review text *</label>
                <textarea
                  value={form.text}
                  onChange={(e) => setForm({ ...form, text: e.target.value })}
                  rows={4}
                  maxLength={600}
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Social platform</label>
                  <select
                    value={form.socialPlatform}
                    onChange={(e) => setForm({ ...form, socialPlatform: e.target.value })}
                    className={`${inputCls} appearance-none`}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p || "None"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Link</label>
                  <input
                    value={form.socialUrl}
                    onChange={(e) => setForm({ ...form, socialUrl: e.target.value })}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, approved: !form.approved })}
                  className={`flex-1 rounded-xl border py-2.5 text-[13px] font-medium transition-colors ${
                    form.approved
                      ? "border-success/40 bg-success-soft text-success"
                      : "border-cream-300 bg-white text-stone-400"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Check className="h-4 w-4" strokeWidth={2} />
                    {form.approved ? "Approved — live" : "Hidden"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  className={`flex-1 rounded-xl border py-2.5 text-[13px] font-medium transition-colors ${
                    form.featured
                      ? "border-gold-ink/40 bg-gold-soft text-gold-ink"
                      : "border-cream-300 bg-white text-stone-400"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Star className={`h-4 w-4 ${form.featured ? "fill-gold-ink" : ""}`} strokeWidth={1.8} />
                    {form.featured ? "On homepage" : "Not featured"}
                  </span>
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-berry px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep disabled:opacity-60"
                >
                  {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {saving ? "Saving…" : "Save review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-berry-deep">
              <Trash2 className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">
              Delete this review?
            </h3>
            <p className="mt-1.5 text-[13px] text-stone-500">
              {deleting.name}&rsquo;s review will be removed permanently.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="btn-ghost"
              >
                Keep it
              </button>
              <button
                onClick={remove}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
