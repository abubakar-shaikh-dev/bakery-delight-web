"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, ImagePlus, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import ImageUploader, { type RatioOption } from "./ImageUploader";
import { AdminDrawer, ConfirmDrawer } from "./Drawer";
import LoadError from "./LoadError";
import { showToast } from "./AdminShell";

/** The three shapes the bento wall holds without heavy cropping. */
const GALLERY_RATIOS: RatioOption[] = [
  { value: "1:1", label: "Square" },
  { value: "16:9", label: "Wide" },
  { value: "9:16", label: "Tall" },
];

interface GalleryItem {
  _id: string;
  url: string;
  caption: string;
  ratio: string;
}

interface FormState {
  image: string;
  publicId: string | null;
  ratio: string;
  caption: string;
}

const emptyForm: FormState = { image: "", publicId: null, ratio: "1:1", caption: "" };

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ image?: string }>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);
  const [removing, setRemoving] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch("/api/admin/gallery");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.images ?? []);
    } catch {
      setLoadError(true);
      showToast("Couldn't load the gallery.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const closeForm = useCallback(() => {
    setForm(null);
    setErrors({});
  }, []);

  /* Unsaved work: a cropped photo or a typed caption counts. */
  const dirty =
    form !== null && (form.image !== "" || form.caption.trim() !== "");

  const requestClose = useCallback(() => {
    if (dirty) setDiscardOpen(true);
    else closeForm();
  }, [dirty, closeForm]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    if (!form.image) {
      setErrors({ image: "Choose and crop a photo first." });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: form.image,
          caption: form.caption,
          ratio: form.ratio,
          cloudinaryPublicId: form.publicId,
        }),
      });
      if (!res.ok) throw new Error("Save failed.");
      showToast("Photo added to the gallery.");
      closeForm();
      load();
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
      const res = await fetch(`/api/admin/gallery/${deleting._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Couldn't remove the photo.");
      showToast("Photo removed.");
      setDeleting(null);
      load();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setRemoving(false);
    }
  }

  function startEdit(item: GalleryItem) {
    setEditingId(item._id);
    setEditCaption(item.caption);
  }

  async function commitEdit(item: GalleryItem) {
    try {
      const res = await fetch(`/api/admin/gallery/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption }),
      });
      if (!res.ok) throw new Error();
      setItems((list) =>
        list.map((x) => (x._id === item._id ? { ...x, caption: editCaption.trim() } : x)),
      );
      setEditingId(null);
      showToast("Caption updated.");
    } catch {
      showToast("Couldn't update the caption.", "error");
    }
  }

  return (
    <div className="space-y-5">
      {/* toolbar — same shape as the other managers */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[13px] text-stone-600 tabular-nums">
          {items.length} photo{items.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => setForm({ ...emptyForm })}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-berry px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Add photo
        </button>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton aspect-square rounded-2xl" />
          ))}
        </div>
      ) : loadError ? (
        <LoadError label="The gallery couldn't be loaded." onRetry={load} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <ImagePlus className="h-7 w-7" strokeWidth={1.8} />
          </span>
          <h3 className="mt-4 font-display text-xl font-bold text-ink">
            The gallery is empty
          </h3>
          <p className="mt-1 max-w-xs text-[13px] text-stone-500">
            Add your first photo — the newest 5 appear on the homepage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((g) => (
            <figure
              key={g._id}
              className="group overflow-hidden rounded-2xl bg-white shadow-xs ring-1 ring-cream-300"
            >
              <div className="relative aspect-square">
                {g.url && (
                  <Image
                    src={g.url}
                    alt={g.caption || "Gallery photo"}
                    fill
                    sizes="(min-width:1024px) 25vw, 46vw"
                    className="object-cover"
                  />
                )}
                {/* Always visible on touch; revealed on hover/focus with a pointer */}
                <button
                  onClick={() => setDeleting(g)}
                  aria-label="Delete photo"
                  className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-stone-500 shadow-sm opacity-100 transition-opacity hover:text-berry-deep sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
              <figcaption className="p-3">
                {editingId === g._id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          commitEdit(g);
                        }
                      }}
                      aria-label="Edit caption"
                      className="w-full rounded-lg border border-berry/40 px-2.5 py-1.5 text-[13px] outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => commitEdit(g)}
                      aria-label="Save caption"
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-berry text-white"
                    >
                      <Check className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[12px] text-stone-500">
                      {g.caption || <span className="text-stone-300">No caption</span>}
                    </p>
                    <button
                      onClick={() => startEdit(g)}
                      aria-label="Edit caption"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cream-100 text-stone-400 transition-colors hover:bg-berry-soft hover:text-berry"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.8} />
                    </button>
                  </div>
                )}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* add drawer */}
      <AdminDrawer
        open={form !== null}
        onOpenChange={(open) => {
          if (!open) requestClose();
        }}
        onCloseRequest={requestClose}
        title="New photo"
        dismissible={false}
      >
        {form && (
          <form onSubmit={save} className="space-y-4">
            <div>
              <ImageUploader
                ratios={GALLERY_RATIOS}
                label="Photo *"
                hint="Square, wide or tall · up to 8 MB"
                initialUrl={form.image}
                onUploaded={(url, publicId, ratio) => {
                  setForm((f) =>
                    f
                      ? {
                          ...f,
                          image: url,
                          publicId: publicId ?? null,
                          ratio: ratio ?? f.ratio,
                        }
                      : f,
                  );
                  if (errors.image) setErrors({});
                }}
              />
              {errors.image && (
                <p className="field-invalid" role="alert">
                  {errors.image}
                </p>
              )}
              <p className="field-hint">
                Pick a shape while cropping. The newest 5 photos appear on the homepage.
              </p>
            </div>

            <div>
              <label className="field-label" htmlFor="gallery-caption">
                Caption <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                id="gallery-caption"
                value={form.caption}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                placeholder="Strawberry cream cake, ready for pickup…"
                maxLength={120}
                className="field-input"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={requestClose} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {saving ? "Adding…" : "Add to gallery"}
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
        title="Remove this photo?"
        body="It will also be deleted from storage."
        busy={removing}
        onConfirm={remove}
      />

      {/* discard unsaved work */}
      <ConfirmDrawer
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title="Discard this photo?"
        tone="discard"
        body="The cropped photo and caption haven't been added yet — closing now loses them."
        confirmLabel="Discard"
        onConfirm={closeForm}
      />
    </div>
  );
}
