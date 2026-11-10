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
import LoadError from "./LoadError";
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
  const [baseline, setBaseline] = useState<Settings | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [waError, setWaError] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/settings")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (!cancelled) {
          if (data.settings) {
            setSettings(data.settings);
            setBaseline(data.settings);
          } else throw new Error();
          setLoadError(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function load() {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.settings) {
        setSettings(data.settings);
        setBaseline(data.settings);
      } else throw new Error();
      setLoadError(false);
    } catch {
      setLoadError(true);
    }
  }

  /* Pristine form: Save stays quiet until something actually changed. */
  const dirty =
    settings !== null &&
    baseline !== null &&
    JSON.stringify(settings) !== JSON.stringify(baseline);

  const invalidWa = (v: string) =>
    v.length > 0 && !/^\d{6,15}$/.test(v.replace(/\D/g, ""));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    if (invalidWa(settings.whatsappDigits)) {
      setWaError("Use country code + number, digits only (e.g. 919876543210).");
      document.getElementById("set-wa-digits")?.focus();
      return;
    }
    setWaError(undefined);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Save failed.");
      setBaseline(settings);
      showToast("Settings saved — the site is updated.");
    } catch (err) {
      showToast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loadError) {
    return (
      <LoadError
        label="The settings couldn't be loaded."
        onRetry={load}
      />
    );
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
      <section className="admin-card">
        <h3 className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
          <CakeSlice className="h-5 w-5 text-stone-500" strokeWidth={1.8} />
          Bakery identity
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="set-bakery-name">
              Bakery name
            </label>
            <input
              id="set-bakery-name"
              value={settings.bakeryName}
              onChange={(e) => set("bakeryName", e.target.value)}
              className={inputCls}
              maxLength={60}
              autoComplete="organization"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="set-tagline">
              Tagline (shown in footer)
            </label>
            <input
              id="set-tagline"
              value={settings.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              className={inputCls}
              maxLength={60}
            />
          </div>
        </div>
      </section>

      {/* contact */}
      <section className="admin-card">
        <h3 className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
          <Phone className="h-5 w-5 text-stone-500" strokeWidth={1.8} />
          Contact details
        </h3>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="set-phone">
              Phone (display)
            </label>
            <input
              id="set-phone"
              value={settings.phone}
              onChange={(e) => set("phone", e.target.value)}
              className={inputCls}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="set-wa-number">
              WhatsApp number (display)
            </label>
            <input
              id="set-wa-number"
              value={settings.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              className={inputCls}
              type="tel"
              inputMode="tel"
            />
            {settings.whatsappDigits && !settings.whatsappNumber && (
              <p className="field-hint">
                Digits stay behind the scenes — add the display number so the
                contact page can show it.
              </p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="set-wa-digits">
              WhatsApp digits <span className="font-normal text-stone-500">(for wa.me links, e.g. 919876543210)</span>
            </label>
            <input
              id="set-wa-digits"
              value={settings.whatsappDigits}
              onChange={(e) => {
                set("whatsappDigits", e.target.value);
                if (waError) setWaError(undefined);
              }}
              onBlur={() => {
                if (settings && invalidWa(settings.whatsappDigits))
                  setWaError("Use country code + number, digits only (e.g. 919876543210).");
              }}
              className={`${inputCls} ${waError ? "border-danger/60 focus:border-danger/60 focus:ring-danger/10" : ""}`}
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={Boolean(waError)}
            />
            {waError && (
              <p className="field-invalid" role="alert">
                {waError}
              </p>
            )}
            {!settings.whatsappDigits && !waError && (
              <p className="field-hint">
                Every Order on WhatsApp button on the site disappears while
                this is empty.
              </p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="set-email">
              Email
            </label>
            <input
              id="set-email"
              type="email"
              value={settings.email}
              onChange={(e) => set("email", e.target.value)}
              className={inputCls}
              autoComplete="email"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="set-address">
              <MapPin className="mr-1 inline h-4 w-4" strokeWidth={1.8} />
              Address
            </label>
            <input
              id="set-address"
              value={settings.address}
              onChange={(e) => set("address", e.target.value)}
              className={inputCls}
              autoComplete="street-address"
            />
          </div>
        </div>
      </section>

      {/* socials */}
      <section className="admin-card">
        <h3 className="flex items-center gap-2.5 text-[15px] font-semibold text-ink">
          <Globe className="h-5 w-5 text-stone-500" strokeWidth={1.8} />
          Social links
        </h3>
        <p className="mt-1 text-[13px] text-stone-500">
          Leave a field empty to hide that icon from the footer and contact page.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {socialInputs.map((s) => (
            <div key={s.key}>
              <label className={labelCls} htmlFor={`set-social-${s.key}`}>
                {s.label}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-berry-deep">
                  {s.icon}
                </span>
                <input
                  id={`set-social-${s.key}`}
                  type="url"
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

      <div className="flex items-center justify-end gap-3">
        {!dirty && (
          <span id="set-unchanged-hint" className="text-[12px] text-stone-500">
            No changes yet
          </span>
        )}
        <button
          type="submit"
          disabled={saving || !dirty}
          aria-describedby={dirty ? undefined : "set-unchanged-hint"}
          className="btn-primary"
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
        <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
        The WhatsApp digits power every “Order on WhatsApp” button across the site.
      </p>
      <p className="flex items-center gap-2 text-[12px] text-stone-500">
        <AtSign className="h-4 w-4" strokeWidth={1.8} />
        Contact form submissions appear under Messages.
      </p>
    </form>
  );
}
