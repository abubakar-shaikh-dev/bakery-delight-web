"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Check, LoaderCircle, Pencil, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";
import { showToast } from "./AdminShell";

interface GalleryItem {
  _id: string;
  url: string;
  caption: string;
}

export default function GalleryManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [pendingCaption, setPendingCaption] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      const data = await res.json();
      setItems(data.images ?? []);
    } catch {
      showToast("Couldn't load the gallery.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addPhoto(url: string) {
    if (!url) return;
    setUploading(true);
    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, caption: pendingCaption }),
      });
      if (!res.ok) throw new Error("Save failed.");
      showToast("Photo added to the homepage gallery.");
      setPendingCaption("");
      load();
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function remove() {
    if (!deleting) return;
    const res = await fetch(`/api/admin/gallery/${deleting._id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Photo removed.");
      setDeleting(null);
      load();
    } else {
      showToast("Couldn't remove the photo.", "error");
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
    <div className="space-y-6">
      {/* add panel */}
      <div className="rounded-2xl bg-white p-5 shadow-xs ring-1 ring-cream-300 sm:p-6">
        <h3 className="font-display text-lg font-bold text-ink">
          Add a photo to the homepage gallery
        </h3>
        <p className="mt-0.5 text-[13px] text-stone-600">
          Square crops look best. The newest 5 photos appear on the homepage.
        </p>
        <div className="mt-4 grid items-end gap-4 sm:grid-cols-[auto_1fr]">
          <ImageUploader
            aspect={1}
            label="Choose & crop photo"
            hint="Square · up to 8 MB"
            onUploaded={addPhoto}
          />
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-stone-600">
              Caption <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              value={pendingCaption}
              onChange={(e) => setPendingCaption(e.target.value)}
              placeholder="Strawberry cream cake, ready for pickup…"
              maxLength={120}
              className="w-full rounded-xl border border-cream-300 bg-white px-4 py-2.5 text-[14px] outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-berry/50 focus:ring-4 focus:ring-berry/10"
            />
            {uploading && (
              <p className="mt-2 flex items-center gap-2 text-[13px] text-berry-deep">
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Saving to gallery…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton aspect-square rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <h3 className="font-display text-xl font-bold text-ink">
            The gallery is empty
          </h3>
          <p className="mt-1 max-w-xs text-[13px] text-stone-500">
            Upload your first photo above — it appears on the homepage instantly.
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
                      className="w-full rounded-lg border border-berry/40 px-2.5 py-1.5 text-[13px] outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => commitEdit(g)}
                      aria-label="Save caption"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-berry text-white"
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
                      className="shrink-0 text-stone-300 transition-colors hover:text-berry"
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

      {/* delete confirm */}
      {deleting && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-7 text-center shadow-2xl">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger-soft text-berry-deep">
              <Trash2 className="h-6 w-6" strokeWidth={1.8} />
            </span>
            <h3 className="mt-4 font-display text-xl font-bold text-ink">
              Remove this photo?
            </h3>
            <p className="mt-1.5 text-[13px] text-stone-500">
              It will also be deleted from Cloudinary.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-full px-5 py-2.5 text-[13px] font-medium text-stone-500 transition-colors hover:bg-stone-100"
              >
                Keep it
              </button>
              <button
                onClick={remove}
                className="rounded-full bg-berry-deep px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-danger"
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
