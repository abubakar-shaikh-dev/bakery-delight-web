"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { CATEGORY_ICONS, CategoryGlyph } from "../CategoryIcon";
import { ConfirmDrawer } from "./Drawer";
import LoadError from "./LoadError";
import { showToast } from "./AdminShell";

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("sparkles");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("sparkles");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [loadError, setLoadError] = useState(false);

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

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return showToast("Give the category a name.", "error");
    setAdding(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, icon: newIcon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't add the category.");
      showToast(`"${data.category.name}" added.`);
      setNewName("");
      setNewIcon("sparkles");
      load();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setAdding(false);
    }
  }

  async function rename(category: Category) {
    if (!editName.trim()) return showToast("Name can't be empty.", "error");
    setBusyId(category._id);
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, icon: editIcon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed.");
      showToast("Category updated.");
      setEditingId(null);
      load();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setBusyId(null);
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
          onClick={() => onChange(i.key)}
          className={`grid h-9 w-9 place-items-center rounded-lg border transition-colors ${
            value === i.key
              ? "border-berry bg-berry-soft text-berry"
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
      {/* add */}
      <form
        onSubmit={add}
        className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream-300 sm:p-6"
      >
        <h3 className="font-display text-lg font-bold text-ink">Add a category</h3>
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-[1fr_auto_auto]">
          <div>
            <label className="field-label" htmlFor="cat-name">
              Name
            </label>
            <input
              id="cat-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Vegan bakes"
              maxLength={40}
              className="field-input"
            />
          </div>
          <div>
            <p className="field-label">Icon</p>
            {iconPicker(newIcon, setNewIcon)}
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={adding} className="btn-primary h-[42px] w-full lg:w-auto">
              {adding ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" strokeWidth={2} />
              )}
              Add category
            </button>
          </div>
        </div>
      </form>

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
            Add one above — it appears instantly as a filter on the treats page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((c, idx) => {
            const editing = editingId === c._id;
            return (
              <article
                key={c._id}
                className="rounded-2xl bg-white p-4 shadow-xs ring-1 ring-cream-300"
              >
                {editing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="field-label" htmlFor="cat-edit-name">
                        Name
                      </label>
                      <input
                        id="cat-edit-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        maxLength={40}
                        className="field-input"
                        autoFocus
                      />
                    </div>
                    <div>
                      <p className="field-label">Icon</p>
                      {iconPicker(editIcon, setEditIcon)}
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} className="btn-ghost">
                        Cancel
                      </button>
                      <button
                        onClick={() => rename(c)}
                        disabled={busyId === c._id}
                        className="btn-primary"
                      >
                        {busyId === c._id ? (
                          <LoaderCircle className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" strokeWidth={2} />
                        )}
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
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
                        onClick={() => {
                          setEditingId(c._id);
                          setEditName(c.name);
                          setEditIcon(c.icon);
                        }}
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
                )}
              </article>
            );
          })}
        </div>
      )}

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
    </div>
  );
}
