"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Search, SearchX, X, Croissant } from "lucide-react";
import TreatCard from "./TreatCard";
import { TreatCardSkeleton } from "./Skeletons";
import { CategoryGlyph } from "@/components/CategoryIcon";
import type { CategoryData, TreatData } from "@/lib/site-data";

const PAGE = 8;

export default function TreatsBrowser({
  initial,
  whatsappDigits,
  initialQ = "",
  initialCategory = "",
}: {
  initial: { treats: TreatData[]; total: number; categories: CategoryData[] };
  whatsappDigits: string;
  initialQ?: string;
  initialCategory?: string;
}) {
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [treats, setTreats] = useState<TreatData[]>(initial.treats);
  const [total, setTotal] = useState(initial.total);
  const [searching, setSearching] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(initial.treats.length >= initial.total);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const firstRun = useRef(true);
  const reqId = useRef(0);

  const fetchPage = useCallback(
    async (query: string, cat: string, offset: number, append: boolean) => {
      const id = ++reqId.current;
      const params = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
      if (query) params.set("q", query);
      if (cat) params.set("category", cat);
      const res = await fetch(`/api/treats?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (id !== reqId.current) return; // a newer request superseded this one
      setLoadError(false);
      setTotal(data.total);
      setReachedEnd(offset + data.treats.length >= data.total);
      setTreats((list) => (append ? [...list, ...data.treats] : data.treats));
    },
    [],
  );

  /* search + category: refetch page 1 (client-side, keeps input focus) */
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      setSearching(true);
      try {
        await fetchPage(q.trim(), category, 0, false);
      } catch {
        setLoadError(true);
      } finally {
        setSearching(false);
      }
    }, q === initialQ && category === initialCategory ? 0 : 350);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category]);

  /* infinite scroll */
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !searching && !reachedEnd && !loadError) {
          setLoadingMore(true);
          fetchPage(q.trim(), category, treats.length, true)
            .catch(() => setLoadError(true))
            .finally(() => setLoadingMore(false));
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, treats.length, loadingMore, searching, reachedEnd, loadError]);

  const chip = (c: string, label: string) => {
    const active = category === c;
    return (
      <button
        key={c || "all"}
        onClick={() => setCategory(c)}
        aria-pressed={active}
        className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
          active
            ? "bg-berry text-white"
            : "bg-white text-stone-600 ring-1 ring-cream-300 hover:text-berry hover:ring-berry/40"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-stone-500"
            strokeWidth={1.8}
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search treats"
            aria-label="Search treats"
            className="w-full rounded-full border border-cream-300 bg-white py-3.5 pr-11 pl-11 text-[14px] text-stone-700 shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-stone-400 focus:border-berry/50 focus:ring-4 focus:ring-berry/10"
          />
          {q && (
            <button
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="absolute right-3.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
        <p className="text-[13px] text-stone-500 tabular-nums" aria-live="polite">
          {searching ? "Searching…" : `${total} ${total === 1 ? "delight" : "delights"}`}
        </p>
      </div>

      {/* category chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        {chip("", "All")}
        {initial.categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setCategory(category === c.name ? "" : c.name)}
            aria-pressed={category === c.name}
            className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
              category === c.name
                ? "bg-berry text-white"
                : "bg-white text-stone-600 ring-1 ring-cream-300 hover:text-berry hover:ring-berry/40"
            }`}
          >
            <CategoryGlyph icon={c.icon} className="h-3.5 w-3.5" strokeWidth={1.8} />
            {c.name}
          </button>
        ))}
      </div>

      {/* grid */}
      {searching ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: PAGE }).map((_, i) => (
            <TreatCardSkeleton key={i} />
          ))}
        </div>
      ) : treats.length === 0 && loadError ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            <SearchX className="h-7 w-7" strokeWidth={1.6} />
          </span>
          <h3 className="mt-4 font-display text-2xl font-bold text-ink">
            The menu didn&rsquo;t load
          </h3>
          <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-stone-600">
            Something interrupted the connection. Try again in a moment.
          </p>
          <button
            onClick={() => {
              setSearching(true);
              fetchPage(q.trim(), category, 0, false)
                .catch(() => setLoadError(true))
                .finally(() => setSearching(false));
            }}
            className="mt-5 rounded-full bg-berry px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
          >
            Try again
          </button>
        </div>
      ) : treats.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl bg-white py-16 text-center ring-1 ring-cream-300">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-berry-soft text-berry-deep">
            {q ? <SearchX className="h-7 w-7" strokeWidth={1.6} /> : <Croissant className="h-7 w-7" strokeWidth={1.6} />}
          </span>
          <h3 className="mt-4 font-display text-2xl font-bold text-ink">
            {q ? `Nothing for “${q}” yet` : "No treats in this category yet"}
          </h3>
          <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-stone-600">
            {q
              ? "Try a different word — or ask us directly on WhatsApp, we love custom requests."
              : "New bakes are always in the oven. Check back soon or ask us for today's menu."}
          </p>
          {(q || category) && (
            <button
              onClick={() => {
                setQ("");
                setCategory("");
              }}
              className="mt-5 rounded-full bg-berry px-6 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-berry-deep"
            >
              Show everything
            </button>
          )}
        </div>
      ) : (
        <>
          {loadError && (
            <p role="alert" className="mt-6 rounded-xl bg-gold-soft px-4 py-3 text-center text-[13px] font-medium text-gold-ink">
              Some treats couldn&rsquo;t load — the list below may be incomplete.
            </p>
          )}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {treats.map((t, i) => (
              <TreatCard key={t._id} treat={t} whatsappDigits={whatsappDigits} priority={i < 4} />
            ))}
          </div>

          {/* sentinel + end marker */}
          <div ref={sentinel} className="h-px" />
          {loadingMore && (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <TreatCardSkeleton key={`m${i}`} />
              ))}
            </div>
          )}
          {reachedEnd && treats.length > PAGE && (
            <p className="mt-12 text-center font-hand text-2xl text-berry-deep">
              That&rsquo;s every treat on the menu — for now ♡
            </p>
          )}
        </>
      )}
    </div>
  );
}
