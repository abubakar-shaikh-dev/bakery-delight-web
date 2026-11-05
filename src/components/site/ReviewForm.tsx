"use client";

import { useState } from "react";
import { LoaderCircle, Send, Star } from "lucide-react";
import { IconHeart } from "../icons";
import { isOptionalUrl } from "@/lib/utils";

const PLATFORMS = ["Instagram", "WhatsApp", "Facebook", "Google", "Other"];

export default function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [socialPlatform, setSocialPlatform] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Please add your name.");
    if (!rating) return setError("Please pick a star rating.");
    if (text.trim().length < 10)
      return setError("Your review should be at least 10 characters.");
    if (!isOptionalUrl(socialUrl.trim()))
      return setError("The link should start with https://");

    setStatus("sending");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rating,
          text,
          socialPlatform: socialPlatform || null,
          socialUrl: socialUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError((err as Error).message);
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-xs ring-1 ring-cream-300">
        <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-berry-soft text-berry-deep">
          <IconHeart className="h-6 w-6" />
        </span>
        <h3 className="font-display text-2xl font-bold text-ink">
          Thank you, {name.split(" ")[0]}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-stone-600">
          Your review means the world to our little kitchen. It will appear here
          once it&rsquo;s been through a quick check.
        </p>
      </div>
    );
  }

  const inputCls = "field-input py-3";

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream-300 md:p-8"
    >
      <h3 className="font-display text-2xl font-bold text-ink">
        Share your experience
      </h3>
      <p className="mt-1 text-[13px] text-stone-600">
        Bought something sweet? Tell us how it tasted — it keeps our little
        kitchen going.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-[13px] font-medium text-berry-deep">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rv-name" className="field-label">
            Your name
          </label>
          <input
            id="rv-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ayesha K."
            className={inputCls}
            maxLength={60}
          />
        </div>
        <div>
          <span className="field-label" id="rv-rating-label">
            Your rating
          </span>
          <div
            role="radiogroup"
            aria-labelledby="rv-rating-label"
            className="flex h-[46px] items-center gap-1.5"
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={i === rating}
                aria-label={`${i} star${i > 1 ? "s" : ""}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className="grid h-9 w-9 place-items-center rounded-full transition-colors"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    i <= (hover || rating)
                      ? "fill-gold text-gold"
                      : "text-cream-400"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="rv-text" className="field-label">
          Your review
        </label>
        <textarea
          id="rv-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="The cake was not only beautiful but tasted even better…"
          rows={4}
          maxLength={600}
          className={`${inputCls} resize-none`}
        />
        <p className="mt-1 text-right text-[11px] text-stone-400">{text.length}/600</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="rv-platform" className="field-label">
            Social platform <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <select
            id="rv-platform"
            value={socialPlatform}
            onChange={(e) => setSocialPlatform(e.target.value)}
            className={`${inputCls} appearance-none`}
          >
            <option value="">Select…</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="rv-url" className="field-label">
            Link to your post
          </label>
          <input
            id="rv-url"
            value={socialUrl}
            onChange={(e) => setSocialUrl(e.target.value)}
            placeholder="https://instagram.com/p/…"
            className={inputCls}
            type="url"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-berry px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-berry-deep disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" strokeWidth={1.8} />
        )}
        {status === "sending" ? "Sending…" : "Send review"}
      </button>
    </form>
  );
}
