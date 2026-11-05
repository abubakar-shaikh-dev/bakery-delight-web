"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CakeSlice,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";
import ImageUploader from "./ImageUploader";
import { AdminDrawer, ConfirmDrawer } from "./Drawer";
import LoadError from "./LoadError";
import { TreatRowSkeleton } from "./Skeletons";
import { showToast } from "./AdminShell";

interface Treat {
  _id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  price: number | null;
  image: string;
  cloudinaryPublicId?: string | null;
  featured: boolean;
}

interface FormState {
  _id: string | null;
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: string;
  image: string;
  featured: boolean;
}

const emptyForm: FormState = {
  _id: null,
  name: "",
  category: "",
  tagline: "",
  description: "",
  price: "",
  image: "",
  featured: false,
};

export default function TreatsManager() {
  const [treats, setTreats] = useState<Treat[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [q, setQ] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [baseline, setBaseline] = useState<FormState | null>(null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Treat | null>(null);
  const [removing, setRemoving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
    setImagePublicId(null);
  }, []);

  /* Unsaved work: every drawer exit routes through the discard check. */
  const dirty =
    form !== null &&
    baseline !== null &&
    JSON.stringify(form) !== JSON.stringify(baseline);

  const requestClose = useCallback(() => {
    if (dirty) setDiscardOpen(true);
    else closeForm();
  }, [dirty, closeForm]);

  const load = useCallback(async (query: string) => {
    const id = ++reqId.current;
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch(
        `/api/admin/treats?limit=200${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      );
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (id !== reqId.current) return;
      setTreats(data.treats ?? []);
    } catch {
      if (id === reqId.current) {
        setLoadError(true);
        showToast("Couldn't load treats.", "error");
      }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load("");
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        if (!res.ok) return;
        const data = await res.json();
        setCategories((data.categories ?? []).map((c: { name: string }) => c.name));
      } catch {
        /* form falls back to free text */
      }
    })();
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [load]);

  function onSearch(v: string) {
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(v.trim()), 350);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const next: { name?: string; price?: string } = {};
    if (!form.name.trim()) next.name = "Give the treat a name.";
    if (form.price !== "") {
      const n = Number(form.price);
      if (Number.isNaN(n)) next.price = "Price should be a number.";
      else if (n < 0) next.price = "Price can't be negative.";
    }
    if (next.name || next.price) {
      setErrors(next);
      (document.getElementById(next.name ? "treat-name" : "treat-price") as HTMLInputElement | null)
        ?.focus();
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category || "Cakes",
        tagline: form.tagline,
        description: form.description,
        price: form.price === "" ? null : Math.max(0, Number(form.price)),
        image: form.image,
        cloudinaryPublicId: imagePublicId,
        featured: form.featured,
      };
      const res = await fetch(
        form._id ? `/api/admin/treats/${form._id}` : "/api/admin/treats",
        {
          method: form._id ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      showToast(form._id ? "Treat updated." : "Treat added to the menu.");
      closeForm();
      load(q.trim());
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting || removing) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/treats/${deleting._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Couldn't remove the treat.");
      showToast(`"${deleting.name}" removed from the menu.`);
      setDeleting(null);
      load(q.trim());
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setRemoving(false);
    }
  }

  const inputCls = "field-input";
  const labelCls = "field-label";

  return (
    <div className="space-y-5">
      {/* toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" strokeWidth={1.8} />
          <input
            value={q}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search treats…"
            className="w-full rounded-full border border-cream-300 bg-white py-2.5 pl-11 pr-10 text-[13px] outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-berry/50 focus:ring-4 focus:ring-berry/10"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQ("");
                if (timer.current) clearTimeout(timer.current);
                load("");
              }}
              className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
        <button
          onClick={() => openForm({ ...emptyForm })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add treat
        </button>
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <TreatRowSkeleton key={i} />
          ))}
        </div>
      ) : loadError ? (
        <LoadError label="The treats list couldn't be loaded." onRetry={() => load(q.trim())} />
      ) : treats.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <CakeSlice className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">
            {q ? "No treats match that search" : "The menu is empty"}
          </h3>
          <p className="mt-1 max-w-xs text-[13px] text-stone-500">
            {q ? "Try different words or clear the search." : "Add your first treat to fill the website menu."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {treats.map((t) => (
            <article
              key={t._id}
              className="flex items-center gap-4 rounded-2xl bg-white p-3.5 shadow-xs ring-1 ring-cream-300 transition-shadow hover:shadow-md"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-berry-soft sm:h-[72px] sm:w-[72px]">
                {t.image ? (
                  <Image src={t.image} alt={t.name} fill sizes="(min-width:640px) 72px, 64px" className="object-cover" />
                ) : (
                  <span className="grid h-full place-items-center font-display text-2xl font-bold text-berry-deep">
                    {t.name.charAt(0)}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-[14px] font-semibold text-ink">{t.name}</h3>
                  <span className="rounded-full bg-berry-soft px-2 py-0.5 text-[11px] font-semibold text-berry-deep">
                    {t.category}
                  </span>
                  {t.featured && (
                    <span className="flex items-center gap-1 rounded-full bg-gold-soft px-2 py-0.5 text-[11px] font-semibold text-gold-ink">
                      <Star className="h-3 w-3 fill-gold-ink" />
                      Featured
                    </span>
                  )}
                </div>
                <p className="mt-0.5 line-clamp-2 text-[13px] text-stone-500 sm:truncate">
                  {t.tagline || "—"}
                  {t.price !== null && ` · ₹${t.price}+`}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => {
                    openForm({
                      _id: t._id,
                      name: t.name,
                      category: t.category,
                      tagline: t.tagline,
                      description: t.description,
                      price: t.price === null ? "" : String(t.price),
                      image: t.image,
                      featured: t.featured,
                    });
                    setImagePublicId(t.cloudinaryPublicId ?? null);
                  }}
                  aria-label={`Edit ${t.name}`}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry hover:text-white hover:ring-berry"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => setDeleting(t)}
                  aria-label={`Delete ${t.name}`}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry-deep hover:text-white hover:ring-berry-deep"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
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
        title={form?._id ? "Edit treat" : "New treat"}
        dismissible={false}
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls} htmlFor="treat-name">
                  Name *
                </label>
                <input
                  id="treat-name"
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  placeholder="Strawberry Cream Cake"
                  className={`${inputCls} ${errors.name ? "border-danger/60 focus:border-danger/60 focus:ring-danger/10" : ""}`}
                  maxLength={80}
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
                <label className={labelCls} htmlFor="treat-category">
                  Category
                </label>
                {categories.length > 0 ? (
                  <select
                    id="treat-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={`${inputCls} select-field`}
                  >
                    <option value="" disabled>
                      Choose a category…
                    </option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="treat-category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Cakes"
                    className={inputCls}
                    maxLength={40}
                  />
                )}
                <p className="field-hint">Add new ones under Categories in the sidebar.</p>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="treat-tagline">
                Tagline
              </label>
              <input
                id="treat-tagline"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="For every celebration"
                className={inputCls}
                maxLength={80}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
              <div>
                <label className={labelCls} htmlFor="treat-price">
                  Price
                </label>
                <div className="relative">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-stone-400"
                  >
                    ₹
                  </span>
                  <input
                    id="treat-price"
                    type="number"
                    min={0}
                    step="1"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(e) => {
                      setForm({ ...form, price: e.target.value });
                      if (errors.price) setErrors((p) => ({ ...p, price: undefined }));
                    }}
                    placeholder="699"
                    className={`${inputCls} pl-9 ${errors.price ? "border-danger/60 focus:border-danger/60 focus:ring-danger/10" : ""}`}
                    aria-invalid={Boolean(errors.price)}
                  />
                </div>
                {errors.price && (
                  <p className="field-invalid" role="alert">
                    {errors.price}
                  </p>
                )}
              </div>
              <div>
                <span className={labelCls}>Featured</span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, featured: !form.featured })}
                  aria-pressed={form.featured}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-[13px] font-medium transition-colors ${
                    form.featured
                      ? "border-gold-ink bg-gold-soft text-gold-ink"
                      : "border-cream-300 bg-white text-stone-400 hover:text-stone-600"
                  }`}
                >
                  <Star
                    className={`h-4 w-4 ${form.featured ? "fill-gold-ink" : ""}`}
                    strokeWidth={1.8}
                  />
                  {form.featured ? "On homepage" : "Not featured"}
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between">
                <label className={labelCls} htmlFor="treat-description">
                  Description
                </label>
                <span className="text-[11px] text-stone-400 tabular-nums">
                  {form.description.length}/1200
                </span>
              </div>
              <textarea
                id="treat-description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="A short, delicious description…"
                rows={3}
                maxLength={1200}
                className={`${inputCls} resize-none`}
              />
            </div>

            <ImageUploader
              key={form._id ?? "new-treat"}
              aspect={4 / 3}
              label="Treat photo"
              hint="Cropped to 4:3 — shown on the treats page"
              initialUrl={form.image}
              onUploaded={(url, publicId) => {
                setForm((f) => (f ? { ...f, image: url } : f));
                setImagePublicId(publicId ?? null);
              }}
            />

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={requestClose} className="btn-ghost">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {saving ? "Saving…" : form._id ? "Save changes" : "Add to menu"}
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
        title={deleting ? `Remove “${deleting.name}”?` : ""}
        body={
          <>
            It will disappear from the public menu immediately. This can&rsquo;t be
            undone.
          </>
        }
        busy={removing}
        onConfirm={remove}
      />

      {/* discard unsaved edits */}
      <ConfirmDrawer
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard changes?"
        tone="discard"
        body="This treat hasn't been saved — closing now loses your edits."
        confirmLabel="Discard"
        onConfirm={closeForm}
      />
    </div>
  );
}
