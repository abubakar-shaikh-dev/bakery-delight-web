"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  LoaderCircle,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { AdminDrawer, ConfirmDrawer } from "./Drawer";
import LoadError from "./LoadError";
import { ReviewRowSkeleton } from "./Skeletons";
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
  treatSlug?: string | null;
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
  treatSlug: string;
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
  treatSlug: "",
};

const PLATFORMS = ["", "Instagram", "WhatsApp", "Facebook", "Google", "Other"];

export default function ReviewsManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [treats, setTreats] = useState<Array<{ name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [form, setForm] = useState<FormState | null>(null);
  const [baseline, setBaseline] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Review | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; text?: string }>({});
  const reqId = useRef(0);

  const openForm = (f: FormState) => {
    setForm(f);
    setBaseline(f);
    setErrors({});
  };

  const closeForm = useCallback(() => {
    setForm(null);
    setBaseline(null);
    setErrors({});
  }, []);

  const requestClose = useCallback(() => {
    if (
      form !== null &&
      baseline !== null &&
      JSON.stringify(form) !== JSON.stringify(baseline)
    ) {
      setDiscardOpen(true);
    } else {
      closeForm();
    }
  }, [form, baseline, closeForm]);

  const load = useCallback(async (f: string) => {
    const id = ++reqId.current;
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(`/api/admin/reviews?limit=200${f !== "all" ? `&status=${f}` : ""}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (id !== reqId.current) return;
      setReviews(data.reviews ?? []);
    } catch {
      if (id === reqId.current) {
        setLoadError(true);
        showToast("Couldn't load reviews.", "error");
      }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
    // For the "Linked treat" select — names only, best-effort.
    (async () => {
      try {
        const res = await fetch("/api/admin/treats?limit=200");
        if (!res.ok) return;
        const data = await res.json();
        setTreats(
          (data.treats ?? []).map((t: { name: string; slug: string }) => ({
            name: t.name,
            slug: t.slug,
          })),
        );
      } catch {
        /* the select simply lists no treats */
      }
    })();
  }, [filter, load]);

  const treatName = (slug: string | null | undefined) =>
    (treats.find((t) => t.slug === slug)?.name ?? slug) || null;

  async function toggleApproved(r: Review) {
    if (busyId) return;
    setBusyId(r._id);
    try {
      const res = await fetch(`/api/admin/reviews/${r._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !r.approved }),
      });
      if (!res.ok) throw new Error("Couldn't update the review.");
      showToast(r.approved ? "Review hidden from the site." : "Review approved — it's live.");
      load(filter);
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const next: { name?: string; text?: string } = {};
    if (!form.name.trim()) next.name = "Who wrote this? A name is needed.";
    if (form.text.trim().length < 10)
      next.text = "The review should be at least 10 characters.";
    if (next.name || next.text) {
      setErrors(next);
      (document.getElementById(next.name ? "review-name" : "review-text") as HTMLInputElement | null)
        ?.focus();
      return;
    }
    setErrors({});

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
      closeForm();
      load(filter);
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting || busyId === deleting._id) return;
    setBusyId(deleting._id);
    try {
      const res = await fetch(`/api/admin/reviews/${deleting._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Couldn't delete the review.");
      showToast("Review deleted.");
      setDeleting(null);
      load(filter);
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setBusyId(null);
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
              aria-pressed={filter === t.key}
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
          onClick={() => openForm({ ...emptyForm })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add review
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <ReviewRowSkeleton key={i} />
          ))}
        </div>
      ) : loadError ? (
        <LoadError label="The reviews couldn't be loaded." onRetry={() => load(filter)} />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <Star className="h-7 w-7" strokeWidth={1.8} />
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
                      {r.treatSlug && (
                        <span className="rounded-full bg-berry-soft px-2 py-0.5 text-[11px] font-semibold text-berry-deep">
                          {treatName(r.treatSlug)}
                        </span>
                      )}
                      <SocialIcon platform={r.socialPlatform} url={r.socialUrl} />
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {!r.approved && (
                    <button
                      onClick={() => toggleApproved(r)}
                      disabled={busyId === r._id}
                      aria-label="Approve review"
                      className="grid h-10 w-10 place-items-center rounded-full bg-success-soft text-success transition-colors hover:bg-success hover:text-white disabled:opacity-60"
                    >
                      {busyId === r._id ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" strokeWidth={2} />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() =>
                      openForm({
                        _id: r._id,
                        name: r.name,
                        rating: r.rating,
                        text: r.text,
                        socialPlatform: r.socialPlatform ?? "",
                        socialUrl: r.socialUrl ?? "",
                        approved: r.approved,
                        featured: r.featured,
                        treatSlug: r.treatSlug ?? "",
                      })
                    }
                    aria-label="Edit review"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry hover:text-white hover:ring-berry"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => setDeleting(r)}
                    aria-label="Delete review"
                    className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry-deep hover:text-white hover:ring-berry-deep"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* add / edit drawer */}
      <AdminDrawer
        open={form !== null}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
        onCloseRequest={requestClose}
        title={form?._id ? "Edit review" : "Add review"}
        dismissible={false}
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_130px]">
              <div>
                <label className={labelCls} htmlFor="review-name">
                  Customer name *
                </label>
                <input
                  id="review-name"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  className={`${inputCls} ${errors.name ? "border-danger/60 focus:border-danger/60 focus:ring-danger/10" : ""}`}
                  maxLength={60}
                  autoFocus
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="field-invalid" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <span className={labelCls} id="review-rating-label">
                  Rating
                </span>
                <div
                  role="radiogroup"
                  aria-labelledby="review-rating-label"
                  className="flex h-[42px] items-center gap-1"
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={i === form.rating}
                      aria-label={`${i} star${i === 1 ? "" : "s"}`}
                      onClick={() => setForm({ ...form, rating: i })}
                      className="grid h-8 w-8 place-items-center rounded-full"
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
              <div className="flex items-baseline justify-between">
                <label className={labelCls} htmlFor="review-text">
                  Review text *
                </label>
                <span className="text-[11px] text-stone-400 tabular-nums">
                  {form.text.length}/600
                </span>
              </div>
              <textarea
                id="review-text"
                value={form.text}
                onChange={(e) => {
                  setForm({ ...form, text: e.target.value });
                  if (errors.text) setErrors((p) => ({ ...p, text: undefined }));
                }}
                rows={4}
                maxLength={600}
                className={`${inputCls} resize-none ${errors.text ? "border-danger/60 focus:border-danger/60 focus:ring-danger/10" : ""}`}
                aria-invalid={Boolean(errors.text)}
              />
              {errors.text && (
                <p className="field-invalid" role="alert">
                  {errors.text}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="review-platform">
                  Social platform
                </label>
                <select
                  id="review-platform"
                  value={form.socialPlatform}
                  onChange={(e) => setForm({ ...form, socialPlatform: e.target.value })}
                  className={`${inputCls} select-field`}
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p || "None"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls} htmlFor="review-url">
                  Link
                </label>
                <input
                  id="review-url"
                  type="url"
                  value={form.socialUrl}
                  onChange={(e) => setForm({ ...form, socialUrl: e.target.value })}
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="review-treat">
                Linked treat
              </label>
              <select
                id="review-treat"
                value={form.treatSlug}
                onChange={(e) => setForm({ ...form, treatSlug: e.target.value })}
                className={`${inputCls} select-field`}
              >
                <option value="">None — reviews page only</option>
                {treats.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="field-hint">
                Linked reviews also show on that treat&rsquo;s page.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, approved: !form.approved })}
                aria-pressed={form.approved}
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
                aria-pressed={form.featured}
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
              <button type="button" onClick={requestClose} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : "Save review"}
              </button>
            </div>
          </form>
        )}
      </AdminDrawer>

      {/* delete confirm */}
      <ConfirmDrawer
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Delete this review?"
        body={
          deleting ? (
            <>
              {deleting.name}&rsquo;s review will be removed permanently.
            </>
          ) : (
            ""
          )
        }
        confirmLabel="Delete"
        busy={deleting !== null && busyId === deleting._id}
        onConfirm={remove}
      />

      {/* discard unsaved edits */}
      <ConfirmDrawer
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard changes?"
        tone="discard"
        body="This review hasn't been saved — closing now loses your edits."
        confirmLabel="Discard"
        onConfirm={() => {
          setDiscardOpen(false);
          closeForm();
        }}
      />
    </div>
  );
}
