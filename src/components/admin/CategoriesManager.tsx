"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { CATEGORY_ICONS, CategoryGlyph } from "../CategoryIcon";
import { AdminDrawer, ConfirmDrawer } from "./Drawer";
import LoadError from "./LoadError";
import { showToast } from "./AdminShell";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

interface FormState {
  _id: string | null;
  name: string;
  icon: string;
}

const emptyForm: FormState = { _id: null, name: "", icon: "sparkles" };

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [baseline, setBaseline] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/admin/categories");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(data.categories ?? []);
    } catch {
      setLoadError(true);
      showToast("Couldn't load categories.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  /* Unsaved work: every drawer exit routes through the discard check. */
  const dirty =
    form !== null &&
    baseline !== null &&
    JSON.stringify(form) !== JSON.stringify(baseline);

  const requestClose = useCallback(() => {
    if (dirty) setDiscardOpen(true);
    else closeForm();
  }, [dirty, closeForm]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.name.trim()) {
      setErrors({ name: "Give the category a name." });
      document.getElementById("cat-name")?.focus();
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const res = await fetch(
        form._id ? `/api/admin/categories/${form._id}` : "/api/admin/categories",
        {
          method: form._id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, icon: form.icon }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      showToast(form._id ? "Category updated." : `"${data.category.name}" added.`);
      closeForm();
      load();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function move(category: Category, dir: -1 | 1) {
    const idx = categories.findIndex((c) => c._id === category._id);
    const swap = categories[idx + dir];
    if (!swap) return;
    setBusyId(category._id);
    try {
      const results = await Promise.all([
        fetch(`/api/admin/categories/${category._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: swap.order }),
        }),
        fetch(`/api/admin/categories/${swap._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: category.order }),
        }),
      ]);
      if (!results.every((r) => r.ok)) throw new Error("Couldn't move the category.");
      load();
    } catch (err) {
      showToast((err as Error).message, "error");
      load();
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!deleting) return;
    setBusyId(deleting._id);
    try {
      const res = await fetch(`/api/admin/categories/${deleting._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed.");
      showToast(`"${deleting.name}" deleted.`);
      setDeleting(null);
      load();
    } catch (err) {
      showToast((err as Error).message, "error");
      setDeleting(null);
    } finally {
      setBusyId(null);
    }
  }

  const iconPicker = (value: string, onChange: (v: string) => void) => (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_ICONS.map((i) => (
        <button
          key={i.key}
          type="button"
          title={i.label}
          aria-label={i.label}
          aria-pressed={value === i.key}
          onClick={() => onChange(i.key)}
          className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
            value === i.key
              ? "border-berry/40 bg-berry-soft text-berry-deep"
              : "border-cream-300 bg-white text-stone-400 hover:border-berry/40 hover:text-stone-600"
          }`}
        >
          <i.Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* toolbar — same shape as the other managers */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-stone-600 tabular-nums">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"}
        </p>
        <button
          onClick={() => openForm({ ...emptyForm })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add category
        </button>
      </div>

      {/* list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-2xl" />
          ))}
        </div>
      ) : loadError ? (
        <LoadError label="The categories couldn't be loaded." onRetry={load} />
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <h3 className="font-display text-xl font-bold text-ink">
            No categories yet
          </h3>
          <p className="mt-1 max-w-xs text-[13px] text-stone-600">
            Add your first one — it appears instantly as a filter on the treats page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c, idx) => (
            <article
              key={c._id}
              className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-cream-300"
            >
              <div className="flex items-center gap-2 sm:gap-3.5">
                <div className="flex shrink-0 flex-col">
                  <button
                    onClick={() => move(c, -1)}
                    disabled={idx === 0 || busyId === c._id}
                    aria-label={`Move ${c.name} up`}
                    className="grid h-7 w-8 place-items-center rounded text-stone-300 transition-colors hover:text-berry disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => move(c, 1)}
                    disabled={idx === categories.length - 1 || busyId === c._id}
                    aria-label={`Move ${c.name} down`}
                    className="grid h-7 w-8 place-items-center rounded text-stone-300 transition-colors hover:text-berry disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-berry-soft text-berry-deep">
                  <CategoryGlyph icon={c.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">{c.name}</p>
                  <p className="text-[12px] text-stone-400">/{c.slug}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => openForm({ _id: c._id, name: c.name, icon: c.icon })}
                    aria-label={`Edit ${c.name}`}
                    className="icon-btn hover:text-berry hover:ring-berry/40"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={() => setDeleting(c)}
                    aria-label={`Delete ${c.name}`}
                    className="icon-btn hover:bg-berry-deep hover:text-white hover:ring-berry-deep"
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
        title={form?._id ? "Edit category" : "New category"}
        dismissible={false}
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="cat-name">
                Name *
              </label>
              <input
                id="cat-name"
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (errors.name) setErrors({});
                }}
                placeholder="Vegan bakes"
                maxLength={40}
                className={`field-input ${errors.name ? "border-danger/60 focus:border-danger/60 focus:ring-danger/10" : ""}`}
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
              <span className="field-label">Icon</span>
              {iconPicker(form.icon, (v) => setForm({ ...form, icon: v }))}
              <p className="field-hint">Shown on the treats page filter chips.</p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={requestClose} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2} />
                )}
                {saving ? "Saving…" : form._id ? "Save changes" : "Add category"}
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
        title={deleting ? `Delete “${deleting.name}”?` : ""}
        body="Categories with treats can't be deleted — move those treats first."
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
        body="This category hasn't been saved — closing now loses your edits."
        confirmLabel="Discard"
        onConfirm={() => {
          setDiscardOpen(false);
          closeForm();
        }}
      />
    </div>
  );
}
