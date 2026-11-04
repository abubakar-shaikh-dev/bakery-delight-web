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
  const [q, setQ] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<Treat | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/treats${query ? `?q=${encodeURIComponent(query)}` : ""}`);
      const data = await res.json();
      setTreats(data.treats ?? []);
    } catch {
      showToast("Couldn't load treats.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load("");
    (async () => {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        setCategories((data.categories ?? []).map((c: { name: string }) => c.name));
      } catch {
        /* form falls back to free text */
      }
    })();
  }, [load]);

  function onSearch(v: string) {
    setQ(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => load(v.trim()), 350);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim()) return showToast("Give the treat a name.", "error");

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        category: form.category || "Cakes",
        tagline: form.tagline,
        description: form.description,
        price: form.price === "" ? null : Math.max(0, Number(form.price)),
        image: form.image,
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
      setForm(null);
      load(q.trim());
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/treats/${deleting._id}`, { method: "DELETE" });
    if (res.ok) {
      showToast(`"${deleting.name}" removed from the menu.`);
      setDeleting(null);
      load(q.trim());
    } else {
      showToast("Couldn't remove the treat.", "error");
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
            className="w-full rounded-full border border-cream-300 bg-white py-2.5 pl-11 pr-4 text-[13px] outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-berry/50 focus:ring-4 focus:ring-berry/10"
          />
        </div>
        <button
          onClick={() => setForm({ ...emptyForm })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Add treat
        </button>
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : treats.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <CakeSlice className="h-7 w-7" strokeWidth={1.6} />
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
                  <Image src={t.image} alt={t.name} fill sizes="72px" className="object-cover" />
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
                  onClick={() =>
                    setForm({
                      _id: t._id,
                      name: t.name,
                      category: t.category,
                      tagline: t.tagline,
                      description: t.description,
                      price: t.price === null ? "" : String(t.price),
                      image: t.image,
                      featured: t.featured,
                    })
                  }
                  aria-label={`Edit ${t.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry hover:text-white hover:ring-berry"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.8} />
                </button>
                <button
                  onClick={() => setDeleting(t)}
                  aria-label={`Delete ${t.name}`}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-stone-500 ring-1 ring-cream-300 transition-colors hover:bg-berry-deep hover:text-white hover:ring-berry-deep"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* add / edit modal */}
      {form && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-2xl font-bold text-ink">
                {form._id ? "Edit treat" : "New treat"}
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Strawberry Cream Cake"
                    className={inputCls}
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className={labelCls}>Category</label>
                  {categories.length > 0 ? (
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className={`${inputCls} appearance-none`}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="Cakes"
                      className={inputCls}
                      maxLength={40}
                    />
                  )}
                  <p className="mt-1 text-[12px] text-stone-500">
                    Add new ones under Categories in the sidebar.
                  </p>
                </div>
              </div>

              <div>
                <label className={labelCls}>Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="For every celebration"
                  className={inputCls}
                  maxLength={80}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
                <div>
                  <label className={labelCls}>Price (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="699"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Featured</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, featured: !form.featured })}
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
                <label className={labelCls}>Description</label>
                <textarea
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
                onUploaded={(url) => setForm((f) => (f ? { ...f, image: url } : f))}
              />

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
                  {saving ? "Saving…" : form._id ? "Save changes" : "Add to menu"}
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
              Remove “{deleting.name}”?
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">
              It will disappear from the public menu immediately. This can&rsquo;t be
              undone.
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
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
