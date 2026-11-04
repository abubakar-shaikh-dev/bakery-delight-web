"use client";

import { useEffect, useState } from "react";
import {
  AtSign,
  CakeSlice,
  Globe,
  LoaderCircle,
  MapPin,
  MessageCircle,
  Phone,
  Save,
} from "lucide-react";
import { IconFacebook, IconInstagram, IconPinterest, IconWhatsApp, IconYoutube } from "../icons";
import { showToast } from "./AdminShell";

interface Settings {
  bakeryName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  whatsappDigits: string;
  email: string;
  address: string;
  socials: {
    instagram: string;
    whatsapp: string;
    pinterest: string;
    facebook: string;
    youtube: string;
  };
}

const inputCls = "field-input";
const labelCls = "field-label";

export default function SettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    if (settings.whatsappDigits && !/^\d{6,15}$/.test(settings.whatsappDigits.replace(/\D/g, "")))
      return showToast("WhatsApp digits should be country code + number, digits only (e.g. 919876543210).", "error");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Save failed.");
      showToast("Settings saved — the site is updated.");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (!settings) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  const set = (key: keyof Settings, value: string) =>
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  const setSocial = (key: keyof Settings["socials"], value: string) =>
    setSettings((s) => (s ? { ...s, socials: { ...s.socials, [key]: value } } : s));

  const socialInputs = [
    { key: "instagram" as const, label: "Instagram URL", icon: <IconInstagram className="h-4 w-4" /> },
    { key: "whatsapp" as const, label: "WhatsApp link", icon: <IconWhatsApp className="h-4 w-4" /> },
    { key: "pinterest" as const, label: "Pinterest URL", icon: <IconPinterest className="h-4 w-4" /> },
    { key: "facebook" as const, label: "Facebook URL", icon: <IconFacebook className="h-4 w-4" /> },
    { key: "youtube" as const, label: "YouTube URL", icon: <IconYoutube className="h-4 w-4" /> },
  ];

  return (
    <form onSubmit={save} className="space-y-6">
      {/* bakery identity */}
      <section className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream-300">
        <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <CakeSlice className="h-5 w-5 text-berry" strokeWidth={1.8} />
          Bakery identity
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Bakery name</label>
            <input
              value={settings.bakeryName}
              onChange={(e) => set("bakeryName", e.target.value)}
              className={inputCls}
              maxLength={60}
            />
          </div>
          <div>
            <label className={labelCls}>Tagline (shown in footer)</label>
            <input
              value={settings.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className={inputCls}
              maxLength={60}
            />
          </div>
        </div>
      </section>

      {/* contact */}
      <section className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream-300">
        <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <Phone className="h-5 w-5 text-berry" strokeWidth={1.8} />
          Contact details
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Phone (display)</label>
            <input
              value={settings.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>WhatsApp number (display)</label>
            <input
              value={settings.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>
              WhatsApp digits <span className="font-normal text-stone-400">(for wa.me links, e.g. 919876543210)</span>
            </label>
            <input
              value={settings.whatsappDigits}
              onChange={(e) => set("whatsappDigits", e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              value={settings.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>
              <MapPin className="mr-1 inline h-3.5 w-3.5" strokeWidth={1.8} />
              Address
            </label>
            <input
              value={settings.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </section>

      {/* socials */}
      <section className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-cream-300">
        <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <Globe className="h-5 w-5 text-berry" strokeWidth={1.8} />
          Social links
        </h3>
        <p className="mt-1 text-[13px] text-stone-500">
          Leave a field empty to hide that icon from the footer and contact page.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {socialInputs.map((s) => (
            <div key={s.key}>
              <label className={labelCls}>{s.label}</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-berry-deep">
                  {s.icon}
                </span>
                <input
                  value={settings.socials[s.key]}
                  onChange={(e) => setSocial(s.key, e.target.value)}
                  placeholder="https://…"
                  className={`${inputCls} pl-10`}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-berry px-7 py-3 text-[14px] font-medium text-white transition-colors hover:bg-berry-deep disabled:opacity-60"
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" strokeWidth={1.8} />
          )}
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>

      <p className="flex items-center gap-2 text-[12px] text-stone-500">
        <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
        The WhatsApp digits power every “Order on WhatsApp” button across the site.
      </p>
      <p className="flex items-center gap-2 text-[12px] text-stone-500">
        <AtSign className="h-3.5 w-3.5" strokeWidth={1.8} />
        Contact form submissions appear under Messages.
      </p>
    </form>
  );
}
