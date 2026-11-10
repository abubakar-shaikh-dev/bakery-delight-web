"use client";

import { useState } from "react";
import { CircleCheck, LoaderCircle, Send } from "lucide-react";
import { isOptionalPhone } from "@/lib/utils";

export default function ContactForm({ whatsappDigits }: { whatsappDigits: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please tell us your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Please enter a valid email address.");
    if (!isOptionalPhone(form.phone.trim()))
      return setError("That phone number doesn't look right — digits, spaces and + only.");
    if (form.message.trim().length < 5)
      return setError("Please write a short message.");

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-xs ring-1 ring-cream-300">
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
          <CircleCheck className="h-7 w-7" strokeWidth={1.8} />
        </span>
        <h3 className="font-display text-2xl font-bold text-ink">
          Message received
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-stone-500">
          Thank you for reaching out — we&rsquo;ll get back to you within a day.
          Need something urgent?{" "}
          {whatsappDigits ? (
            <a
              href={`https://wa.me/${whatsappDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-wa underline decoration-wa/40 underline-offset-2"
            >
              Message us on WhatsApp
            </a>
          ) : (
            <span className="font-semibold text-stone-600">reply to our email</span>
          )}
          .
        </p>
      </div>
    );
  }

  const inputCls = "field-input py-3";
  const labelCls = "field-label";

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream-300 md:p-8"
    >
      <h3 className="font-display text-2xl font-bold text-ink">
        Send us a message
      </h3>
      <p className="mt-1 text-[13px] text-stone-600">
        Tell us about your celebration — flavours, date, servings, anything.
      </p>

      {error && (
        <p role="alert" className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ct-name" className={labelCls}>
            Your name *
          </label>
          <input
            id="ct-name"
            value={form.name}
            onChange={set("name")}
            placeholder="Ayesha Khan"
            className={inputCls}
            maxLength={80}
          />
        </div>
        <div>
          <label htmlFor="ct-email" className={labelCls}>
            Email *
          </label>
          <input
            id="ct-email"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            className={inputCls}
            maxLength={120}
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="ct-phone" className={labelCls}>
          Phone / WhatsApp <span className="font-normal text-stone-500">(optional)</span>
        </label>
        <input
          id="ct-phone"
          value={form.phone}
          onChange={set("phone")}
          placeholder="+91 98765 43210"
          className={inputCls}
          maxLength={24}
        />
      </div>

      <div className="mt-4">
        <label htmlFor="ct-msg" className={labelCls}>
          Your message *
        </label>
        <textarea
          id="ct-msg"
          value={form.message}
          onChange={set("message")}
          placeholder="Hello — I'd love a strawberry cream cake for 12 people on the 24th…"
          rows={5}
          maxLength={2000}
          className={`${inputCls} resize-none`}
        />
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
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
